"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { StudentLayout } from "@/components/student-layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Clock, AlertTriangle, CheckCircle, MonitorSmartphone, MousePointer2, Ban } from "lucide-react"

export default function TestInstructions({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)

  // Sample test data
  const test = {
    id: params.id,
    title: "Data Structures Aptitude Test",
    date: "May 10, 2024",
    time: "10:00 AM",
    duration: "60 minutes",
    totalQuestions: 30,
    passingScore: 60,
    instructions: [
      "The test must be completed in a single session.",
      "You must remain in fullscreen mode throughout the test.",
      "Switching tabs or applications will be recorded as a violation.",
      "Multiple violations may result in automatic test termination.",
      "Questions can be of Multiple Choice (MCQ), Multiple Select (MSQ), or Numerical Answer Type (NAT).",
      "You can navigate between questions using the sidebar or next/previous buttons.",
      "You can mark questions for review and return to them later.",
      "The test will be automatically submitted when the time expires.",
      "Ensure you have a stable internet connection before starting the test.",
    ],
  }

  const handleStartTest = () => {
    if (!agreed) return

    setLoading(true)

    // Simulate loading
    setTimeout(() => {
      router.push(`/student/test/${params.id}`)
    }, 1000)
  }

  return (
    <StudentLayout>
      <div className="container py-6">
        <h1 className="text-2xl font-bold mb-6">Test Instructions</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Instructions for {test.title}</CardTitle>
                <CardDescription>Please read all instructions carefully before starting the test</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Important</AlertTitle>
                  <AlertDescription>
                    This test requires fullscreen mode and monitors for any attempts to exit fullscreen or switch tabs.
                    Violations may result in test termination.
                  </AlertDescription>
                </Alert>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Test Instructions</h3>
                  <ul className="space-y-3">
                    {test.instructions.map((instruction, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-primary-blue mr-2 mt-0.5 shrink-0" />
                        <span>{instruction}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-3">Technical Requirements</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <MonitorSmartphone className="h-5 w-5 text-primary-blue mr-2 mt-0.5 shrink-0" />
                      <span>Use a desktop or laptop computer for the best experience.</span>
                    </li>
                    <li className="flex items-start">
                      <MousePointer2 className="h-5 w-5 text-primary-blue mr-2 mt-0.5 shrink-0" />
                      <span>Ensure your browser supports fullscreen mode (Chrome, Firefox, Edge recommended).</span>
                    </li>
                    <li className="flex items-start">
                      <Ban className="h-5 w-5 text-primary-blue mr-2 mt-0.5 shrink-0" />
                      <span>Disable browser extensions that might interfere with the test.</span>
                    </li>
                  </ul>
                </div>

                <div className="flex items-start space-x-2 pt-4">
                  <Checkbox id="terms" checked={agreed} onCheckedChange={(checked) => setAgreed(checked as boolean)} />
                  <label
                    htmlFor="terms"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    I have read and understood all the instructions and agree to follow them.
                  </label>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleStartTest}
                  disabled={!agreed || loading}
                  className="w-full bg-primary-blue hover:bg-blue-700"
                >
                  {loading ? "Preparing Test..." : "Start Test"}
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Test Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Test Name</p>
                  <p className="font-medium">{test.title}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date & Time</p>
                  <p className="font-medium">
                    {test.date}, {test.time}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Duration</p>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-primary-blue" />
                    <p className="font-medium">{test.duration}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Questions</p>
                  <p className="font-medium">{test.totalQuestions} questions</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Passing Score</p>
                  <p className="font-medium">{test.passingScore}%</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </StudentLayout>
  )
}
