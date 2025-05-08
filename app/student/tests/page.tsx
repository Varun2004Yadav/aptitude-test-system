"use client";

import { useState, useEffect } from "react";
import { StudentLayout } from "@/components/student-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AvailableTests() {
  const [hasQuestions, setHasQuestions] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    checkQuestions();
  }, []);

  const checkQuestions = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/student/login');
        return;
      }

      const response = await fetch('http://localhost:5000/api/student/questions', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        router.push('/student/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to check questions');
      }

      const data = await response.json();
      setHasQuestions(data && data.length > 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check questions');
    } finally {
      setLoading(false);
    }
  };

  const handleStartTest = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/student/login');
        return;
      }

      const response = await fetch('http://localhost:5000/api/student/tests/start', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        router.push('/student/login');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to start test');
      }

      const data = await response.json();
      if (data && data.attemptId) {
        router.push(`/student/test/${data.attemptId}`);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start test');
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
          <div className="text-center text-red-500">
            <p>{error}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={checkQuestions}
            >
              Retry
            </Button>
          </div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="container py-6">
        <h1 className="text-2xl font-bold mb-6">Aptitude Test</h1>

        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Aptitude Test</CardTitle>
            <CardDescription>Test your knowledge and skills</CardDescription>
          </CardHeader>
          <CardContent>
            {hasQuestions ? (
              <div className="text-center">
                <p className="mb-4 text-gray-600">Test questions are available. Click below to start.</p>
                <Button
                  className="w-full bg-primary-blue hover:bg-blue-700"
                  onClick={handleStartTest}
                >
                  Start Test
                </Button>
              </div>
            ) : (
              <div className="text-center py-6">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-red-600 mb-2">No test questions available at the moment</p>
                <p className="text-sm text-gray-500">
                  Please check back later
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </StudentLayout>
  );
} 