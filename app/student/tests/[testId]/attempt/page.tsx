"use client";

import { useState, useEffect } from "react";
import { StudentLayout } from "@/components/student-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { useRouter } from "next/navigation";

interface Question {
  _id: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
}

interface Test {
  _id: string;
  title: string;
  duration: number;
  questions: Question[];
}

export default function TestAttempt({ params }: { params: { testId: string } }) {
  const [test, setTest] = useState<Test | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchTestDetails();
  }, [params.testId]);

  useEffect(() => {
    if (test?.duration) {
      setTimeLeft(test.duration * 60); // Convert minutes to seconds
    }
  }, [test?.duration]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeLeft]);

  const fetchTestDetails = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/student/tests/${params.testId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch test details');
      }

      const data = await response.json();
      setTest(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch test details');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < (test?.questions.length || 0) - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/student/tests/${params.testId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          answers: Object.entries(answers).map(([questionId, selectedAnswer]) => ({
            questionId,
            selectedAnswer,
          })),
          timeTaken: test?.duration ? test.duration - Math.floor(timeLeft / 60) : 0,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit test');
      }

      router.push(`/student/tests/${params.testId}/result`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit test');
    }
  };

  if (loading) {
    return (
      <StudentLayout>
        <div className="container py-6">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-blue"></div>
          </div>
        </div>
      </StudentLayout>
    );
  }

  if (error) {
    return (
      <StudentLayout>
        <div className="container py-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </StudentLayout>
    );
  }

  const currentQuestion = test?.questions[currentQuestionIndex];

  return (
    <StudentLayout>
      <div className="container py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{test?.title}</h1>
          <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full">
            <Clock className="h-5 w-5 text-primary-blue" />
            <span className="font-medium">
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </span>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              Question {currentQuestionIndex + 1} of {test?.questions.length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-4">
                <p className="text-lg">{currentQuestion?.questionText}</p>
                <RadioGroup
                  value={answers[currentQuestion?._id || '']}
                  onValueChange={(value) => handleAnswerSelect(currentQuestion?._id || '', value)}
                >
                  {currentQuestion?.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={`option-${index}`} />
                      <Label htmlFor={`option-${index}`}>{option}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>

                {currentQuestionIndex === (test?.questions.length || 0) - 1 ? (
                  <Button
                    className="bg-primary-blue hover:bg-blue-700"
                    onClick={handleSubmit}
                  >
                    Submit Test
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={handleNext}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {test?.questions.map((_, index) => (
                  <Button
                    key={index}
                    variant={currentQuestionIndex === index ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentQuestionIndex(index)}
                  >
                    {index + 1}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </StudentLayout>
  );
} 