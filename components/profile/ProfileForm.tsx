"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import { AxiosError } from "axios"
import * as z from "zod"
import Image from "next/image"

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
import { UserService, UpdateProfileRequest } from "@/services/UserService"
import { AuthenticatedUserResponse } from "@/types/auth"
import { useAuth } from "@/contexts/AuthContext"

const formSchema = z.object({
  firstName: z.string().min(1, "First name is required."),
  lastName: z.string().min(1, "Last name is required."),
})

interface ProfileFormProps {
  user: AuthenticatedUserResponse
  onUpdate?: (updatedUser: AuthenticatedUserResponse) => void
}

export function ProfileForm({ user, onUpdate }: ProfileFormProps) {
  const { fetchUser } = useAuth()
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isUploadingImage, setIsUploadingImage] = React.useState(false)
  const [profileImagePreview, setProfileImagePreview] = React.useState<string | null>(
    user.profile_img || null
  )
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: user.first_name || "",
      lastName: user.last_name || "",
    },
  })

  React.useEffect(() => {
    if (user) {
      form.reset({
        firstName: user.first_name || "",
        lastName: user.last_name || "",
      })
      setProfileImagePreview(user.profile_img || null)
    }
  }, [user, form])

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Invalid file type", {
        description: "Please select an image file.",
      })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large", {
        description: "Please select an image smaller than 5MB.",
      })
      return
    }

    setIsUploadingImage(true)
    try {
      const currentValues = form.getValues()
      const updatedUser = await UserService.updateProfileWithImage(
        {
          firstName: currentValues.firstName,
          lastName: currentValues.lastName,
        },
        file
      )
      
      setProfileImagePreview(updatedUser.profile_img || null)
      await fetchUser()
      
      if (onUpdate) {
        onUpdate(updatedUser)
      }
      
      toast.success("Profile image updated!", {
        description: "Your profile image has been updated.",
      })
    } catch (error) {
      if (error instanceof AxiosError) {
        const errorMessage = 
          (error.response?.data as any)?.detail || 
          (error.response?.data as any)?.message || 
          "Failed to upload image. Please try again."
        
        toast.error("Upload failed", {
          description: errorMessage,
        })
      } else {
        toast.error("Upload failed", {
          description: "An unexpected error occurred. Please try again.",
        })
      }
    } finally {
      setIsUploadingImage(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      
      handleImageUpload(file)
    }
  }

  async function onSubmit(data: z.infer<typeof formSchema>, e?: React.BaseSyntheticEvent) {
    e?.preventDefault()
    setIsSubmitting(true)
    
    try {
      const payload: UpdateProfileRequest = {}
      
      if (data.firstName !== user.first_name) {
        payload.first_name = data.firstName
      }
      if (data.lastName !== user.last_name) {
        payload.last_name = data.lastName
      }

      // Only update if something has changed
      if (Object.keys(payload).length === 0) {
        toast.info("No changes to save")
        setIsSubmitting(false)
        return
      }

      const updatedUser = await UserService.updateProfile(payload)
      
      toast.success("Profile updated successfully!", {
        description: "Your profile has been updated.",
        duration: 3000,
      })

      // Update form state with new values from API response
      form.reset({
        firstName: updatedUser.first_name || "",
        lastName: updatedUser.last_name || "",
      })
      
      // Update preview if profile image changed
      if (updatedUser.profile_img) {
        setProfileImagePreview(updatedUser.profile_img)
      }

      // Update auth context with new user data (force refresh)
      await fetchUser(true)

      // Call onUpdate callback to update parent component
      if (onUpdate) {
        onUpdate(updatedUser)
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        const response = error.response
        
        if (response?.status === 400 || response?.status === 422) {
          const errorData = response.data as any
          
          if (errorData?.detail) {
            if (Array.isArray(errorData.detail)) {
              errorData.detail.forEach((err: any) => {
                const field = err.loc?.[err.loc.length - 1]
                if (field === "firstName") {
                  form.setError("firstName", {
                    type: "server",
                    message: err.msg || "Invalid first name.",
                  })
                } else if (field === "lastName") {
                  form.setError("lastName", {
                    type: "server",
                    message: err.msg || "Invalid last name.",
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
        } else {
          const errorMessage = 
            (response?.data as any)?.detail || 
            (response?.data as any)?.message || 
            "An error occurred while updating your profile. Please try again."
          
          toast.error("Update failed", {
            description: errorMessage,
          })
        }
      } else {
        toast.error("Update failed", {
          description: "An unexpected error occurred. Please try again.",
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const getImageUrl = () => {
    if (profileImagePreview) {
      // If it's a data URL (preview), return as is
      if (profileImagePreview.startsWith("data:")) {
        return profileImagePreview
      }
      // Prefix with API URL for profile images
      const apiUrl = process.env.NEXT_PUBLIC_REST_API_URL
      if (apiUrl) {
        return `${apiUrl}/api/images/${profileImagePreview}`
      }
      return `/api/images/${profileImagePreview}`
    }
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Profile Image Upload */}
        <div className="mb-6 flex items-center gap-4">
          <div className="relative">
            {getImageUrl() ? (
              <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-border">
                <Image
                  src={getImageUrl()!}
                  alt="Profile"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-border bg-muted text-2xl font-semibold">
                {user.first_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
              </div>
            )}
          </div>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="profile-image-upload"
              disabled={isUploadingImage}
            />
            <label htmlFor="profile-image-upload">
              <Button
                type="button"
                variant="outline"
                disabled={isUploadingImage}
                asChild
              >
                <span>
                  {isUploadingImage ? "Uploading..." : "Change Photo"}
                </span>
              </Button>
            </label>
            <p className="mt-1 text-xs text-muted-foreground">
              JPG, PNG or GIF. Max size 5MB.
            </p>
          </div>
        </div>

        <form 
          id="profile-form" 
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit(onSubmit)(e)
          }}
        >
          <FieldGroup>
            <Controller
              name="firstName"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="firstName">
                    First Name
                  </FieldLabel>
                  <Input
                    {...field}
                    id="firstName"
                    aria-invalid={fieldState.invalid}
                    placeholder="John"
                    autoComplete="given-name"
                    disabled={isSubmitting}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="lastName"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="lastName">
                    Last Name
                  </FieldLabel>
                  <Input
                    {...field}
                    id="lastName"
                    aria-invalid={fieldState.invalid}
                    placeholder="Doe"
                    autoComplete="family-name"
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
              form="profile-form"
              disabled={isSubmitting || !form.formState.isDirty}
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
