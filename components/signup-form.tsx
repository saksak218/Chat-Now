"use client"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { signupSchema, type SignupFormData } from "@/constants/validation"
import { authClient } from "@/lib/auth-client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import Link from "next/link"

export function SignupForm({ ...props }: React.ComponentProps<typeof Card>) {
  const router = useRouter()
  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  async function onSubmit(values: SignupFormData) {
    try {
      const { data, error } = await authClient.signUp.email({
        name: values.name,
        email: values.email,
        password: values.password,
      })
      if (error) {
        console.error(error)
        toast.error(error?.message || "Something went wrong")
      }
      console.log(data)
      toast.success("User created successfully")
      router.push("/")
    } catch (error) {
      console.error(error)
      toast.error("Something went wrong")
    }
    form.reset()
  }
  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Enter your information below to create your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FieldGroup>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormDescription>
                      This is your public display name.
                    </FormDescription>
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
                      <Input placeholder="john.doe@example.com" {...field} />
                    </FormControl>
                    <FormDescription>
                      This is your public display name.
                    </FormDescription>
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
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormDescription>
                      This is your public display name.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormDescription>Please confirm your password.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FieldGroup>
                <Field>
                  <Button type="submit">Create Account</Button>
                  <Button variant="outline" type="button">
                    Sign up with Google
                  </Button>
                  <FieldDescription className="px-6 text-center">
                    Already have an account? <Link href="/login">Sign in</Link>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </FieldGroup>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
