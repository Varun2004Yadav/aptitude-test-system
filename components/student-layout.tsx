import type React from "react"
import type { ReactNode } from "react"
import Link from "next/link"
import { GraduationCap, Home, BookOpen, FileText, BarChart2, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface StudentLayoutProps {
  children: ReactNode
}

export function StudentLayout({ children }: StudentLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary-blue" />
            <h1 className="text-xl font-semibold text-gray-800">JMIT Aptitude Test</h1>
          </div>

          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Student" />
              <AvatarFallback>ST</AvatarFallback>
            </Avatar>
            <div className="hidden md:block">
              <p className="text-sm font-medium">Rahul Sharma</p>
              <p className="text-xs text-gray-500">B.Tech CSE - A</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        <aside className="w-16 md:w-64 bg-white border-r border-gray-200 shrink-0">
          <nav className="p-2 md:p-4 flex flex-col h-full">
            <div className="space-y-1">
              <NavItem href="/student/dashboard" icon={<Home className="h-5 w-5" />} label="Dashboard" />
              <NavItem href="/student/tests" icon={<BookOpen className="h-5 w-5" />} label="Available Tests" />
              <NavItem href="/student/results" icon={<FileText className="h-5 w-5" />} label="My Results" />
              <NavItem href="/student/analytics" icon={<BarChart2 className="h-5 w-5" />} label="Analytics" />
              <NavItem href="/student/profile" icon={<User className="h-5 w-5" />} label="Profile" />
            </div>

            <div className="mt-auto">
              <Link href="/">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  <span className="hidden md:inline">Logout</span>
                </Button>
              </Link>
            </div>
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 bg-gray-50">{children}</main>
      </div>
    </div>
  )
}

interface NavItemProps {
  href: string
  icon: React.ReactNode
  label: string
}

function NavItem({ href, icon, label }: NavItemProps) {
  return (
    <Link href={href}>
      <Button variant="ghost" className="w-full justify-start">
        {icon}
        <span className="ml-2 hidden md:inline">{label}</span>
      </Button>
    </Link>
  )
}
