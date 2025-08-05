import { upfetch } from "#app/lib/fetch.js";
import { Form, redirect, redirectDocument, useNavigation } from "react-router";
import { alias } from "../schema";
import type { Route } from "./+types/home";
import { z } from "zod";
import { toast, Toaster } from "sonner";
import { Copy, Forward, Trash } from "lucide-react";
import { useRef } from "react";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Temp Mail Service" },
    { name: "description", content: "Securely send your mail!" },
  ]
}

export async function loader({ request }: Route.LoaderArgs) {
  try {
    const res = await upfetch("/me", {
      credentials: "include",
      headers: {
        Cookie: request.headers.get("Cookie") || "",
      },
      schema: z.object({
        alias: z.array(alias),
        user: z.object({
          name: z.string().nullish(),
          email: z.string(),
        })
      })
    });

    console.log(res)

    return res
  } catch (error) {
    console.error(error)
    return null
  }
}

export async function action({ request }: Route.ActionArgs) {

  const formData = await request.formData();

  console.log(formData)

  if (formData.get("_action") === "login") {
    const clientUrl = process.env.NODE_ENV === "production" ? process.env.API_URL! : 'http://localhost:4000';
    const baseUrl = clientUrl.replace(/\/$/, '');

    console.log(baseUrl)

    return redirectDocument(`${baseUrl}/api/auth/google`);
  }


  if (formData.get('_action') === 'logout') {


    return redirect('/', {
      headers: {
        "Set-Cookie": "token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=None; Secure"
      }
    })
  }

  if (formData.get("_action") === "addAlias") {
    try {
      const alias = formData.get("alias") as string;

      const response = await upfetch("/alias", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Cookie": request.headers.get("Cookie") || "",
        },
        body: JSON.stringify({
          alias: alias.toLowerCase(),
        }),
      });

      // If successful, redirect to refresh the page
      return redirect('/');

    } catch (error: any) {
      console.error(error);

      // Extract error message from the response
      let errorMessage = "Failed to add alias";

      if (error.data) {
        errorMessage = error.data;
      } else if (error.message) {
        errorMessage = error.message;
      }

      return { error: errorMessage };
    }
  }

  if (formData.get("_action") === "deleteAlias") {
    const id = formData.get("id") as string;
    const response = await upfetch(`/alias/${id}`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Cookie": request.headers.get("Cookie") || "",
      },
    });

    // If successful, redirect to refresh the page
    return redirect('/');
  }

  if (formData.get("_action") === "toggleStatus") {
    const id = formData.get("id") as string;
    const status = formData.get("status") as string;
    const response = await upfetch(`/alias/${id}`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Cookie": request.headers.get("Cookie") || "",
      },
      body: JSON.stringify({
        isActive: status.toLowerCase() === 'true'
      }),
    });

    // If successful, redirect to refresh the page
    return redirect('/');
  }

  return null;

}

export default function Home({ loaderData, actionData }: Route.ComponentProps) {

  const loading = useNavigation().state !== "idle";
  const inputRef = useRef<HTMLInputElement>(null);


  return (
    <div className="min-h-svh   p-10">
      <Toaster />


      {actionData?.error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 font-medium">Error: {actionData.error}</p>
        </div>
      )}

      {
        loaderData ? <div>

          <div>
            <div className="w-full ">
              <div className="container w-full py-8">
                {/* Header */}
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-zinc-900 rounded-lg">
                      <Forward className="h-4 w-4 text-white " />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">Snehaa Mail</h1>
                  </div>
                  <p className="text-gray-600">Manage your email aliases and forwarding rules</p>
                  <Form method="post" >
                    <input type="hidden" name="_action" value="logout" />
                    <button className="cursor-pointer my-2 underline" type="submit">Logout</button>
                  </Form>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 ">
                  {!loaderData.alias.length ? (
                    <div>
                      <p className="text-gray-600">No aliases found</p>
                    </div>
                  ) : loaderData.alias.map((alias) => (
                    <div key={alias.id}>
                      <div className="p-6 border-1 border-slate-900/10 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-1 mb-2">
                              <h3 className="font-semibold text-lg">{alias.alias}</h3>
                              <div className={`px-2 py-1 rounded-md text-xs ${alias.isActive ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"}`}>
                                {alias.isActive ? "Active" : "Inactive"}
                              </div>
                              <Form method="post" >
                                <input type="hidden" name="_action" value="toggleStatus" />
                                <input type="hidden" name="id" value={alias.id} />
                                <input type="hidden" name="status" value={String(alias.isActive)} />
                                <button type="submit" className="cursor-pointer" onClick={(e) => e.stopPropagation()} />
                              </Form>

                              <Form method="POST" >
                                <input type="hidden" name="_action" value="toggleStatus" />
                                <input type="hidden" name="id" value={alias.id} />
                                <input type="hidden" name="status" value={String(alias.isActive)} />
                                <input type="checkbox" onClick={(e) => {
                                  e.currentTarget.form?.submit();
                                }} checked={alias.isActive} className="bg-zinc-950 cursor-pointer" />
                              </Form>
                              <button onClick={() => {
                                navigator.clipboard.writeText(`${alias.alias}@${alias.domain}`)
                                toast('Copied to clipboard')
                              }}>
                                <Copy className="h-4 w-4 cursor-pointer" />
                              </button>
                            </div>

                            <div className="flex flex-col gap-4 text-sm text-gray-500">
                              <span>{alias.emailCount} emails forwarded</span>
                              <span>Created {new Date(alias.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex items-start ">
                            <Form method="POST" className="">
                              <input type="hidden" name="_action" value="deleteAlias" />
                              <input type="hidden" name="id" value={alias.id} />
                              <button type="submit">
                                <Trash className="h-4 w-4 cursor-pointer" />
                              </button>
                            </Form>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <Form method="POST" onSubmit={e => {
            e.preventDefault();
            e.currentTarget.submit();
            e.currentTarget.reset();
            e.currentTarget.focus();
            inputRef.current?.focus();
          }} className="flex gap-2 mb-8">
            <input name="alias" ref={inputRef} required minLength={4} type="text" placeholder="Email Alias" className="w-fit border-1 border-zinc-800/20 p-2 rounded-sm " />
            <input type="hidden" name="_action" value="addAlias" />
            <button className="cursor-pointer bg-zinc-700 text-white px-5 rounded-sm" type="submit">
              {loading ? "Loading..." : "Add Alias"}
            </button>
          </Form>


        </div> : (
          <div className="flex flex-col justify-center items-center gap-4">

            <h1 className="text-3xl font-bold">MailForwarder</h1>

            <p className="text-gray-600 text-center max-w-md">
              Manage your email aliases and forwarding rules,
              Protect your privacy by creating disposable email aliases that forward to your real address. Never expose your actual email to services - create unique aliases for each one and maintain control over your inbox.
            </p>




            <Form method="post" navigate={true}>
              <input type="hidden" name="_action" value="login" />
              <button className="cursor-pointer bg-zinc-950 text-white px-5 py-2 rounded-lg" type="submit">Sign In with Google</button>
            </Form>
          </div>
        )
      }


    </div>
  )
}