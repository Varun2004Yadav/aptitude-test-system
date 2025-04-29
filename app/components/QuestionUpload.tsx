"use client"

import { useState } from 'react'
import { Upload, FileText, X, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'

interface Question {
    question: string;
    options: string[];
    correctAnswer: string;
    marks: number;
}

export default function QuestionUpload({ testId }: { testId: string }) {
    const [file, setFile] = useState<File | null>(null)
    const [questions, setQuestions] = useState<Question[]>([])
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (selectedFile) {
            if (selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                selectedFile.type === 'application/vnd.ms-excel') {
                setFile(selectedFile)
                setError('')
            } else {
                setError('Please upload an Excel file (.xlsx or .xls)')
            }
        }
    }

    const handleUpload = async () => {
        if (!file) {
            setError('Please select a file first')
            return
        }

        setIsLoading(true)
        setError('')
        setUploadProgress(0)

        const formData = new FormData()
        formData.append('questionsFile', file)
        formData.append('testId', testId)

        try {
            const response = await fetch('http://localhost:5000/api/tests/' + testId + '/questions', {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })

            if (!response.ok) {
                throw new Error('Failed to upload questions')
            }

            const data = await response.json()
            setQuestions(data.questions)
            setFile(null)
            setUploadProgress(100)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to upload questions')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Upload Questions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <div className="flex items-center space-x-4">
                            <label className="flex-1">
                                <input
                                    type="file"
                                    accept=".xlsx,.xls"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    disabled={isLoading}
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full"
                                    disabled={isLoading}
                                >
                                    <Upload className="mr-2 h-4 w-4" />
                                    Choose File
                                </Button>
                            </label>
                            <Button
                                onClick={handleUpload}
                                disabled={!file || isLoading}
                            >
                                {isLoading ? 'Uploading...' : 'Upload'}
                            </Button>
                        </div>

                        {file && (
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                                <FileText className="h-4 w-4" />
                                <span>{file.name}</span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setFile(null)}
                                    disabled={isLoading}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        )}

                        {isLoading && (
                            <Progress value={uploadProgress} className="w-full" />
                        )}
                    </div>
                </CardContent>
            </Card>

            {questions.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Preview Questions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {questions.map((q, index) => (
                                <div key={index} className="border rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-medium">Question {index + 1}</h3>
                                        <span className="text-sm text-gray-500">{q.marks} marks</span>
                                    </div>
                                    <p className="mb-2">{q.question}</p>
                                    <div className="space-y-1">
                                        {q.options.map((option, i) => (
                                            <div key={i} className="flex items-center space-x-2">
                                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                                    option === q.correctAnswer ? 'border-green-500 bg-green-50' : ''
                                                }`}>
                                                    {option === q.correctAnswer && (
                                                        <Check className="h-3 w-3 text-green-500" />
                                                    )}
                                                </div>
                                                <span>{option}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
} 