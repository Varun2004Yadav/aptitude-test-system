"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

function QuestionUpload({ testId }: { testId: string }) {
    return <div>Upload questions for test: {testId}</div>;
}

export default function CreateTest() {
    const router = useRouter()
    const [testData, setTestData] = useState({
        title: '',
        description: '',
        duration: '',
        totalMarks: ''
    })
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [testId, setTestId] = useState<string | null>(null)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setTestData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (!testData.title || !testData.duration || !testData.totalMarks) {
            setError('Please fill in all required fields')
            return
        }

        setIsLoading(true)

        try {
            const response = await fetch('http://localhost:5000/api/tests/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(testData)
            })

            if (!response.ok) {
                throw new Error('Failed to create test')
            }

            const data = await response.json()
            setTestId(data.test._id)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create test')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="container py-8">
            <Card>
                <CardHeader>
                    <CardTitle>Create New Test</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="title">Test Title</Label>
                            <Input
                                id="title"
                                name="title"
                                value={testData.title}
                                onChange={handleChange}
                                placeholder="Enter test title"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Input
                                id="description"
                                name="description"
                                value={testData.description}
                                onChange={handleChange}
                                placeholder="Enter test description"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="duration">Duration (minutes)</Label>
                                <Input
                                    id="duration"
                                    name="duration"
                                    type="number"
                                    value={testData.duration}
                                    onChange={handleChange}
                                    placeholder="Enter duration"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="totalMarks">Total Marks</Label>
                                <Input
                                    id="totalMarks"
                                    name="totalMarks"
                                    type="number"
                                    value={testData.totalMarks}
                                    onChange={handleChange}
                                    placeholder="Enter total marks"
                                    required
                                />
                            </div>
                        </div>

                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Creating...' : 'Create Test'}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {testId && (
                <div className="mt-8">
                    <QuestionUpload testId={testId} />
                </div>
            )}
        </div>
    )
} 