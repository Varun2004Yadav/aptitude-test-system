import React, { useState, useEffect } from "react";
import axios from "axios";

const AvailableTests = () => {
  const [hasQuestions, setHasQuestions] = useState(false);
  const [loading, setLoading] = useState(true);
  const [testStarted, setTestStarted] = useState(false);
  const [attemptInfo, setAttemptInfo] = useState(null);

  useEffect(() => {
    const checkQuestions = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/student/questions", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        setHasQuestions(response.data.length > 0);
        setLoading(false);
      } catch (error) {
        setHasQuestions(false);
        setLoading(false);
      }
    };
    checkQuestions();
  }, []);

  const handleStartTest = async () => {
    try {
      const response = await axios.post("http://localhost:5000/api/student/tests/start", {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setTestStarted(true);
      setAttemptInfo(response.data);
    } catch (error) {
      alert("Failed to start test. Please try again.");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (testStarted) {
    // Render your TestTaking component here
    return (
      <div>
        <h2>Test Started!</h2>
        {/* <TestTaking attemptId={attemptInfo.attemptId} ... /> */}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Aptitude Test</h2>
        {hasQuestions ? (
          <div className="text-center">
            <p className="mb-4 text-gray-600">Test questions are available. Click below to start.</p>
            <button
              onClick={handleStartTest}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start Test
            </button>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-red-600 mb-4">No test questions available at the moment.</p>
            <p className="text-gray-600">Please check back later.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AvailableTests; 