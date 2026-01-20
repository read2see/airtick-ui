"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import * as z from "zod"
import { AxiosError } from "axios"

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
import { AuthService } from "@/services/AuthService"

const formSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required.")
    .email("Please enter a valid email address."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
})

export default function RegisterPage() {
  const router = useRouter()
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
    
    try {
      await AuthService.register({
        email_address: data.email,
        password: data.password,
      })

      toast.success("Registration successful!", {
        description: "Please check your email to verify your account before logging in.",
        duration: 5000,
      })

      // Redirect to login page after successful registration
      setTimeout(() => {
        router.push("/login")
      }, 1500)
    } catch (error) {
      setIsSubmitting(false)
      
      if (error instanceof AxiosError) {
        const response = error.response
        
        // Handle validation errors (422)
        if (response?.status === 422) {
          const errorData = response.data as any
          
          // Handle field-specific validation errors
          if (errorData?.detail) {
            if (Array.isArray(errorData.detail)) {
              // Handle array of validation errors
              errorData.detail.forEach((err: any) => {
                const field = err.loc?.[err.loc.length - 1]
                if (field === "email_address" || field === "email") {
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
          return
        }
        
        // Handle email already exists (409 or 400)
        if (response?.status === 409 || response?.status === 400) {
          const errorMessage = 
            (response.data as any)?.detail || 
            (response.data as any)?.message || 
            "An account with this email already exists."
          
          form.setError("email", {
            type: "server",
            message: errorMessage,
          })
          toast.error("Registration failed", {
            description: errorMessage,
          })
          return
        }
        
        // Handle other errors
        const errorMessage = 
          (response?.data as any)?.detail || 
          (response?.data as any)?.message || 
          "An error occurred during registration. Please try again."
        
        toast.error("Registration failed", {
          description: errorMessage,
        })
      } else {
        toast.error("Registration failed", {
          description: "An unexpected error occurred. Please try again.",
        })
      }
    }
  }

  return (
    <section className="grid place-items-center my-[5rem]">
      <div className="">
        <h1 className="text-xl font-bold mb-3">AIRTICK</h1>
      </div>
      <Card className="w-[95%] sm:max-w-md mx-auto lg:mx-auto md:mx-auto">
        <CardHeader>
          <CardTitle>Register</CardTitle>
        </CardHeader>
        <CardContent>
          <form id="register-form" onSubmit={form.handleSubmit(onSubmit)}>
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
              form="register-form"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Registering..." : "Register"}
            </Button>
          </Field>
        </CardFooter>
      </Card>
    </section>
  )
}
