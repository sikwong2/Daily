'use client'

import { Moon, Sun, Menu, X } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface TopBarProps {
  isMobileSidebarOpen?: boolean
  onToggleSidebar?: () => void
}

export default function TopBar({ isMobileSidebarOpen = false, onToggleSidebar }: TopBarProps) {
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
        window.location.reload()
      }
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  if (!mounted) {
    return (
      <div className="w-full border-b border-border bg-background">
        <div className="flex h-14 items-center justify-between px-6 gap-2">
          <div className="md:hidden">
            <Button variant="ghost" size="icon" disabled>
              <div className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" disabled>
              <div className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full border-b border-border bg-background">
      <div className="flex h-14 items-center justify-between px-6 gap-2">
        {/* Mobile menu button on the left */}
        {onToggleSidebar && (
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onToggleSidebar}
            aria-label="Toggle menu"
          >
            {isMobileSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        )}

        {/* Right side buttons */}
        <div className="flex items-center gap-2 ml-auto">
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
    </div>
  )
}
