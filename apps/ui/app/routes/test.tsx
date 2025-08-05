import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const EmailFormSchema = z.object({
    type: z.literal("email"),
    email: z.email("Invalid email address"),
    subject: z.string().min(1, "Subject is required"),
});

const PhoneFormSchema = z.object({
    type: z.literal("phone"),
    phoneNumber: z.string().regex(/^\d{10}$/, "Invalid phone number"),
    message: z.string().optional(),
});

const FormSchema = z.discriminatedUnion("type", [
    EmailFormSchema,
    PhoneFormSchema,
]);

type FormValues = z.infer<typeof FormSchema>;

export default function Test() {
    const { register, handleSubmit, watch, formState: { errors } } = useForm<FormValues>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            type: "email",
        },
    });

    const watchedType = watch("type");

    const onSubmit = (data: FormValues) => {
        console.log(data);
    };

    return (
        <div className="container mx-auto w-full max-w-md my-10">
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2">
                <select className="border-2 border-gray-300 rounded-md p-2" {...register("type")}>
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                </select>

                {watchedType === "email" && (
                    <>
                        <input className="border-2 border-gray-300 rounded-md p-2"   {...register("email")} placeholder="Email" />
                        {"email" in errors && errors.email && <span>{errors.email.message}</span>}
                        <input className="border-2 border-gray-300 rounded-md p-2" {...register("subject")} placeholder="Subject" />
                        {"subject" in errors && errors.subject && <span>{errors.subject.message}</span>}
                    </>
                )}

                {watchedType === "phone" && (
                    <>
                        <input className="border-2 border-gray-300 rounded-md p-2" {...register("phoneNumber")} placeholder="Phone Number" />
                        {"phoneNumber" in errors && errors.phoneNumber && <span>{errors.phoneNumber.message}</span>}                    <input className="border-2 border-gray-300 rounded-md p-2" {...register("message")} placeholder="Message (Optional)" />
                    </>
                )}

                <button className="bg-blue-500 text-white rounded-md p-2" type="submit">Submit</button>
            </form>
        </div>
    );
}