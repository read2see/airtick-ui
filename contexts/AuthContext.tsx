"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { AuthService } from "@/services/AuthService"
import { AuthenticatedUserResponse } from "@/types/auth"
import { AxiosError } from "axios"

interface AuthContextType {
  user: AuthenticatedUserResponse | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  fetchUser: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthenticatedUserResponse | null>(null)
  const [loading, setLoading] = React.useState(true)
  const router = useRouter()

  const fetchUser = React.useCallback(async () => {
    try {
      setLoading(true)
      const userData = await AuthService.me()
      setUser(userData)
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        setUser(null)
      } else {
        setUser(null)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const login = async (email: string, password: string) => {
    try {
      const loginResponse = await AuthService.login({ email, password })
      
      const userData: AuthenticatedUserResponse = {
        id: loginResponse.id,
        role: loginResponse.role,
      }
      
      setUser(userData)

      if (userData.role === "ADMIN") {
        router.push("/admin/dashboard")
      } else if (userData.role === "CUSTOMER") {
        router.push("/customer")
      } else {
        router.push("/")
      }
    } catch (error) {
      throw error
    }
  }

  const logout = async () => {
    try {
      setUser(null)
      router.push("/login")
    } catch (error) {
      setUser(null)
      router.push("/login")
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    fetchUser,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = React.useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
