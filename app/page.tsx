import type React from "react"
import Link from "next/link"
import { GraduationCap, BookOpen, Award, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-4">
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary-blue" />
            <h1 className="text-xl font-semibold text-gray-800">JMIT Online Aptitude Test System</h1>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 education-pattern">
        <div className="container py-12 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800 leading-tight">
                Welcome to JMIT Online Aptitude Test System
              </h1>
              <p className="text-lg text-gray-600">
                A secure and professional platform for college students to take aptitude tests online.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button asChild size="lg" className="bg-primary-blue hover:bg-blue-700">
                  <Link href="/student/login">
                    Student Login
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-primary-blue text-primary-blue hover:bg-blue-50"
                >
                  <Link href="/faculty/login">
                    Faculty Login
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
            <div className="hidden md:block">
              <img
                src="/online-classroom.jpg"
                alt="Online classroom illustration"
                className="rounded-lg shadow-medium"
              />
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-white py-16">
          <div className="container">
            <h2 className="text-3xl font-bold text-center mb-12">Why Choose Our Platform?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard
                icon={<BookOpen className="h-10 w-10 text-primary-blue" />}
                title="Secure Testing Environment"
                description="Our platform ensures academic integrity with fullscreen mode, tab switching prevention, and comprehensive monitoring."
              />
              <FeatureCard
                icon={<Award className="h-10 w-10 text-primary-blue" />}
                title="Comprehensive Analytics"
                description="Faculty can access detailed reports, performance trends, and student improvement metrics."
              />
              <FeatureCard
                icon={<GraduationCap className="h-10 w-10 text-primary-blue" />}
                title="Multiple Question Types"
                description="Support for Multiple Choice, Multiple Select, and Numerical Answer Type questions."
              />
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="container py-16">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl font-bold">About Online Aptitude Testing</h2>
            <p className="text-lg text-gray-600">
              Online aptitude testing provides a convenient and efficient way to assess students' abilities and
              knowledge. Our platform is designed to create a fair testing environment while providing valuable insights
              to faculty members.
            </p>
            <p className="text-lg text-gray-600">
              With features like automatic submission, comprehensive monitoring, and detailed analytics, JMIT Online
              Aptitude Test System ensures a reliable and trustworthy assessment experience.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <GraduationCap className="h-6 w-6" />
              <span className="font-semibold">JMIT Online Aptitude Test System</span>
            </div>
            <div className="text-sm text-gray-400">© {new Date().getFullYear()} JMIT. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <Card className="shadow-soft hover:shadow-medium transition-shadow">
      <CardContent className="p-6 text-center">
        <div className="mx-auto w-fit mb-4">{icon}</div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </CardContent>
    </Card>
  )
}
