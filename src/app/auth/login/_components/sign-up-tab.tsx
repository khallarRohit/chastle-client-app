"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import z from "zod"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { Button } from "@/components/ui/button"
import { LoadingSwap } from "@/components/ui/loading-swap"
import { SIGNUP_MUTATION } from "@/lib/graphql/mutations/authMutations";
import { toast } from "sonner"
import { useMutation } from "@apollo/client/react";

const signUpSchema = z.object({
  name: z.string().min(1),
  email: z.email().min(1),
  password: z.string().min(6),
})

type SignUpForm = z.infer<typeof signUpSchema>

export default function SignUpTab({
  openEmailVerificationTab,
}: {
  openEmailVerificationTab: (email: string) => void
}) {
  const form = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    }
  })
  const [signup, { loading, error }] = useMutation(SIGNUP_MUTATION)

  async function handleSignUp(data: SignUpForm) {
    const response = await signup({
      variables: {
        username: data.name,
        email: data.email,
        password: data.password
      }
    });

    if(error){
      const message = error.message || "Failed to sign up";
      toast.error(message);
    }

    openEmailVerificationTab(data.email);
  }

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(handleSignUp)}> 
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" {...field} />
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
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={loading} className="w-full">
          <LoadingSwap isLoading={loading}>Sign Up</LoadingSwap>
        </Button>
      </form>
    </Form>

  );
}