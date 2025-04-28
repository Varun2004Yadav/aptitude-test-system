import * as XLSX from "xlsx";
import { useState } from "react";
import { X, FileText, Upload, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent } from "@/components/ui/tabs";

interface CreateTestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Question {
  id: string;
  questionText: string;
  options: string[];
  correctAnswer: string | string[];
  type: "MCQ" | "MSQ" | "NAT";
}

export function CreateTestModal({ isOpen, onClose }: CreateTestModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("upload");
  const [testDetails, setTestDetails] = useState({
    title: "",
    class: "",
    duration: "",
    date: "",
    time: "",
    totalMarks: "",
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as Array<Array<string>>;

    const parsedQuestions: Question[] = [];

    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i] as [number, string, string, string, string];

      parsedQuestions.push({
        id: String(i),
        questionText: row[1],
        options: (row[2] as string).split(",").map((opt: string) => opt.trim()),
        correctAnswer: row[4] === "MSQ"
          ? (row[3] as string).split(",").map((ans: string) => ans.trim())
          : (row[3] as string).trim(),
        type: row[4] as "MCQ" | "MSQ" | "NAT",
      });
    }

    setQuestions(parsedQuestions);
    setSelectedFile(file);
  };

  const handleTestDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTestDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      onClose();
    } catch (error) {
      console.error('Error saving test:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto bg-[#f9fafb] pt-4 flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between mb-2">
            <span>Create New Test</span>
            <Button variant="ghost" size="icon" onClick={onClose}  className="h-8 w-8">
              <X />
            </Button>
          </DialogTitle>
        </DialogHeader>

        {/* Step Buttons */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <Button
            variant={activeTab === "details" ? "default" : "outline"}
            onClick={() => setActiveTab("details")}
            className={`flex items-center justify-center h-14 w-44 rounded-lg text-sm gap-2 transition
              ${activeTab === "details" ? "bg-[#3b82f6] text-white" : "bg-white text-[#2563eb] hover:bg-blue-50"}`}
          >
            <ClipboardList className="h-4 w-4" />
            Test Details
          </Button>

          <label
            htmlFor="file-upload"
            className={`flex items-center justify-center h-14 w-44 cursor-pointer rounded-lg border-2 text-sm gap-2 transition
              ${activeTab === "upload" ? "bg-[#3b82f6] text-white" : "bg-white text-[#2563eb] hover:bg-blue-50"}`}
          >
            <Upload className="h-4 w-4" />
            Upload File
            <input
              id="file-upload"
              type="file"
              accept=".csv,.txt,.xlsx"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>

        {selectedFile && (
          <div className="text-center text-sm text-[#2563eb] mb-4 font-medium">
            Selected file: {selectedFile.name}
          </div>
        )}

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 min-h-0">
          <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val)} className="h-full">
            <TabsContent value="upload" className="flex flex-col h-full">
              {questions.length > 0 && (
                <div className="flex flex-col gap-4 flex-1 min-h-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Questions Preview</h3>
                    <Badge variant="outline">{questions.length} Questions</Badge>
                  </div>
                  <ScrollArea className="flex-1 min-h-0">
                    <div className="flex flex-col gap-4">
                      {questions.map((question) => (
                        <div key={question.id} className="p-4 rounded-lg border bg-gray-50">
                          <div className="flex items-start gap-2">
                            <FileText className="h-5 w-5 text-blue-600 mt-1" />
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
                                  Correct: {Array.isArray(question.correctAnswer)
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
            </TabsContent>

            <TabsContent value="details" className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {["title", "class", "duration", "totalMarks", "date", "time"].map(field => (
                  <div className="space-y-2" key={field}>
                    <Label htmlFor={field}>{field.charAt(0).toUpperCase() + field.slice(1)}</Label>
                    <Input
                      id={field}
                      name={field}
                      type={field === "duration" || field === "totalMarks" ? "number" : (field === "date" ? "date" : (field === "time" ? "time" : "text"))}
                      value={testDetails[field as keyof typeof testDetails]}
                      onChange={handleTestDetailsChange}
                      placeholder={`Enter ${field}`}
                    />
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* BOTTOM BUTTONS */}
        <div className="flex justify-end gap-4 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading || !selectedFile || !testDetails.title}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? "Saving..." : "Create Test"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
