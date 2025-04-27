"use client";

import { useState, useEffect } from "react";
import { StudentLayout } from "@/components/student-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Clock, FileText, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface Test {
  _id: string;
  title: string;
  duration: number;
}

export default function TestInstructions({ params }: { params: { testId: string } }) {
  const [test, setTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchTestDetails();
  }, [params.testId]);

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

  const handleStartTest = () => {
    router.push(`/student/tests/${params.testId}/attempt`);
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

  return (
    <StudentLayout>
      <div className="container py-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{test?.title}</CardTitle>
            <CardDescription>Please read the instructions carefully before starting the test</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-2">
                  <Clock className="h-5 w-5 text-primary-blue mt-1" />
                  <div>
                    <h3 className="font-medium">Time Limit</h3>
                    <p className="text-sm text-gray-500">
                      The test duration is {test?.duration} minutes. The timer will start as soon as you click "Start Now".
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <FileText className="h-5 w-5 text-primary-blue mt-1" />
                  <div>
                    <h3 className="font-medium">Test Format</h3>
                    <p className="text-sm text-gray-500">
                      The test consists of multiple-choice questions. Each question has four options, and you need to select the correct one.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <X className="h-5 w-5 text-red-500 mt-1" />
                  <div>
                    <h3 className="font-medium">Important Instructions</h3>
                    <ul className="list-disc list-inside text-sm text-gray-500 space-y-1">
                      <li>Do not close the browser tab or window during the test</li>
                      <li>Do not refresh the page during the test</li>
                      <li>The test will be automatically submitted when the timer ends</li>
                      <li>You cannot go back to previous questions after submission</li>
                      <li>Ensure a stable internet connection throughout the test</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  By clicking "Start Now", you confirm that you have read and understood all the instructions.
                </AlertDescription>
              </Alert>

              <div className="flex justify-end gap-4">
                <Button
                  variant="outline"
                  onClick={() => router.push('/student/tests')}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-primary-blue hover:bg-blue-700"
                  onClick={handleStartTest}
                >
                  Start Now
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </StudentLayout>
  );
} 