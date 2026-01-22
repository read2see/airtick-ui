"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import { AxiosError } from "axios"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
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
  oldPassword: z.string().min(1, "Current password is required."),
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

export function ChangePasswordForm() {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      newPasswordConfirmation: "",
    },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    
    try {
      await AuthService.changePassword({
        old_password: data.oldPassword,
        new_password: data.newPassword,
        new_password_confirmation: data.newPasswordConfirmation,
      })

      toast.success("Password changed successfully!", {
        description: "Your password has been updated.",
        duration: 3000,
      })

      // Reset form
      form.reset()
    } catch (error) {
      if (error instanceof AxiosError) {
        const response = error.response
        
        if (response?.status === 400 || response?.status === 422) {
          const errorData = response.data as any
          if (errorData?.detail) {
            if (Array.isArray(errorData.detail)) {
              errorData.detail.forEach((err: any) => {
                const field = err.loc?.[err.loc.length - 1]
                if (field === "old_password" || field === "oldPassword") {
                  form.setError("oldPassword", {
                    type: "server",
                    message: err.msg || "Invalid current password.",
                  })
                } else if (field === "new_password" || field === "newPassword") {
                  form.setError("newPassword", {
                    type: "server",
                    message: err.msg || "Invalid new password.",
                  })
                } else if (field === "new_password_confirmation" || field === "newPasswordConfirmation") {
                  form.setError("newPasswordConfirmation", {
                    type: "server",
                    message: err.msg || "Passwords do not match.",
                  })
                }
              })
            } else if (typeof errorData.detail === "string") {
              if (errorData.detail.toLowerCase().includes("old password") || 
                  errorData.detail.toLowerCase().includes("current password") ||
                  errorData.detail.toLowerCase().includes("incorrect")) {
                form.setError("oldPassword", {
                  type: "server",
                  message: errorData.detail,
                })
              } else {
                toast.error("Validation error", {
                  description: errorData.detail,
                })
              }
            }
          } else {
            toast.error("Validation error", {
              description: errorData?.message ?? "Invalid input data, check your inputs.",
            })
          }
        } else {
          const errorMessage = 
            (response?.data as any)?.detail || 
            (response?.data as any)?.message || 
            "An error occurred while changing your password. Please try again."
          
          toast.error("Password change failed", {
            description: errorMessage,
          })
        }
      } else {
        toast.error("Password change failed", {
          description: "An unexpected error occurred. Please try again.",
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change Password</CardTitle>
      </CardHeader>
      <CardContent>
        <form id="change-password-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="oldPassword"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="oldPassword">
                    Current Password
                  </FieldLabel>
                  <Input
                    {...field}
                    id="oldPassword"
                    aria-invalid={fieldState.invalid}
                    placeholder="Enter current password"
                    autoComplete="current-password"
                    type="password"
                    disabled={isSubmitting}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
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
                    placeholder="Enter new password (min. 8 characters)"
                    autoComplete="new-password"
                    type="password"
                    disabled={isSubmitting}
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
                    placeholder="Confirm new password"
                    autoComplete="new-password"
                    type="password"
                    disabled={isSubmitting}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
          <div className="mt-6 flex justify-end">
            <Button 
              type="submit" 
              form="change-password-form"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Changing..." : "Change Password"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
