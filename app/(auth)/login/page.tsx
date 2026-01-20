"use client"

import * as React from "react"
import { Suspense } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { AxiosError } from "axios"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/AuthContext"

const formSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required.")
    .email("Please enter a valid email address."),
  password: z
    .string()
    .min(1, "Password is required.")
})

function LoginForm() {
  const { login } = useAuth()
  const searchParams = useSearchParams()
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    
    // Get redirect parameter from URL query string
    const redirectPath = searchParams.get("redirect")
    
    try {
      await login(data.email, data.password, redirectPath)
      
      // Login successful - redirect will happen via window.location
      // Don't reset isSubmitting as page will navigate away
      toast.success("Login successful!", {
        description: "Redirecting to your dashboard...",
        duration: 2000,
      })
    } catch (error) {
      setIsSubmitting(false)
      
      if (error instanceof AxiosError) {
        const response = error.response
        
        if (response?.status === 401) {
          const errorMessage = 
            (response.data as any)?.detail || 
            (response.data as any)?.message || 
            "Invalid email or password. Please try again."
          
          toast.error("Login failed", {
            description: errorMessage,
          })
          
          form.setValue("password", "")
          return
        }
        
        if (response?.status === 403) {
          const errorData = response.data as any
          const errorMessage = 
            errorData?.detail || 
            errorData?.message || 
            "Access forbidden. Your account may not be verified or you may not have permission to access this resource."
          
          const isVerificationError = 
            typeof errorMessage === "string" && 
            (errorMessage.toLowerCase().includes("verif") || 
             errorMessage.toLowerCase().includes("email"))
          
          toast.error(
            isVerificationError ? "Account not verified" : "Access forbidden", 
            {
              description: errorMessage,
              duration: 5000,
            }
          )
          
          form.setValue("password", "")
          return
        }
        
        if (response?.status === 422) {
          const errorData = response.data as any
          
          if (errorData?.detail) {
            if (Array.isArray(errorData.detail)) {
              errorData.detail.forEach((err: any) => {
                const field = err.loc?.[err.loc.length - 1]
                if (field === "email") {
                  form.setError("email", {
                    type: "server",
                    message: err.msg || "Invalid email address.",
                  })
                } else if (field === "password") {
                  form.setError("password", {
                    type: "server",
                    message: err.msg || "Invalid password.",
                  })
                }
              })
            } else if (typeof errorData.detail === "string") {
              toast.error("Validation error", {
                description: errorData.detail,
              })
            }
          } else {
            toast.error("Validation error", {
              description: "Please check your input and try again.",
            })
          }
          
          form.setValue("password", "")
          return
        }
        
        const errorMessage = 
          (response?.data as any)?.detail || 
          (response?.data as any)?.message || 
          "An error occurred during login. Please try again."
        
        toast.error("Login failed", {
          description: errorMessage,
        })
      } else {
        toast.error("Login failed", {
          description: "An unexpected error occurred. Please try again.",
        })
      }
      
      form.setValue("password", "")
    }
  }

  return (
    <section className="grid place-items-center my-[5rem]">
      <div className="">
        <h1 className="text-xl font-bold mb-3">AIRTICK</h1>
      </div>
      <Card className="w-[95%] sm:max-w-md mx-auto lg:mx-auto md:mx-auto">
        <CardHeader>
          <CardTitle>Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form id="login-form" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="email">
                      E-mail
                    </FieldLabel>
                    <Input
                      {...field}
                      id="email"
                      aria-invalid={fieldState.invalid}
                      placeholder="example@example.com"
                      autoComplete="off"
                      type="email"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="password">
                      Password
                    </FieldLabel>
                    <Input
                      {...field}
                      id="password"
                      aria-invalid={fieldState.invalid}
                      placeholder="must be at least 8 characters long"
                      autoComplete="off"
                      type="password"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]}  />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </form>
        </CardContent>
        <CardFooter>
          <Field orientation="horizontal" className="flex justify-center">
            <Button 
              type="submit" 
              form="login-form"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </Button>
          </Field>
        </CardFooter>
      </Card>
    </section>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <section className="grid place-items-center my-[5rem]">
        <div className="">
          <h1 className="text-xl font-bold mb-3">AIRTICK</h1>
        </div>
        <Card className="w-[95%] sm:max-w-md mx-auto lg:mx-auto md:mx-auto">
          <CardHeader>
            <CardTitle>Login</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Loading...</p>
          </CardContent>
        </Card>
      </section>
    }>
      <LoginForm />
    </Suspense>
  )
}
