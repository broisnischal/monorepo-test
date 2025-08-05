import Elysia, { Context, redirect } from "elysia";
import { oauth2 } from "elysia-oauth2";
import { sign } from "jsonwebtoken";
import { db } from "../prisma";

const clientId = '1056439603823-3e2eingmepl6ah85hgq369fg1gr3a8d8.apps.googleusercontent.com'
const clientSecret = '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'
const URI = process.env.NODE_ENV === "production" ? `${process.env.API_URL}/auth/google/callback` : 'http://localhost:4000/api/auth/google/callback'

console.log(process.env.NODE_ENV)
console.log(process.env.API_URL)

const provider = new Elysia({})
  .decorate("db", db)
  .use(
    oauth2(
      {
        Google: [
          clientId,
          clientSecret,
          URI
        ],
      },
      {
        cookie: {
          name: "token",
          secure: true,
          sameSite: "lax",
          path: "/",
          httpOnly: true,
          maxAge: 60 * 30, // 30 min
        },
      },
    ),
  )
  .get(
    "/auth/google",
    async ({ oauth2, redirect }: { oauth2: any; redirect: any }) => {
      const url = oauth2.createURL("Google", ["email"]);
      url.searchParams.set("access_type", "offline");

      return redirect(url.href);
    },
  )
  .get(
    "/auth/google/callback",
    async ({
      oauth2,
      db,
      cookie: { token },
      redirect,
    }: Context & { db: any; oauth2: any }) => {
      const tokens = await oauth2.authorize("Google");

      const accessToken = tokens.accessToken();

      const userInfo = await fetch(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      ).then((res) => res.json());

      const { email, name, id: googleId } = userInfo;

      const alias = email.split("@")[0];

      const user = await db.user.upsert({
        where: { email },
        update: { name },
        create: {
          email,
          name,
          connections: {
            create: {
              providerName: "google",
              providerId: googleId,
            },
          },
          aliases: {
            create: {
              alias,
              email: {
                create: {
                  address: email,
                },
              },
            },
          },
          // subscription: {
          //   create: {},
          // },
        },
      });

      const appToken = sign(
        {
          sub: user.id,
          email: user.email,
          provider: "google",
        },
        process.env.JWT_SECRET!,
        {
          expiresIn: "30d",
        },
      );

      token.set({
        domain: process.env.CLIENT_URL ? new URL(process.env.CLIENT_URL).hostname : 'localhost',
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === 'production',
        value: appToken,
      });

      return redirect(process.env.CLIENT_URL!);
    },
  );

export default provider;
