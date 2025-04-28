'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { StudentLayout } from '@/components/student-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';

interface Question {
  _id: string;
  text: string;
  type: 'mcq' | 'true_false' | 'short_answer';
  options?: string[];
  correctAnswer: string;
  marks: number;
}

interface Test {
  _id: string;
  testName: string;
  instructions: string;
  duration: number;
  totalMarks: number;
  questions: Question[];
}

export default function TestPage({ params }: { params: { testId: string } }) {
  const router = useRouter();
  const [test, setTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [attemptId, setAttemptId] = useState<string | null>(null);

  useEffect(() => {
    const fetchTestDetails = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/student/tests/${params.testId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch test details');
        }

        const data = await response.json();
        setTest(data.data);
        setLoading(false);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('An unknown error occurred');
        }
        setLoading(false);
      }
    };

    const startTest = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/student/tests/${params.testId}/start`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to start test');
        }

        const data = await response.json();
        setAttemptId(data.data.attemptId);
        setTimeRemaining(data.data.timeRemaining);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('An unknown error occurred');
        }
      }
    };

    fetchTestDetails();
    startTest();
  }, [params.testId]);

  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 60000);

      return () => clearInterval(timer);
    }
  }, [timeRemaining]);

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/student/tests/${params.testId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ answers })
      });

      if (!response.ok) {
        throw new Error('Failed to submit test');
      }

      router.push(`/student/tests/${params.testId}/result`);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unknown error occurred');
      }
    }
  };

  if (loading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </StudentLayout>
    );
  }

  if (error) {
    return (
      <StudentLayout>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </StudentLayout>
    );
  }

  if (!test) {
    return null;
  }

  return (
    <StudentLayout>
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{test.testName}</CardTitle>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">
                Time Remaining: {timeRemaining} minutes
              </span>
              <Progress value={(timeRemaining / test.duration) * 100} className="w-32" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {test.questions.map((question, index) => (
                <div key={question._id} className="space-y-4">
                  <h3 className="text-lg font-medium">
                    Question {index + 1} ({question.marks} marks)
                  </h3>
                  <p className="text-gray-600">{question.text}</p>
                  {question.type === 'mcq' && (
                    <div className="space-y-2">
                      {question.options?.map((option) => (
                        <label key={option} className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name={question._id}
                            value={option}
                            checked={answers[question._id] === option}
                            onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                            className="form-radio"
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  )}
                  {question.type === 'true_false' && (
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name={question._id}
                          value="true"
                          checked={answers[question._id] === 'true'}
                          onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                          className="form-radio"
                        />
                        <span>True</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name={question._id}
                          value="false"
                          checked={answers[question._id] === 'false'}
                          onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                          className="form-radio"
                        />
                        <span>False</span>
                      </label>
                    </div>
                  )}
                  {question.type === 'short_answer' && (
                    <textarea
                      value={answers[question._id] || ''}
                      onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                      className="w-full p-2 border rounded-md"
                      rows={3}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-8 flex justify-end">
              <Button onClick={handleSubmit}>Submit Test</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </StudentLayout>
  );
} 