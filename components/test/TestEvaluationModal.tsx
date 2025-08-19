import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Course, Test, TestSubmission, Student, Question, Rubric, RubricCriterion, DetailedAiFeedback } from '../../types';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { evaluateAnswer, detectPlagiarism, generateDetailedFeedback } from '../../services/geminiService';
import { Bot, Sparkles, Save, CheckCircle, XCircle, ShieldCheck, ThumbsUp, ThumbsDown, Lightbulb } from 'lucide-react';

interface PlagiarismResult {
    score: number;
    report: string;
}

interface TestEvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course;
  student: Student;
  test: Test;
  submission: TestSubmission;
  onSaveEvaluation: (score: number, feedback: string, rubricEvaluation?: Record<string, number>) => void;
}

const RubricEvaluator: React.FC<{
    rubric: Rubric;
    evaluation: Record<string, number>;
    onEvaluate: (criterionId: string, points: number) => void;
}> = ({ rubric, evaluation, onEvaluate }) => {
    return (
        <div className="space-y-4">
            {rubric.criteria.map(criterion => (
                <div key={criterion.id} className="p-3 border rounded-lg bg-gray-50">
                    <p className="font-semibold text-gray-700">{criterion.description}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {criterion.levels.map(level => (
                            <button
                                key={level.points}
                                onClick={() => onEvaluate(criterion.id, level.points)}
                                className={`px-3 py-1.5 text-sm rounded-md transition-all border ${
                                    evaluation[criterion.id] === level.points
                                        ? 'bg-primary-600 text-white border-primary-700 font-semibold shadow-sm'
                                        : 'bg-white hover:bg-gray-100 border-gray-300'
                                }`}
                            >
                                {level.description} ({level.points} pts)
                            </button>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};


const TestEvaluationModal: React.FC<TestEvaluationModalProps> = ({ isOpen, onClose, course, student, test, submission, onSaveEvaluation }) => {
  const [score, setScore] = useState<number | string>(submission.score ?? '');
  const [feedback, setFeedback] = useState<string>(submission.feedback ?? '');
  const [detailedFeedback, setDetailedFeedback] = useState<DetailedAiFeedback | null>(submission.detailedAiFeedback ?? null);
  const [rubricEvaluation, setRubricEvaluation] = useState<Record<string, number>>(submission.rubricEvaluation ?? {});
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isGeneratingDetails, setIsGeneratingDetails] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isCheckingPlagiarism, setIsCheckingPlagiarism] = useState(false);
  const [plagiarismResult, setPlagiarismResult] = useState<PlagiarismResult | null>(null);
  const [plagiarismError, setPlagiarismError] = useState<string | null>(null);

  useEffect(() => {
    if (test.rubric) {
        const totalPoints = Object.values(rubricEvaluation).reduce((sum, points) => sum + points, 0);
        const maxPoints = test.rubric.criteria.reduce((sum, crit) => sum + Math.max(...crit.levels.map(l => l.points)), 0);
        // Scale to a 10-point score
        const scaledScore = maxPoints > 0 ? (totalPoints / maxPoints) * 10 : 0;
        setScore(parseFloat(scaledScore.toFixed(1)));
    }
  }, [rubricEvaluation, test.rubric]);

  const handleRubricEvaluate = (criterionId: string, points: number) => {
    setRubricEvaluation(prev => ({ ...prev, [criterionId]: points }));
  };

  const answerMap = useMemo(() => 
    new Map(submission.answers.map(a => [a.questionId, a.answer]))
  , [submission.answers]);

  const firstSubjectiveAnswer = useMemo(() => {
    const firstSubjectiveQuestion = test.questions.find(q => q.type === 'subjective');
    return firstSubjectiveQuestion ? answerMap.get(firstSubjectiveQuestion.id) : undefined;
  }, [test.questions, answerMap]);

  const handleEvaluateWithAI = useCallback(async () => {
    if (!firstSubjectiveAnswer) {
      setAiError("Cannot perform AI evaluation: no subjective question found to evaluate.");
      return;
    }
    const questionText = test.questions.find(q => q.type === 'subjective')?.text || '';
    
    setIsEvaluating(true);
    setAiError(null);
    try {
      const result = await evaluateAnswer(questionText, firstSubjectiveAnswer);
      setScore(result.score);
      setFeedback(result.feedback);
    } catch (error) {
      console.error('AI evaluation error:', error);
      setAiError("An error occurred during AI evaluation. Please try again or enter feedback manually.");
    } finally {
      setIsEvaluating(false);
    }
  }, [test.questions, firstSubjectiveAnswer]);

  const handleGenerateDetailedFeedback = async () => {
    if (!firstSubjectiveAnswer) return;
    const questionText = test.questions.find(q => q.type === 'subjective')?.text || '';
    setIsGeneratingDetails(true);
    setAiError(null);
    try {
        const result = await generateDetailedFeedback(questionText, firstSubjectiveAnswer);
        setDetailedFeedback(result);
    } catch (error) {
        console.error('AI detailed feedback error:', error);
        setAiError("An error occurred generating detailed feedback.");
    } finally {
        setIsGeneratingDetails(false);
    }
  };
  
  const handleCheckPlagiarism = async () => {
    if (!firstSubjectiveAnswer) {
      setPlagiarismError("No subjective answer available to check for plagiarism.");
      return;
    }
    setIsCheckingPlagiarism(true);
    setPlagiarismError(null);
    setPlagiarismResult(null);
    try {
        const result = await detectPlagiarism(firstSubjectiveAnswer);
        setPlagiarismResult({ score: result.similarityScore, report: result.report });
    } catch (error) {
        console.error('Plagiarism check error:', error);
        setPlagiarismError("An error occurred while checking for plagiarism.");
    } finally {
        setIsCheckingPlagiarism(false);
    }
  };


  const handleSave = () => {
    const numericScore = Number(score);
    if (!isNaN(numericScore) && numericScore >= 0 && numericScore <= 10 && feedback.trim() !== '') {
        // Here you would also save the detailedFeedback state
        onSaveEvaluation(numericScore, feedback, test.rubric ? rubricEvaluation : undefined);
    } else {
        alert("Please provide a valid overall score (0-10) and feedback.");
    }
  };
  
  const isSaveDisabled = score === '' || feedback.trim() === '' || Number(score) < 0 || Number(score) > 10;

  const renderAnswer = (question: Question) => {
    const studentAnswer = answerMap.get(question.id) || 'No answer provided.';
    
    if (question.type === 'subjective') {
        return <p className="mt-1 text-gray-800 whitespace-pre-wrap">{studentAnswer}</p>;
    }

    const isCorrect = studentAnswer === question.correctAnswer;
    const indicator = isCorrect ? <CheckCircle className="text-green-600"/> : <XCircle className="text-red-600"/>;
    
    return (
        <div className="space-y-1">
            <div className="flex items-center space-x-2">
                {indicator}
                <span className={`font-semibold ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>{studentAnswer}</span>
            </div>
            {!isCorrect && <p className="text-sm text-gray-600 pl-7">Correct answer: <span className="font-semibold">{question.correctAnswer}</span></p>}
        </div>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Evaluate Test: ${test.title}`}>
      <div className="space-y-6">
        <div>
          <h3 className="font-bold text-lg text-gray-800">Test Details</h3>
          <p><span className="font-semibold">Course:</span> {course.title}</p>
          <p><span className="font-semibold">Student:</span> {student.name}</p>
        </div>
        
        <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
            {test.questions.map((question, index) => (
                 <div key={question.id} className="space-y-2">
                    <div className="bg-gray-50 p-3 rounded-lg border">
                        <p className="font-semibold text-gray-700">Question {index + 1} <span className="text-xs capitalize font-normal text-gray-500">({question.type})</span>:</p>
                        <p className="mt-1 text-gray-800">{question.text}</p>
                    </div>

                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <p className="font-semibold text-gray-700">Student's Answer:</p>
                        <div className="mt-1">{renderAnswer(question)}</div>
                    </div>
                 </div>
            ))}
        </div>

        {firstSubjectiveAnswer && (
        <div className="pt-4 border-t">
          <h4 className="font-bold text-lg text-gray-800 mb-2">Academic Integrity Check</h4>
          <Button onClick={handleCheckPlagiarism} loading={isCheckingPlagiarism} variant="secondary">
            <ShieldCheck size={16} className="mr-2"/> Check for Plagiarism
          </Button>
          {plagiarismError && <p className="text-sm text-red-600 mt-2">{plagiarismError}</p>}
          {plagiarismResult && (
            <div className={`mt-3 p-3 rounded-lg border ${plagiarismResult.score > 70 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                <p className="font-semibold">Similarity Score: 
                    <span className={`font-bold ${plagiarismResult.score > 70 ? 'text-red-600' : 'text-green-600'}`}> {plagiarismResult.score}%</span>
                </p>
                <p className="text-sm mt-1">{plagiarismResult.report}</p>
            </div>
          )}
        </div>
        )}
        
        <div className="pt-4 border-t">
          <div className="flex justify-between items-center mb-4">
             <h4 className="font-bold text-lg text-gray-800 flex items-center">
                  <Bot size={22} className="mr-2 text-primary-600"/>
                  Overall Evaluation
              </h4>
             <Button onClick={handleEvaluateWithAI} disabled={isEvaluating || !!test.rubric || !firstSubjectiveAnswer} className="min-w-[180px]">
                <span className="flex items-center justify-center">
                    <Sparkles size={20} className="mr-2" />
                    AI Quick Score
                </span>
             </Button>
          </div>
          <p className="text-xs text-gray-500 -mt-2 mb-3">Note: AI generation is based on the first subjective question to provide a starting point. It's disabled when a rubric is used.</p>
          
          {aiError && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{aiError}</p>}
          
          {test.rubric && (
            <div className="space-y-4 mt-4">
                <h4 className="font-semibold text-gray-800">Grading Rubric</h4>
                <RubricEvaluator rubric={test.rubric} evaluation={rubricEvaluation} onEvaluate={handleRubricEvaluate} />
            </div>
          )}

          <div className="space-y-4 mt-4">
            <div>
                <label htmlFor="score" className="block text-sm font-medium text-gray-700">Overall Score (out of 10)</label>
                <input
                    type="number"
                    id="score"
                    value={score}
                    onChange={(e) => setScore(e.target.value === '' ? '' : Number(e.target.value))}
                    min="0"
                    max="10"
                    step="0.5"
                    className="mt-1 block w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="Enter score"
                    disabled={!!test.rubric}
                />
            </div>
             <div>
                <label htmlFor="feedback" className="block text-sm font-medium text-gray-700">Overall Feedback</label>
                <textarea
                    id="feedback"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={4}
                    className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="Provide constructive feedback for the student..."
                />
            </div>
            <div>
                <Button onClick={handleGenerateDetailedFeedback} variant='secondary' loading={isGeneratingDetails} disabled={!firstSubjectiveAnswer}>
                    <Sparkles size={16} className='mr-2' /> Generate Detailed Feedback
                </Button>
                {detailedFeedback && (
                    <div className='mt-3 space-y-2'>
                        <div className='p-3 bg-green-50 border border-green-200 rounded-lg'>
                            <h5 className='font-semibold flex items-center'><ThumbsUp size={16} className='mr-2 text-green-600'/>Strengths</h5>
                            <p className='text-sm text-gray-700'>{detailedFeedback.strengths}</p>
                        </div>
                         <div className='p-3 bg-yellow-50 border border-yellow-200 rounded-lg'>
                            <h5 className='font-semibold flex items-center'><ThumbsDown size={16} className='mr-2 text-yellow-600'/>Weaknesses</h5>
                            <p className='text-sm text-gray-700'>{detailedFeedback.weaknesses}</p>
                        </div>
                         <div className='p-3 bg-blue-50 border border-blue-200 rounded-lg'>
                            <h5 className='font-semibold flex items-center'><Lightbulb size={16} className='mr-2 text-blue-600'/>Suggestion</h5>
                            <p className='text-sm text-gray-700'>{detailedFeedback.suggestion}</p>
                        </div>
                    </div>
                )}
            </div>
          </div>
        </div>
      </div>
       <div className="pt-6 mt-6 flex justify-end space-x-3 border-t">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={isSaveDisabled}>
            <Save size={16} className="mr-2" />
            Save Evaluation
          </Button>
        </div>
    </Modal>
  );
};

export default TestEvaluationModal;