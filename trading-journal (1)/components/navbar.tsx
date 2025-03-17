"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { LineChart, Bell, Settings } from "lucide-react"

export function Navbar() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <header className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <LineChart className="h-5 w-5" />
            <span>Trading Journal</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/") ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              Journal
            </Link>
            <Link
              href="/alerts"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/alerts") ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              Alerts
            </Link>
            <Link
              href="/settings"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/settings") ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              Settings
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          <div className="block md:hidden">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/alerts">
                <Bell className="h-5 w-5" />
              </Link>
            </Button>
          </div>

          <div className="block md:hidden">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/settings">
                <Settings className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}

