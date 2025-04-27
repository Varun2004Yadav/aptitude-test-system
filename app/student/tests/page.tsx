"use client";

import { useState, useEffect } from "react";
import { StudentLayout } from "@/components/student-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Calendar, FileText } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Test {
  _id: string;
  title: string;
  startTime: string;
  duration: number;
  totalMarks: number;
}

export default function AvailableTests() {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchAvailableTests();
  }, []);

  const fetchAvailableTests = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/student/tests/available', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tests');
      }

      const data = await response.json();
      setTests(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tests');
    } finally {
      setLoading(false);
    }
  };

  const handleStartTest = (testId: string) => {
    router.push(`/student/tests/${testId}/instructions`);
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
              onClick={fetchAvailableTests}
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
        <h1 className="text-2xl font-bold mb-6">Available Tests</h1>

        {tests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tests.map((test) => (
              <Card key={test._id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle>{test.title}</CardTitle>
                  <CardDescription>Total Marks: {test.totalMarks}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>
                        {new Date(test.startTime).toLocaleDateString()} at{" "}
                        {new Date(test.startTime).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>{test.duration} minutes</span>
                    </div>
                    <Button
                      className="w-full bg-primary-blue hover:bg-blue-700"
                      onClick={() => handleStartTest(test._id)}
                    >
                      Start Test
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">No tests available at the moment</p>
            <p className="text-sm text-gray-400 mt-2">
              Check back later for new tests
            </p>
          </div>
        )}
      </div>
    </StudentLayout>
  );
} 