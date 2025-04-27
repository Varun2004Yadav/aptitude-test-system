import { useState } from "react"
import { X, FileText, Upload, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

interface CreateTestModalProps {
  isOpen: boolean
  onClose: () => void
}

interface Question {
  id: string
  questionText: string
  options: string[]
  correctAnswer: string | string[]
  type: "MCQ" | "MSQ" | "NAT"
}

export function CreateTestModal({ isOpen, onClose }: CreateTestModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("upload")
  const [testDetails, setTestDetails] = useState({
    title: "",
    class: "",
    duration: "",
    date: "",
    time: "",
    totalMarks: "",
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      // Here you would parse the file and set the questions
      // For now, we'll use mock data
      setQuestions([
        {
          id: "1",
          questionText: "What is the time complexity of binary search?",
          options: ["O(n)", "O(log n)", "O(n^2)", "O(1)"],
          correctAnswer: "O(log n)",
          type: "MCQ"
        },
        {
          id: "2",
          questionText: "Which of these are sorting algorithms?",
          options: ["Bubble Sort", "Quick Sort", "Merge Sort", "Binary Search"],
          correctAnswer: ["Bubble Sort", "Quick Sort", "Merge Sort"],
          type: "MSQ"
        }
      ])
    }
  }

  const handleTestDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setTestDetails(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // Here you would make an API call to save the test
      await new Promise(resolve => setTimeout(resolve, 1000))
      onClose()
    } catch (error) {
      console.error('Error saving test:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Create New Test</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload Questions</TabsTrigger>
            <TabsTrigger value="details">Test Details</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file">Upload Questions File</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="file"
                    type="file"
                    accept=".csv,.txt,.xlsx"
                    onChange={handleFileChange}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    className="shrink-0"
                    disabled={!selectedFile}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                </div>
                {selectedFile && (
                  <p className="text-sm text-gray-500">
                    Selected file: {selectedFile.name}
                  </p>
                )}
              </div>

              {questions.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Questions Preview</h3>
                    <Badge variant="outline">{questions.length} Questions</Badge>
                  </div>
                  <ScrollArea className="h-[400px] rounded-md border p-4">
                    <div className="space-y-4">
                      {questions.map((question, index) => (
                        <div
                          key={question.id}
                          className="p-4 rounded-lg border bg-gray-50"
                        >
                          <div className="flex items-start gap-2">
                            <FileText className="h-5 w-5 text-primary-blue mt-1" />
                            <div className="space-y-2 flex-1">
                              <p className="font-medium">{question.questionText}</p>
                              {question.options.length > 0 && (
                                <ul className="list-disc list-inside text-sm text-gray-600">
                                  {question.options.map((option, i) => (
                                    <li key={i}>{option}</li>
                                  ))}
                                </ul>
                              )}
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary">{question.type}</Badge>
                                <Badge variant="outline">
                                  Correct Answer: {Array.isArray(question.correctAnswer) 
                                    ? question.correctAnswer.join(", ")
                                    : question.correctAnswer}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Test Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={testDetails.title}
                  onChange={handleTestDetailsChange}
                  placeholder="Enter test title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="class">Class</Label>
                <Input
                  id="class"
                  name="class"
                  value={testDetails.class}
                  onChange={handleTestDetailsChange}
                  placeholder="Enter class name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  name="duration"
                  type="number"
                  value={testDetails.duration}
                  onChange={handleTestDetailsChange}
                  placeholder="Enter duration in minutes"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalMarks">Total Marks</Label>
                <Input
                  id="totalMarks"
                  name="totalMarks"
                  type="number"
                  value={testDetails.totalMarks}
                  onChange={handleTestDetailsChange}
                  placeholder="Enter total marks"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={testDetails.date}
                  onChange={handleTestDetailsChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  name="time"
                  type="time"
                  value={testDetails.time}
                  onChange={handleTestDetailsChange}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-4 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading || !selectedFile || !testDetails.title}
            className="bg-primary-blue hover:bg-blue-700"
          >
            {isLoading ? "Saving..." : "Create Test"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 