import type React from "react"
import { StudentLayout } from "@/components/student-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertTriangle, Clock } from "lucide-react"

export default function TestResult({ params }: { params: { id: string } }) {
  // Sample result data
  const result = {
    id: params.id,
    testName: "Programming Basics",
    date: "April 25, 2024",
    timeStarted: "10:15 AM",
    timeCompleted: "11:10 AM",
    duration: "55 minutes",
    score: 85,
    totalQuestions: 30,
    correctAnswers: 26,
    incorrectAnswers: 4,
    status: "passed",
    violations: [{ type: "Fullscreen Exit", count: 1, time: "10:25 AM" }],
    sectionScores: [
      { name: "Basic Concepts", score: 90, total: 10 },
      { name: "Data Types", score: 80, total: 10 },
      { name: "Control Structures", score: 85, total: 10 },
    ],
  }

  return (
    <StudentLayout>
      <div className="container py-6">
        <h1 className="text-2xl font-bold mb-6">Test Result</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{result.testName}</CardTitle>
                    <CardDescription>Completed on {result.date}</CardDescription>
                  </div>
                  <Badge className={result.status === "passed" ? "bg-green-600" : "bg-red-500"}>
                    {result.status === "passed" ? "Passed" : "Failed"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-end mb-2">
                      <h3 className="text-lg font-semibold">Your Score</h3>
                      <span className="text-2xl font-bold">{result.score}%</span>
                    </div>
                    <Progress value={result.score} className="h-3" />
                    <div className="flex justify-between text-sm text-gray-500 mt-1">
                      <span>0%</span>
                      <span>Passing: 60%</span>
                      <span>100%</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatCard
                      label="Correct Answers"
                      value={`${result.correctAnswers}/${result.totalQuestions}`}
                      icon={<CheckCircle className="h-5 w-5 text-green-600" />}
                    />
                    <StatCard
                      label="Incorrect Answers"
                      value={`${result.incorrectAnswers}/${result.totalQuestions}`}
                      icon={<XCircle className="h-5 w-5 text-red-500" />}
                    />
                    <StatCard
                      label="Time Taken"
                      value={result.duration}
                      icon={<Clock className="h-5 w-5 text-primary-blue" />}
                    />
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">Section Performance</h3>
                    <div className="space-y-4">
                      {result.sectionScores.map((section, index) => (
                        <div key={index}>
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium">{section.name}</span>
                            <span className="text-sm">
                              {section.score}% ({Math.round((section.score * section.total) / 100)}/{section.total})
                            </span>
                          </div>
                          <Progress value={section.score} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Detailed Analysis</CardTitle>
                <CardDescription>Breakdown of your performance by question type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <PerformanceCard title="Multiple Choice" correct={15} total={18} percentage={83} />
                    <PerformanceCard title="Multiple Select" correct={7} total={8} percentage={88} />
                    <PerformanceCard title="Numerical Answer" correct={4} total={4} percentage={100} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Test Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Test Name</p>
                  <p className="font-medium">{result.testName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium">{result.date}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Time Started</p>
                  <p className="font-medium">{result.timeStarted}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Time Completed</p>
                  <p className="font-medium">{result.timeCompleted}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Duration</p>
                  <p className="font-medium">{result.duration}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Questions</p>
                  <p className="font-medium">{result.totalQuestions}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monitoring Report</CardTitle>
              </CardHeader>
              <CardContent>
                {result.violations.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
                      <div>
                        <p className="font-medium">Violations Detected</p>
                        <p className="text-sm text-gray-500">
                          The following violations were recorded during your test:
                        </p>
                      </div>
                    </div>

                    <ul className="space-y-2">
                      {result.violations.map((violation, index) => (
                        <li key={index} className="text-sm border-l-2 border-amber-500 pl-3 py-1">
                          <span className="font-medium">{violation.type}</span> at {violation.time}
                          <p className="text-gray-500">Count: {violation.count}</p>
                        </li>
                      ))}
                    </ul>

                    <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded">
                      Minor violations were detected but did not affect your test submission.
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    <div>
                      <p className="font-medium">No Violations Detected</p>
                      <p className="text-sm text-gray-500">You completed the test without any monitoring violations.</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </StudentLayout>
  )
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-gray-500">{label}</p>
        {icon}
      </div>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  )
}

function PerformanceCard({
  title,
  correct,
  total,
  percentage,
}: {
  title: string
  correct: number
  total: number
  percentage: number
}) {
  return (
    <div className="border rounded-lg p-4">
      <h3 className="font-medium mb-2">{title}</h3>
      <div className="flex justify-between items-end mb-1">
        <span className="text-sm text-gray-500">Accuracy</span>
        <span className="text-lg font-semibold">{percentage}%</span>
      </div>
      <Progress value={percentage} className="h-2 mb-2" />
      <p className="text-sm text-gray-500">
        {correct} correct out of {total} questions
      </p>
    </div>
  )
}
