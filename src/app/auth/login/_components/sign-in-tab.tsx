"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import z from "zod"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { Button } from "@/components/ui/button"
import { LoadingSwap } from "@/components/ui/loading-swap"
import { LOGIN_MUTATION, SIGNUP_MUTATION } from "@/lib/graphql/mutations/authMutations";
import { toast } from "sonner"
import { useMutation } from "@apollo/client/react";
import { useRouter } from "next/navigation";

const signInSchema = z.object({
  email: z.email().min(1, "Email is required"),
  password: z.string().min(6, "Password is required"),
})

type SignInForm = z.infer<typeof signInSchema>

export default function SignInTab({
    openEmailVerificationTab,
    openForgotPassword,
}:{
    openEmailVerificationTab: (email: string) => void,
    openForgotPassword: () => void
}) {
    const router = useRouter()
    const [login, { loading, client }] = useMutation(LOGIN_MUTATION)
    const form = useForm<SignInForm>({
        resolver: zodResolver(signInSchema),
        defaultValues: {
        email: "",
        password: "",
        }
    })

    async function handleSignIn(data: SignInForm) {
        const res = await login({
            variables: {
                data: {
                    email: data.email,
                    password: data.password
                }
            }
        });

        const { status, user } = res.data?.login || {};

        if(res.error){
            const message = res.error.message;
            toast.error("Invalid email or password");
        }

        if (status === "SUCCESS" && user) {
            if (!user.emailVerified) {
                openEmailVerificationTab(user.email);
            } else {
                toast.success("Welcome back!");
                
                // Optimization: Smooth transition instead of hard reload
                // 1. Clear Apollo cache so it doesn't remember we were "logged out"
                await client.resetStore(); 
                // 2. Refresh Server Components (Header, Layout) to see the new Cookie
                router.refresh();
                // 3. Navigate
                router.push("/");
            }
        }
    }

    return (
        <div className="space-y-4">
        <Form {...form}>
            <form className="space-y-4" onSubmit={form.handleSubmit(handleSignIn)}>
            <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                    <Input
                        type="email"
                        autoComplete="email"
                        {...field}
                    />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                <FormItem>
                    <div className="flex justify-between items-center">
                    <FormLabel>Password</FormLabel>
                    <Button
                        onClick={openForgotPassword}
                        type="button"
                        variant="link"
                        size="sm"
                        className="text-sm font-normal underline"
                    >
                        Forgot password?
                    </Button>
                    </div>
                    <FormControl>
                    <PasswordInput
                        autoComplete="current-password webauthn"
                        {...field}
                    />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />

            <Button type="submit" disabled={loading} className="w-full">
                <LoadingSwap isLoading={loading}>Sign In</LoadingSwap>
            </Button>
            </form>
        </Form>
        {/* <PasskeyButton /> */}
        </div>
    )
}