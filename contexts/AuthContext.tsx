"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { AuthService } from "@/services/AuthService"
import { AuthenticatedUserResponse } from "@/types/auth"
import { AxiosError } from "axios"
import { 
  isAdmin as checkIsAdmin, 
  isCustomer as checkIsCustomer, 
  hasRole as checkHasRole, 
  getDefaultRedirectPath,
  getRedirectPath
} from "@/lib/auth"
import type { UserRole } from "@/lib/auth"

interface AuthContextType {
  user: AuthenticatedUserResponse | null
  loading: boolean
  login: (email: string, password: string, redirectPath?: string | null) => Promise<void>
  logout: () => Promise<void>
  fetchUser: (force?: boolean) => Promise<void>
  isAuthenticated: boolean
  hasRole: (role: UserRole) => boolean
  isAdmin: () => boolean
  isCustomer: () => boolean
  getDefaultRedirectPath: () => string
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthenticatedUserResponse | null>(null)
  const [loading, setLoading] = React.useState(true)
  const router = useRouter()
  const isFetchingRef = React.useRef(false)
  const hasFetchedRef = React.useRef(false)

  const fetchUser = React.useCallback(async (force = false) => {
    // Prevent multiple simultaneous fetches unless forced
    if (!force && (isFetchingRef.current || hasFetchedRef.current)) {
      return
    }

    try {
      isFetchingRef.current = true
      setLoading(true)
      const userData = await AuthService.me()
      setUser(userData)
      hasFetchedRef.current = true
    } catch (error) {
      if (error instanceof AxiosError) {
        const status = error.response?.status
        if (status === 401) {
          setUser(null)
          hasFetchedRef.current = true
        } 
        else if (status === 403) {
          const currentPath = typeof window !== 'undefined' ? window.location.pathname : "/"
          const isPublicRoute = currentPath === "/" || 
            currentPath.startsWith("/login") || 
            currentPath.startsWith("/register") ||
            currentPath.startsWith("/forgot-password") ||
            currentPath.startsWith("/resend-verification") ||
            currentPath.startsWith("/reset-password")
          
          if (isPublicRoute) {
            setUser(null)
          }
          hasFetchedRef.current = true
        } else {
          setUser(null)
          hasFetchedRef.current = true
        }
      } else {
        setUser(null)
        hasFetchedRef.current = true
      }
    } finally {
      setLoading(false)
      isFetchingRef.current = false
    }
  }, [])

  React.useEffect(() => {
    if (user && !hasFetchedRef.current) {
      hasFetchedRef.current = true
      setLoading(false)
    }
  }, [user])

  React.useEffect(() => {
    if (!hasFetchedRef.current && !user && !isFetchingRef.current) {
      fetchUser()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const login = React.useCallback(async (email: string, password: string, redirectPath?: string | null) => {
    try {
      const loginResponse = await AuthService.login({ email, password })
      
      // Store token from login response for Authorization header
      if (loginResponse.token && typeof window !== "undefined") {
        sessionStorage.setItem("auth_token", loginResponse.token)
      }
      
      // Fetch full user profile after login
      const userData = await AuthService.me()
      
      setUser(userData)
      hasFetchedRef.current = true
      setLoading(false)

      const finalRedirectPath = getRedirectPath(redirectPath, userData.role)
      router.push(finalRedirectPath)
    } catch (error) {
      throw error
    }
  }, [router])

  const logout = React.useCallback(async () => {
    setUser(null)
    hasFetchedRef.current = false
    setLoading(false)
    
    // Clear stored token
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("auth_token")
    }
    
    try {
      await AuthService.logout()
    } catch (error) {
      console.warn("Logout API call failed, client state already cleared:", error)
    }
    
    router.replace("/login")
  }, [router])

  const hasRole = React.useCallback((role: UserRole) => checkHasRole(user, role), [user])
  const isAdmin = React.useCallback(() => checkIsAdmin(user), [user])
  const isCustomer = React.useCallback(() => checkIsCustomer(user), [user])
  const getDefaultRedirectPathMemo = React.useCallback(() => getDefaultRedirectPath(user?.role), [user?.role])

  const value: AuthContextType = React.useMemo(() => ({
    user,
    loading,
    login,
    logout,
    fetchUser,
    isAuthenticated: !!user,
    hasRole,
    isAdmin,
    isCustomer,
    getDefaultRedirectPath: getDefaultRedirectPathMemo,
  }), [user, loading, login, logout, fetchUser, hasRole, isAdmin, isCustomer, getDefaultRedirectPathMemo])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = React.useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
