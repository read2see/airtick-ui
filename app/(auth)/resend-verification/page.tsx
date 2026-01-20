"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import Link from "next/link"
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
import { AuthService } from "@/services/AuthService"

const formSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required.")
    .email("Please enter a valid email address."),
})

export default function ResendVerificationPage() {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isSuccess, setIsSuccess] = React.useState(false)
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    
    try {
      await AuthService.resendVerification({
        email: data.email,
      })

      setIsSuccess(true)
      toast.success("Verification email sent!", {
        description: "Please check your email for the verification link.",
        duration: 5000,
      })
    } catch (error) {
      setIsSubmitting(false)
      
      if (error instanceof AxiosError) {
        const response = error.response
        
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
        
        if (response?.status === 404) {
          const errorMessage = 
            (response.data as any)?.detail || 
            (response.data as any)?.message || 
            "No account found with this email address."
          
          form.setError("email", {
            type: "server",
            message: errorMessage,
          })
          toast.error("Email not found", {
            description: errorMessage,
          })
          return
        }
        
        if (response?.status === 429) {
          const errorMessage = 
            (response.data as any)?.detail || 
            (response.data as any)?.message || 
            "Too many requests. Please wait a few minutes before requesting another verification email."
          
          toast.error("Rate limit exceeded", {
            description: errorMessage,
            duration: 6000,
          })
          return
        }
        
        if (response?.status === 400) {
          const errorMessage = 
            (response.data as any)?.detail || 
            (response.data as any)?.message || 
            "This account is already verified or the request cannot be processed."
          
          toast.error("Request failed", {
            description: errorMessage,
            duration: 5000,
          })
          return
        }
        
        const errorMessage = 
          (response?.data as any)?.detail || 
          (response?.data as any)?.message || 
          "An error occurred. Please try again."
        
        toast.error("Request failed", {
          description: errorMessage,
        })
      } else {
        toast.error("Request failed", {
          description: "An unexpected error occurred. Please try again.",
        })
      }
    }
  }

  if (isSuccess) {
    return (
      <section className="grid place-items-center my-[5rem]">
        <div className="">
          <h1 className="text-xl font-bold mb-3">AIRTICK</h1>
        </div>
        <Card className="w-[95%] sm:max-w-md mx-auto lg:mx-auto md:mx-auto">
          <CardHeader>
            <CardTitle>Check Your Email</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              We've sent a verification email to <strong>{form.getValues("email")}</strong>.
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Please check your email and click the verification link to verify your account.
            </p>
            <p className="text-sm text-muted-foreground">
              If you don't see the email, check your spam folder or try again in a few minutes.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button asChild variant="outline" className="w-full">
              <Link href="/login">Back to Login</Link>
            </Button>
          </CardFooter>
        </Card>
      </section>
    )
  }

  return (
    <section className="grid place-items-center my-[5rem]">
      <div className="">
        <h1 className="text-xl font-bold mb-3">AIRTICK</h1>
      </div>
      <Card className="w-[95%] sm:max-w-md mx-auto lg:mx-auto md:mx-auto">
        <CardHeader>
          <CardTitle>Resend Verification Email</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Enter your email address and we'll send you a new verification email.
          </p>
          <form id="resend-verification-form" onSubmit={form.handleSubmit(onSubmit)}>
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
                      autoComplete="email"
                      type="email"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button 
            type="submit" 
            form="resend-verification-form"
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? "Sending..." : "Send Verification Email"}
          </Button>
          <Button asChild variant="ghost" className="w-full">
            <Link href="/login">Back to Login</Link>
          </Button>
        </CardFooter>
      </Card>
    </section>
  )
}
