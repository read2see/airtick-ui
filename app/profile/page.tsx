"use client"

import * as React from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProfileForm } from "@/components/profile/ProfileForm"
import { ChangePasswordForm } from "@/components/profile/ChangePasswordForm"
import { BookingsList } from "@/components/profile/BookingsList"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { UserService } from "@/services/UserService"
import { AuthenticatedUserResponse } from "@/types/auth"
import { LogOut } from "lucide-react"
import { getImagePath } from "@/lib/imageUtils"

export default function ProfilePage() {
  const { user, loading, isAuthenticated, fetchUser, logout } = useAuth()
  const router = useRouter()
  const [profileData, setProfileData] = React.useState<AuthenticatedUserResponse | null>(null)
  const [isLoadingProfile, setIsLoadingProfile] = React.useState(true)
  const [isLoggingOut, setIsLoggingOut] = React.useState(false)
  const profileImageUrl = React.useMemo(() => getImagePath(profileData?.profile_img), [profileData?.profile_img])

  React.useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login?redirect=/profile")
      return
    }

    if (user) {
      // Fetch full profile data
      UserService.getProfile()
        .then((data) => {
          setProfileData(data)
        })
        .catch((error) => {
          console.error("Failed to fetch profile:", error)
          // Fallback to user from context
          setProfileData(user)
        })
        .finally(() => {
          setIsLoadingProfile(false)
        })
    }
  }, [user, loading, isAuthenticated, router])

  const handleProfileUpdate = React.useCallback((updatedUser: AuthenticatedUserResponse) => {
    setProfileData(updatedUser)
  }, [])

  const handleLogout = React.useCallback(async () => {
    setIsLoggingOut(true)
    try {
      await logout()
    } catch (error) {
      console.error("Logout failed:", error)
      setIsLoggingOut(false)
    }
  }, [logout])


  if (loading || isLoadingProfile) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-2xl font-bold mb-6">Profile</h1>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Loading profile...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!profileData) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-2xl font-bold mb-6">Profile</h1>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Unable to load profile data.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Profile</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your account information and bookings
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          {isLoggingOut ? "Logging out..." : "Logout"}
        </Button>
      </div>

      <div className="space-y-6">
        {/* Profile Header Card */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Profile Image */}
              <div className="flex-shrink-0">
                {profileImageUrl ? (
                  <div className="relative h-32 w-32 overflow-hidden rounded-full border-2 border-border">
                    <Image
                      src={profileImageUrl}
                      alt={`${profileData.first_name} ${profileData.last_name}`}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="flex h-32 w-32 items-center justify-center rounded-full border-2 border-border bg-muted text-4xl font-semibold">
                    {profileData.first_name?.[0]?.toUpperCase() || profileData.email?.[0]?.toUpperCase() || "U"}
                  </div>
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1 space-y-3">
                <div>
                  <h2 className="text-xl font-semibold">
                    {profileData.first_name && profileData.last_name
                      ? `${profileData.first_name} ${profileData.last_name}`
                      : profileData.email}
                  </h2>
                  <p className="text-sm text-muted-foreground">{profileData.email}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="font-medium text-muted-foreground">Role</p>
                    <p className="capitalize">{profileData.role?.toLowerCase()}</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Verification Status</p>
                    <p>
                      {profileData.email_verified ? (
                        <span className="text-green-600 dark:text-green-400">Verified</span>
                      ) : (
                        <span className="text-yellow-600 dark:text-yellow-400">Not Verified</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Edit Profile Form */}
        <ProfileForm user={profileData} onUpdate={handleProfileUpdate} />

        <Separator />

        {/* Change Password */}
        <ChangePasswordForm />

        <Separator />

        {/* Bookings History */}
        {
          user?.role == "CUSTOMER" &&
          <BookingsList  />
        }
        
      </div>
    </div>
  )
}
