"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, Clock, AlertCircle } from "lucide-react"

export default function TestPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, any>>({})
  const [markedForReview, setMarkedForReview] = useState<number[]>([])
  const [timeLeft, setTimeLeft] = useState(3600) // 60 minutes in seconds
  const [isFullscreen, setIsFullscreen] = useState(true)
  const [violations, setViolations] = useState<string[]>([])
  const [showWarning, setShowWarning] = useState(false)

  // Sample test data
  const test = {
    id: params.id,
    title: "Data Structures Aptitude Test",
    questions: [
      {
        id: 1,
        type: "mcq",
        text: "Which data structure follows the Last In First Out (LIFO) principle?",
        options: ["Queue", "Stack", "Linked List", "Array"],
        correctAnswer: 1, // Stack
      },
      {
        id: 2,
        type: "msq",
        text: "Which of the following are linear data structures? (Select all that apply)",
        options: ["Array", "Queue", "Tree", "Linked List"],
        correctAnswers: [0, 1, 3], // Array, Queue, Linked List
      },
      {
        id: 3,
        type: "nat",
        text: "What is the time complexity of binary search in Big O notation? Enter the number n in O(log n).",
        correctAnswer: "2",
      },
      {
        id: 4,
        type: "mcq",
        text: "Which sorting algorithm has the best average-case time complexity?",
        options: ["Bubble Sort", "Insertion Sort", "Quick Sort", "Selection Sort"],
        correctAnswer: 2, // Quick Sort
      },
      {
        id: 5,
        type: "mcq",
        text: "What is the worst-case time complexity of inserting an element into a hash table?",
        options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
        correctAnswer: 2, // O(n)
      },
    ],
  }

  // Format time left as MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  // Handle timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          handleSubmitTest()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Handle fullscreen detection
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement
      setIsFullscreen(isCurrentlyFullscreen)

      if (!isCurrentlyFullscreen) {
        setViolations((prev) => [...prev, `Exited fullscreen at ${new Date().toLocaleTimeString()}`])
        setShowWarning(true)

        // Auto-hide warning after 5 seconds
        setTimeout(() => {
          setShowWarning(false)
        }, 5000)
      }
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)

    // Request fullscreen when component mounts
    const requestFullscreen = async () => {
      try {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen()
        }
      } catch (error) {
        console.error("Couldn't enter fullscreen mode:", error)
      }
    }

    requestFullscreen()

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [])

  // Handle visibility change (tab switching)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        setViolations((prev) => [...prev, `Switched tab/window at ${new Date().toLocaleTimeString()}`])
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [])

  const handleAnswerChange = (value: any) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion]: value,
    }))
  }

  const handleMSQChange = (optionIndex: number) => {
    const currentAnswer = answers[currentQuestion] || []

    if (currentAnswer.includes(optionIndex)) {
      setAnswers((prev) => ({
        ...prev,
        [currentQuestion]: currentAnswer.filter((idx: number) => idx !== optionIndex),
      }))
    } else {
      setAnswers((prev) => ({
        ...prev,
        [currentQuestion]: [...currentAnswer, optionIndex],
      }))
    }
  }

  const handleMarkForReview = () => {
    if (markedForReview.includes(currentQuestion)) {
      setMarkedForReview(markedForReview.filter((q) => q !== currentQuestion))
    } else {
      setMarkedForReview([...markedForReview, currentQuestion])
    }
  }

  const handleNextQuestion = () => {
    if (currentQuestion < test.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleSubmitTest = () => {
    // In a real app, you would submit the answers to the server here
    router.push(`/student/results/${params.id}`)
  }

  const getQuestionStatusClass = (index: number) => {
    if (markedForReview.includes(index)) {
      return "bg-amber-100 border-amber-500 text-amber-700"
    }
    if (answers[index] !== undefined) {
      return "bg-green-100 border-green-500 text-green-700"
    }
    return "bg-gray-100 border-gray-300 text-gray-700"
  }

  const question = test.questions[currentQuestion]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with timer */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container flex h-16 items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-800">{test.title}</h1>

          <div className="flex items-center gap-4">
            <div className="flex items-center bg-gray-100 px-3 py-1.5 rounded-full">
              <Clock className="h-4 w-4 mr-2 text-primary-blue" />
              <span className="font-medium">{formatTime(timeLeft)}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Warning for fullscreen exit */}
      {showWarning && (
        <div className="fixed top-16 inset-x-0 z-50">
          <Alert variant="destructive" className="rounded-none">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>
                You have exited fullscreen mode. This violation has been recorded. Please return to fullscreen mode.
              </span>
              <Button onClick={() => document.documentElement.requestFullscreen()} size="sm" className="ml-2">
                Return to Fullscreen
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      )}

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Question navigation sidebar */}
        <aside className="w-20 md:w-64 bg-white border-r border-gray-200 overflow-y-auto p-4">
          <div className="mb-4">
            <h2 className="text-sm font-medium text-gray-500 mb-2">Question Navigator</h2>
            <div className="grid grid-cols-5 gap-2">
              {test.questions.map((q, index) => (
                <button
                  key={q.id}
                  className={`h-10 w-10 flex items-center justify-center rounded border font-medium ${getQuestionStatusClass(index)} ${
                    currentQuestion === index ? "ring-2 ring-primary-blue" : ""
                  }`}
                  onClick={() => setCurrentQuestion(index)}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 mt-6">
            <div className="flex items-center">
              <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
              <span className="text-sm">Answered</span>
            </div>
            <div className="flex items-center">
              <div className="h-3 w-3 rounded-full bg-amber-500 mr-2"></div>
              <span className="text-sm">Marked for Review</span>
            </div>
            <div className="flex items-center">
              <div className="h-3 w-3 rounded-full bg-gray-300 mr-2"></div>
              <span className="text-sm">Not Answered</span>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">
                  Question {currentQuestion + 1} of {test.questions.length}
                </h2>
                <div>
                  {markedForReview.includes(currentQuestion) ? (
                    <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-500">
                      Marked for Review
                    </Badge>
                  ) : null}
                </div>
              </div>

              <div className="mb-6">
                <p className="text-lg">{question.text}</p>
              </div>

              {/* Question type: MCQ */}
              {question.type === "mcq" && (
                <RadioGroup
                  value={answers[currentQuestion]?.toString()}
                  onValueChange={(value) => handleAnswerChange(Number.parseInt(value))}
                  className="space-y-3"
                >
                  {question.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                      <Label htmlFor={`option-${index}`} className="text-base">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {/* Question type: MSQ */}
              {question.type === "msq" && (
                <div className="space-y-3">
                  {question.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Checkbox
                        id={`msq-option-${index}`}
                        checked={(answers[currentQuestion] || []).includes(index)}
                        onCheckedChange={() => handleMSQChange(index)}
                      />
                      <Label htmlFor={`msq-option-${index}`} className="text-base">
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              )}

              {/* Question type: NAT */}
              {question.type === "nat" && (
                <div className="space-y-2">
                  <Label htmlFor="nat-answer">Your Answer</Label>
                  <Input
                    id="nat-answer"
                    value={answers[currentQuestion] || ""}
                    onChange={(e) => handleAnswerChange(e.target.value)}
                    placeholder="Enter your answer"
                    className="max-w-xs"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <div className="space-x-2">
              <Button variant="outline" onClick={handlePrevQuestion} disabled={currentQuestion === 0}>
                Previous
              </Button>
              <Button
                variant={markedForReview.includes(currentQuestion) ? "default" : "outline"}
                onClick={handleMarkForReview}
                className={markedForReview.includes(currentQuestion) ? "bg-amber-500 hover:bg-amber-600" : ""}
              >
                {markedForReview.includes(currentQuestion) ? "Unmark for Review" : "Mark for Review"}
              </Button>
            </div>

            <div className="space-x-2">
              {currentQuestion < test.questions.length - 1 ? (
                <Button onClick={handleNextQuestion} className="bg-primary-blue hover:bg-blue-700">
                  Save & Next
                </Button>
              ) : (
                <Button onClick={handleSubmitTest} className="bg-green-600 hover:bg-green-700">
                  Submit Test
                </Button>
              )}
            </div>
          </div>

          {violations.length > 0 && (
            <Alert className="mt-6" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-medium mb-1">Violations Detected:</div>
                <ul className="list-disc pl-5 text-sm">
                  {violations.map((violation, index) => (
                    <li key={index}>{violation}</li>
                  ))}
                </ul>
                <div className="mt-2 text-sm">Multiple violations may result in automatic test termination.</div>
              </AlertDescription>
            </Alert>
          )}
        </main>
      </div>
    </div>
  )
}

function Badge({
  children,
  className,
  variant = "default",
}: {
  children: React.ReactNode
  className?: string
  variant?: "default" | "outline"
}) {
  const baseClasses = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
  const variantClasses = {
    default: "bg-primary-blue text-white",
    outline: "border",
  }

  return <span className={`${baseClasses} ${variantClasses[variant]} ${className || ""}`}>{children}</span>
}
