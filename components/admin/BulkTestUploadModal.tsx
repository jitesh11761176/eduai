import React, { useState } from "react";
import Modal from "../common/Modal";
import Button from "../common/Button";

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface BulkTestUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (testData: {
    title: string;
    difficulty: "Easy" | "Medium" | "Hard";
    durationMinutes: number;
    questions: Question[];
  }) => void;
  examName?: string;
  categoryName?: string;
}

const BulkTestUploadModal: React.FC<BulkTestUploadModalProps> = ({
  isOpen,
  onClose,
  onUpload,
  examName,
  categoryName,
}) => {
  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [uploadedData, setUploadedData] = useState<Question[] | null>(null);
  const [error, setError] = useState("");

  const downloadTemplate = () => {
    const template = {
      instructions: "Fill in the questions array with your test questions. Each question must have: question text, 4 options, correctAnswer (0-3 index), and optional explanation.",
      example: {
        question: "What is the capital of India?",
        options: ["Mumbai", "New Delhi", "Kolkata", "Chennai"],
        correctAnswer: 1,
        explanation: "New Delhi is the capital of India."
      },
      questions: [
        {
          question: "Sample question text here",
          options: ["Option A", "Option B", "Option C", "Option D"],
          correctAnswer: 0,
          explanation: "Explanation for the correct answer (optional)"
        }
      ]
    };

    const blob = new Blob([JSON.stringify(template, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "test-questions-template.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadCSVTemplate = () => {
    const csvContent = `Question,Option A,Option B,Option C,Option D,Correct Answer (0-3),Explanation (Optional)
"What is 2+2?","2","3","4","5",2,"2+2 equals 4"
"Capital of France?","London","Paris","Berlin","Madrid",1,"Paris is the capital of France"
"Largest planet?","Earth","Mars","Jupiter","Venus",2,"Jupiter is the largest planet"`;

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "test-questions-template.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError("");
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        
        if (file.name.endsWith(".json")) {
          const data = JSON.parse(content);
          const questions = data.questions || data;
          
          // Validate questions
          if (!Array.isArray(questions)) {
            throw new Error("Questions must be an array");
          }

          const validatedQuestions = questions.map((q: any, idx: number) => {
            if (!q.question || !Array.isArray(q.options) || q.options.length !== 4) {
              throw new Error(`Question ${idx + 1}: Invalid format. Must have question text and 4 options`);
            }
            if (typeof q.correctAnswer !== "number" || q.correctAnswer < 0 || q.correctAnswer > 3) {
              throw new Error(`Question ${idx + 1}: correctAnswer must be a number between 0 and 3`);
            }
            return {
              question: q.question,
              options: q.options,
              correctAnswer: q.correctAnswer,
              explanation: q.explanation || "",
            };
          });

          setUploadedData(validatedQuestions);
          setError(`✓ Successfully loaded ${validatedQuestions.length} questions from JSON`);
        } else if (file.name.endsWith(".csv")) {
          const lines = content.split("\n").filter(line => line.trim());
          if (lines.length < 2) {
            throw new Error("CSV file must have at least a header row and one question");
          }

          const questions: Question[] = [];
          for (let i = 1; i < lines.length; i++) {
            const match = lines[i].match(/("([^"]*)"|[^,]+)/g);
            if (!match || match.length < 6) continue;

            const cleanValue = (val: string) => val.replace(/^"|"$/g, "").trim();
            
            const question = cleanValue(match[0]);
            const options = [
              cleanValue(match[1]),
              cleanValue(match[2]),
              cleanValue(match[3]),
              cleanValue(match[4]),
            ];
            const correctAnswer = parseInt(cleanValue(match[5]));
            const explanation = match[6] ? cleanValue(match[6]) : "";

            if (question && options.every(o => o) && !isNaN(correctAnswer) && correctAnswer >= 0 && correctAnswer <= 3) {
              questions.push({ question, options, correctAnswer, explanation });
            }
          }

          if (questions.length === 0) {
            throw new Error("No valid questions found in CSV file");
          }

          setUploadedData(questions);
          setError(`✓ Successfully loaded ${questions.length} questions from CSV`);
        } else {
          throw new Error("Please upload a .json or .csv file");
        }
      } catch (err: any) {
        setError(`Error: ${err.message}`);
        setUploadedData(null);
      }
    };

    reader.readAsText(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!uploadedData || uploadedData.length === 0) {
      setError("Please upload a question file first");
      return;
    }

    if (!title.trim()) {
      setError("Please enter a test title");
      return;
    }

    onUpload({
      title,
      difficulty,
      durationMinutes,
      questions: uploadedData,
    });

    // Reset form
    setTitle("");
    setDifficulty("Medium");
    setDurationMinutes(30);
    setUploadedData(null);
    setError("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Bulk Upload Test Questions">
      <form onSubmit={handleSubmit} className="space-y-6">
        {examName && categoryName && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">Exam:</span> {examName} <br />
              <span className="font-semibold">Category:</span> {categoryName}
            </p>
          </div>
        )}

        {/* Test Details */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Test Title *
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., General Awareness - Set 1"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">
              Difficulty
            </label>
            <select
              id="difficulty"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as "Easy" | "Medium" | "Hard")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
              Duration (minutes)
            </label>
            <input
              type="number"
              id="duration"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(parseInt(e.target.value))}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Download Templates */}
        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
          <h4 className="text-sm font-semibold text-slate-900 mb-3">Step 1: Download Template</h4>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={downloadTemplate}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg transition-colors text-sm"
            >
              📄 Download JSON Template
            </button>
            <button
              type="button"
              onClick={downloadCSVTemplate}
              className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-medium px-4 py-2 rounded-lg transition-colors text-sm"
            >
              📊 Download CSV Template
            </button>
          </div>
          <p className="text-xs text-slate-600 mt-2">
            Download a template, fill in your questions, then upload below
          </p>
        </div>

        {/* Upload File */}
        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
          <h4 className="text-sm font-semibold text-slate-900 mb-3">Step 2: Upload Filled Template</h4>
          <input
            type="file"
            accept=".json,.csv"
            onChange={handleFileUpload}
            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {error && (
            <p className={`mt-2 text-sm ${error.startsWith("✓") ? "text-green-600" : "text-red-600"}`}>
              {error}
            </p>
          )}
        </div>

        {/* Preview */}
        {uploadedData && uploadedData.length > 0 && (
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <h4 className="text-sm font-semibold text-green-900 mb-2">
              ✓ Preview: {uploadedData.length} Questions Loaded
            </h4>
            <div className="max-h-48 overflow-y-auto space-y-2">
              {uploadedData.slice(0, 3).map((q, idx) => (
                <div key={idx} className="bg-white rounded p-3 text-xs">
                  <p className="font-medium text-slate-800">{idx + 1}. {q.question}</p>
                  <ul className="mt-1 space-y-1 text-slate-600">
                    {q.options.map((opt, i) => (
                      <li key={i} className={i === q.correctAnswer ? "text-green-600 font-medium" : ""}>
                        {String.fromCharCode(65 + i)}. {opt} {i === q.correctAnswer && "✓"}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              {uploadedData.length > 3 && (
                <p className="text-xs text-slate-600 text-center">
                  ... and {uploadedData.length - 3} more questions
                </p>
              )}
            </div>
          </div>
        )}

        {/* Submit */}
        <div className="pt-4 flex justify-end space-x-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={!uploadedData || uploadedData.length === 0 || !title.trim()}>
            Create Test ({uploadedData?.length || 0} Questions)
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default BulkTestUploadModal;
