import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { explainTextDifferently } from '../../services/geminiService';
import { Lightbulb, BookOpen, HelpCircle, Sparkles } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';

interface ExplainTextModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedText: string;
}

type ExplainMode = 'simple' | 'example' | 'quiz';

const ExplainTextModal: React.FC<ExplainTextModalProps> = ({ isOpen, onClose, selectedText }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [quizResult, setQuizResult] = useState<{ question: string; options: string[]; correctAnswer: string; } | null>(null);

  const handleExplain = async (mode: ExplainMode) => {
    setIsLoading(true);
    setError(null);
    setResponse(null);
    setQuizResult(null);
    try {
      const result = await explainTextDifferently(selectedText, mode);
      if (mode === 'quiz') {
        setQuizResult(JSON.parse(result));
      } else {
        setResponse(result);
      }
    } catch (err) {
      console.error(err);
      setError('Sorry, I couldn\'t process that request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AI Learning Assistant">
      <div className="space-y-4">
        <div className="p-4 bg-gray-50 rounded-lg border">
          <p className="font-semibold text-gray-700">You selected:</p>
          <p className="mt-1 text-gray-600 italic">"{selectedText}"</p>
        </div>

        <div>
          <p className="font-semibold text-gray-700 mb-2">How can I help you with this?</p>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => handleExplain('simple')} disabled={isLoading}><Lightbulb size={16} className="mr-2"/>Explain Simply</Button>
            <Button variant="secondary" onClick={() => handleExplain('example')} disabled={isLoading}><BookOpen size={16} className="mr-2"/>Give an Example</Button>
            <Button variant="secondary" onClick={() => handleExplain('quiz')} disabled={isLoading}><HelpCircle size={16} className="mr-2"/>Quiz Me</Button>
          </div>
        </div>

        <div className="pt-4 border-t min-h-[100px]">
          {isLoading && <div className="flex justify-center items-center p-8"><LoadingSpinner /></div>}
          {error && <p className="text-red-600">{error}</p>}
          {response && (
             <div className="p-4 bg-primary-50 rounded-lg border border-primary-200">
                <h4 className="font-bold text-lg text-gray-800 flex items-center mb-2"><Sparkles size={18} className="mr-2 text-primary-600"/>AI Response</h4>
                <p className="text-gray-700 whitespace-pre-wrap">{response}</p>
             </div>
          )}
          {quizResult && (
             <div className="p-4 bg-primary-50 rounded-lg border border-primary-200 space-y-3">
                <p className="font-semibold">{quizResult.question}</p>
                <div className="space-y-2">
                    {quizResult.options.map((opt, i) => <div key={i} className="p-2 border rounded bg-white">{opt}</div>)}
                </div>
                <details>
                    <summary className="cursor-pointer font-semibold text-primary-700">Show Answer</summary>
                    <p className="mt-2 p-2 bg-green-100 rounded border border-green-300">Correct Answer: {quizResult.correctAnswer}</p>
                </details>
             </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ExplainTextModal;
