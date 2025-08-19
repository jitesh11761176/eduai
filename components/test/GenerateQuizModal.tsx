import React, { useState } from 'react';
import { Course, Chapter, GeneratedQuestion } from '../../types';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { generateFullQuiz } from '../../services/geminiService';
import { Sparkles, FileText, CheckSquare, MessageSquare } from 'lucide-react';

interface GenerateQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQuizGenerated: (title: string, questions: GeneratedQuestion[]) => void;
  course: Course;
  chapter: Chapter;
}

const GenerateQuizModal: React.FC<GenerateQuizModalProps> = ({ isOpen, onClose, onQuizGenerated, course, chapter }) => {
  const [numMCQ, setNumMCQ] = useState(2);
  const [numTF, setNumTF] = useState(1);
  const [numSubjective, setNumSubjective] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setError(null);
    try {
      const result = await generateFullQuiz(chapter, course, {
        numMCQ,
        numTF,
        numSubjective,
      });
      onQuizGenerated(result.title, result.questions);
    } catch (err) {
      console.error(err);
      setError('An error occurred while generating the quiz. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const isFormValid = numMCQ >= 0 && numTF >= 0 && numSubjective >= 0 && (numMCQ + numTF + numSubjective > 0);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Generate Full Quiz with AI">
      <form onSubmit={handleSubmit} className="space-y-6">
        <p className="text-sm text-gray-600">
          Specify the number of questions for each type. The AI will generate a quiz based on the materials in the chapter: <span className="font-semibold">{chapter.title}</span>.
        </p>
        
        <div className="space-y-4 rounded-lg border p-4">
            <div className="flex items-center justify-between">
                <label htmlFor="mcq" className="flex items-center text-sm font-medium text-gray-700">
                    <CheckSquare size={16} className="mr-2 text-primary-600"/>
                    Multiple-Choice Questions
                </label>
                <input
                    type="number"
                    id="mcq"
                    value={numMCQ}
                    onChange={(e) => setNumMCQ(Math.max(0, parseInt(e.target.value, 10)))}
                    min="0"
                    className="w-20 p-2 border border-gray-300 rounded-md text-center"
                />
            </div>
             <div className="flex items-center justify-between">
                <label htmlFor="tf" className="flex items-center text-sm font-medium text-gray-700">
                    <FileText size={16} className="mr-2 text-green-600"/>
                    True/False Questions
                </label>
                <input
                    type="number"
                    id="tf"
                    value={numTF}
                    onChange={(e) => setNumTF(Math.max(0, parseInt(e.target.value, 10)))}
                    min="0"
                    className="w-20 p-2 border border-gray-300 rounded-md text-center"
                />
            </div>
             <div className="flex items-center justify-between">
                <label htmlFor="subjective" className="flex items-center text-sm font-medium text-gray-700">
                    <MessageSquare size={16} className="mr-2 text-purple-600"/>
                    Subjective Questions
                </label>
                <input
                    type="number"
                    id="subjective"
                    value={numSubjective}
                    onChange={(e) => setNumSubjective(Math.max(0, parseInt(e.target.value, 10)))}
                    min="0"
                    className="w-20 p-2 border border-gray-300 rounded-md text-center"
                />
            </div>
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}

        <div className="pt-4 flex justify-end space-x-3">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isGenerating}>
            Cancel
          </Button>
          <Button type="submit" disabled={!isFormValid || isGenerating} loading={isGenerating}>
            <Sparkles size={16} className="mr-2"/>
            {isGenerating ? 'Generating...' : 'Generate Quiz'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default GenerateQuizModal;