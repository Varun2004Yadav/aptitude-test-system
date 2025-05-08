"use client";

import type React from "react"
import type { ReactNode } from "react"
import Link from "next/link"
import { BookOpen, Home, Users, FileText, BarChart2, Settings, User, LogOut, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CreateTestModal } from "@/components/CreateTestModal"
import { useState, useEffect } from "react"
import { usePathname } from 'next/navigation'

interface FacultyLayoutProps {
  children: ReactNode
}

interface FacultyProfile {
  name: string;
  department: string;
}

export function FacultyLayout({ children }: FacultyLayoutProps) {
  const [isCreateTestModalOpen, setIsCreateTestModalOpen] = useState(false)
  const [profile, setProfile] = useState<FacultyProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const pathname = usePathname();
  const hideSidebar = pathname === '/faculty/login' || pathname === '/faculty/register';

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/faculty/profile', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }

        const data = await response.json();
        setProfile({
          name: data.name || 'Name not available',
          department: data.department || 'Department not available'
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
        setProfile({
          name: 'Name not available',
          department: 'Department not available'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary-blue" />
            <h1 className="text-xl font-semibold text-gray-800">JMIT Aptitude Test</h1>
          </div>

          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Faculty" />
              <AvatarFallback>{profile?.name?.charAt(0) || 'F'}</AvatarFallback>
            </Avatar>
            <div className="hidden md:block">
              <p className="text-sm font-medium">{profile?.name || 'Loading...'}</p>
              <p className="text-xs text-gray-500">{profile?.department || 'Loading...'}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        {!hideSidebar && (
          <aside className="w-20 md:w-72 bg-transparent shrink-0 flex flex-col items-center py-6">
            <nav className="w-full flex flex-col h-full">
              <div className="bg-white rounded-2xl shadow-md p-4 flex flex-col gap-1 w-full">
                <div className="space-y-1">
                  <NavItem href="/faculty/dashboard" icon={<Home className="h-5 w-5" />} label="Dashboard" />
                  <NavItem href="/faculty/profile" icon={<User className="h-5 w-5" />} label="Profile" />
                  <NavItem href="/faculty/classes" icon={<Users className="h-5 w-5" />} label="Manage Classes" />
                  <NavItem href="/faculty/tests" icon={<FileText className="h-5 w-5" />} label="Manage Tests" />
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => setIsCreateTestModalOpen(true)}
                  >
                    <Plus className="h-5 w-5" />
                    <span className="ml-2 hidden md:inline">Create Test</span>
                  </Button>
                  <NavItem href="/faculty/results" icon={<BarChart2 className="h-5 w-5" />} label="View Results" />
                  <NavItem href="/faculty/settings" icon={<Settings className="h-5 w-5" />} label="Settings" />
                </div>
              </div>
              <div className="mt-6 w-full">
                <Link href="/">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl"
                  >
                    <LogOut className="h-5 w-5 mr-2" />
                    <span className="hidden md:inline">Logout</span>
                  </Button>
                </Link>
              </div>
            </nav>
          </aside>
        )}
        <main className="flex-1 bg-gray-50">{children}</main>
      </div>

      {/* Create Test Modal */}
      <CreateTestModal
        isOpen={isCreateTestModalOpen}
        onClose={() => setIsCreateTestModalOpen(false)}
      />
    </div>
  )
}

function NavItem({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  const pathname = usePathname();
  const isActive = pathname === href;
  return (
    <Link href={href} legacyBehavior>
      <a>
        <Button
          variant="ghost"
          className={`w-full justify-start rounded-xl transition-colors ${isActive ? 'bg-blue-50 text-primary-blue font-semibold' : ''}`}
        >
          {icon}
          <span className="ml-2 hidden md:inline">{label}</span>
        </Button>
      </a>
    </Link>
  );
}
