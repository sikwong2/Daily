'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function TopBar() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/check')
      const data = await response.json()
      setIsAuthenticated(data.authenticated)
    } catch (error) {
      console.error('Error checking auth status:', error)
      setIsAuthenticated(false)
    }
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  const handleSignOut = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      })

      if (response.ok) {
        setIsAuthenticated(false)
        router.refresh()
      }
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  if (!mounted) {
    return (
      <div className="w-full border-b border-border bg-background">
        <div className="flex h-14 items-center justify-end px-6 gap-2">
          <Button variant="ghost" size="icon" disabled>
            <div className="h-5 w-5" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full border-b border-border bg-background">
      <div className="flex h-14 items-center justify-end px-6 gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>
        {isAuthenticated ? (
          <Button variant="outline" onClick={handleSignOut}>
            Sign Out
          </Button>
        ) : (
          <>
            <Button variant="outline" onClick={() => router.push('/login')}>
              Sign In
            </Button>
            <Button variant="default" onClick={() => router.push('/signup')}>
              Sign Up
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
