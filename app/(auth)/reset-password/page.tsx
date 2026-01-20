"use client"

import * as React from "react"
import { Suspense } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { useRouter, useSearchParams } from "next/navigation"
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
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters."),
  newPasswordConfirmation: z
    .string()
    .min(1, "Please confirm your password."),
}).refine((data) => data.newPassword === data.newPasswordConfirmation, {
  message: "Passwords do not match.",
  path: ["newPasswordConfirmation"],
})

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isSuccess, setIsSuccess] = React.useState(false)
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      newPassword: "",
      newPasswordConfirmation: "",
    },
  })

  React.useEffect(() => {
    if (!token) {
      toast.error("Invalid reset link", {
        description: "The password reset link is invalid or has expired.",
      })
    }
  }, [token])

  async function onSubmit(data: z.infer<typeof formSchema>) {
    if (!token) {
      toast.error("Invalid reset link", {
        description: "The password reset link is invalid or has expired.",
      })
      return
    }

    setIsSubmitting(true)
    
    try {
      await AuthService.resetPasswordByToken({
        token,
        new_password: data.newPassword,
        new_password_confirmation: data.newPasswordConfirmation,
      })

      setIsSuccess(true)
      toast.success("Password reset successful!", {
        description: "Your password has been reset. You can now log in with your new password.",
        duration: 5000,
      })

      setTimeout(() => {
        router.push("/login")
      }, 2000)
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
                if (field === "newPassword") {
                  form.setError("newPassword", {
                    type: "server",
                    message: err.msg || "Invalid password.",
                  })
                } else if (field === "newPasswordConfirmation") {
                  form.setError("newPasswordConfirmation", {
                    type: "server",
                    message: err.msg || "Passwords do not match.",
                  })
                } else if (field === "token") {
                  toast.error("Invalid token", {
                    description: err.msg || "The reset token is invalid or has expired.",
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
        
        if (response?.status === 400 || response?.status === 404) {
          const errorMessage = 
            (response.data as any)?.detail || 
            (response.data as any)?.message || 
            "The reset token is invalid or has expired."
          
          toast.error("Invalid token", {
            description: errorMessage,
          })
          return
        }
        
        const errorMessage = 
          (response?.data as any)?.detail || 
          (response?.data as any)?.message || 
          "An error occurred. Please try again."
        
        toast.error("Reset failed", {
          description: errorMessage,
        })
      } else {
        toast.error("Reset failed", {
          description: "An unexpected error occurred. Please try again.",
        })
      }
    }
  }

  if (!token) {
    return (
      <section className="grid place-items-center my-[5rem]">
        <div className="">
          <h1 className="text-xl font-bold mb-3">AIRTICK</h1>
        </div>
        <Card className="w-[95%] sm:max-w-md mx-auto lg:mx-auto md:mx-auto">
          <CardHeader>
            <CardTitle>Invalid Reset Link</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              The password reset link is invalid or has expired.
            </p>
            <p className="text-sm text-muted-foreground">
              Please request a new password reset link.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button asChild variant="outline" className="w-full">
              <Link href="/forgot-password">Request New Reset Link</Link>
            </Button>
            <Button asChild variant="ghost" className="w-full">
              <Link href="/login">Back to Login</Link>
            </Button>
          </CardFooter>
        </Card>
      </section>
    )
  }

  if (isSuccess) {
    return (
      <section className="grid place-items-center my-[5rem]">
        <div className="">
          <h1 className="text-xl font-bold mb-3">AIRTICK</h1>
        </div>
        <Card className="w-[95%] sm:max-w-md mx-auto lg:mx-auto md:mx-auto">
          <CardHeader>
            <CardTitle>Password Reset Successful</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Your password has been successfully reset.
            </p>
            <p className="text-sm text-muted-foreground">
              Redirecting to login page...
            </p>
          </CardContent>
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
          <CardTitle>Reset Password</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Enter your new password below.
          </p>
          <form id="reset-password-form" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Controller
                name="newPassword"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="newPassword">
                      New Password
                    </FieldLabel>
                    <Input
                      {...field}
                      id="newPassword"
                      aria-invalid={fieldState.invalid}
                      placeholder="must be at least 8 characters long"
                      autoComplete="new-password"
                      type="password"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="newPasswordConfirmation"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="newPasswordConfirmation">
                      Confirm New Password
                    </FieldLabel>
                    <Input
                      {...field}
                      id="newPasswordConfirmation"
                      aria-invalid={fieldState.invalid}
                      placeholder="confirm your new password"
                      autoComplete="new-password"
                      type="password"
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
            form="reset-password-form"
            disabled={isSubmitting || !token}
            className="w-full"
          >
            {isSubmitting ? "Resetting..." : "Reset Password"}
          </Button>
          <Button asChild variant="ghost" className="w-full">
            <Link href="/login">Back to Login</Link>
          </Button>
        </CardFooter>
      </Card>
    </section>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <section className="grid place-items-center my-[5rem]">
        <div className="">
          <h1 className="text-xl font-bold mb-3">AIRTICK</h1>
        </div>
        <Card className="w-[95%] sm:max-w-md mx-auto lg:mx-auto md:mx-auto">
          <CardHeader>
            <CardTitle>Reset Password</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Loading...</p>
          </CardContent>
        </Card>
      </section>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}
