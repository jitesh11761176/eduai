import React, { useState, useEffect, useCallback } from 'react';
import { Course, Chapter, Test, Question } from '../../types';
import Card from '../common/Card';
import Button from '../common/Button';
import { ArrowLeft, Send, Clock, PlayCircle, ChevronRight } from 'lucide-react';

interface TestTakingPageProps {
  course: Course;
  chapter: Chapter;
  test: Test;
  onBack: () => void;
  onSubmit: (answers: { questionId: string; answer: string }[]) => void;
}

const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const TestTakingPage: React.FC<TestTakingPageProps> = ({ course, chapter, test, onBack, onSubmit }) => {
  const [answers, setAnswers] = useState<Record<string, string>>(() => 
    test.questions.reduce((acc, q) => ({ ...acc, [q.id]: '' }), {})
  );

  const [hasStarted, setHasStarted] = useState(!test.duration);
  const [timeLeft, setTimeLeft] = useState(test.duration ? test.duration * 60 : 0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const isAdaptive = test.isAdaptive;
  const currentQuestion = test.questions[currentQuestionIndex];

  const handleSubmit = useCallback((isAutoSubmit = false) => {
    if (!isAutoSubmit) {
        if (!window.confirm('Are you sure you want to submit your answers? You cannot change them later.')) {
            return;
        }
    } else {
        alert("Time is up! Your answers have been submitted automatically.");
    }

    const formattedAnswers = test.questions.map(q => ({
        questionId: q.id,
        answer: answers[q.id] || ''
    }));
    onSubmit(formattedAnswers);
  }, [answers, onSubmit, test.questions]);

  useEffect(() => {
    if (!hasStarted || !test.duration) return;

    if (timeLeft <= 0) {
        handleSubmit(true);
        return;
    }

    const timerId = setInterval(() => {
        setTimeLeft(prevTime => (prevTime > 0 ? prevTime - 1 : 0));
    }, 1000);

    return () => clearInterval(timerId);
  }, [hasStarted, test.duration, timeLeft, handleSubmit]);


  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };
  
  const handleNextQuestion = () => {
    if (!answers[currentQuestion.id]?.trim()) {
        alert('Please provide an answer before moving to the next question.');
        return;
    }
    // Simple progression for simulation. A real adaptive test would have complex logic here.
    if (currentQuestionIndex < test.questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const startTest = () => {
    const durationMessage = test.duration ? `You will have ${test.duration} minutes to complete it. The test will automatically submit when time runs out.` : '';
    if (window.confirm(`This is a test. ${durationMessage} Are you ready to begin?`)) {
        setHasStarted(true);
    }
  };
  
  const renderQuestionInput = (question: Question) => {
    // Input rendering logic remains the same
    switch (question.type) {
        case 'subjective':
             return <textarea value={answers[question.id] || ''} onChange={(e) => handleAnswerChange(question.id, e.target.value)} rows={8} className="w-full p-3 border border-gray-300 rounded-md shadow-sm" placeholder={`Type your detailed answer here...`}/>;
        case 'mcq':
            return (
                <div className="space-y-3">
                    {question.options?.map((option, index) => (
                        <label key={index} className="flex items-center p-3 border rounded-md hover:bg-gray-100 cursor-pointer">
                            <input type="radio" name={question.id} value={option} checked={answers[question.id] === option} onChange={(e) => handleAnswerChange(question.id, e.target.value)} className="mr-3 h-4 w-4 text-primary-600 focus:ring-primary-500"/>
                            <span>{option}</span>
                        </label>
                    ))}
                </div>
            );
        case 'true-false':
            return (
                <div className="flex space-x-4">
                     <label className="flex items-center p-3 border rounded-md hover:bg-gray-100 cursor-pointer w-32 justify-center">
                        <input type="radio" name={question.id} value="True" checked={answers[question.id] === "True"} onChange={(e) => handleAnswerChange(question.id, e.target.value)} className="mr-3 h-4 w-4 text-primary-600 focus:ring-primary-500"/>
                        <span>True</span>
                    </label>
                    <label className="flex items-center p-3 border rounded-md hover:bg-gray-100 cursor-pointer w-32 justify-center">
                        <input type="radio" name={question.id} value="False" checked={answers[question.id] === "False"} onChange={(e) => handleAnswerChange(question.id, e.target.value)} className="mr-3 h-4 w-4 text-primary-600 focus:ring-primary-500"/>
                        <span>False</span>
                    </label>
                </div>
            );
        default: return <p>Unsupported question type.</p>;
    }
  };

  if (!test.questions || test.questions.length === 0) return <div><p>This test has no questions.</p><Button onClick={onBack}>Go Back</Button></div>
  
  if (!hasStarted) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto text-center">
        <Card className="p-8">
            <Clock size={48} className="mx-auto text-primary-500 mb-4" />
            <h1 className="text-3xl font-bold text-gray-800">{isAdaptive ? 'Adaptive Test' : 'Test'}: {test.title}</h1>
            {test.duration && <p className="text-lg text-gray-600 mt-2">You will have <span className="font-bold text-primary-600">{test.duration} minutes</span> to complete this test.</p>}
            {isAdaptive && <p className="text-gray-500 mt-4">This is an adaptive test. Questions are presented one at a time. Your answer determines the next question.</p>}
            <p className="text-gray-500 mt-4">Your answers will be submitted automatically when the time is up. Please ensure you are ready before starting.</p>
            <div className="mt-8 flex justify-center space-x-4">
                <Button variant="secondary" onClick={onBack}>Go Back</Button>
                <Button onClick={startTest} size="md"><PlayCircle size={20} className="mr-2"/> Start Test</Button>
            </div>
        </Card>
      </div>
    );
  }

  const isTimeLow = test.duration && timeLeft <= 5 * 60;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Button variant="secondary" onClick={onBack}><ArrowLeft size={16} className="mr-2" /> Back to Course</Button>
      <Card className="p-6">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-sm font-semibold text-primary-600">{course.title}</p>
                <h1 className="text-3xl font-bold text-gray-800 mt-1">{test.title}</h1>
                <p className="text-gray-500 text-md mt-1">Chapter: {chapter.title}</p>
            </div>
            {test.duration && (
                <div className={`text-center p-3 rounded-lg transition-colors ${isTimeLow ? 'bg-red-100 border border-red-300' : 'bg-gray-100 border'}`}>
                    <p className="text-sm font-medium text-gray-500">Time Left</p>
                    <p className={`text-3xl font-bold ${isTimeLow ? 'text-red-600 animate-pulse' : 'text-gray-800'}`}>{formatTime(timeLeft)}</p>
                </div>
            )}
        </div>
      </Card>

      <Card className="p-6">
        <div className="space-y-8">
            {isAdaptive ? (
                <div>
                    <h2 className="text-lg font-semibold text-gray-800">Question {currentQuestionIndex + 1} of {test.questions.length}:</h2>
                    <p className="text-gray-700 mt-2 bg-gray-50 p-4 rounded-md border">{currentQuestion.text}</p>
                    <div className="mt-4">{renderQuestionInput(currentQuestion)}</div>
                </div>
            ) : (
                test.questions.map((question, index) => (
                    <div key={question.id}>
                        <h2 className="text-lg font-semibold text-gray-800">Question {index + 1}:</h2>
                        <p className="text-gray-700 mt-2 bg-gray-50 p-4 rounded-md border">{question.text}</p>
                        <div className="mt-4"><h3 className="text-md font-semibold text-gray-800 mb-2">Your Answer:</h3>{renderQuestionInput(question)}</div>
                    </div>
                ))
            )}
        </div>
      </Card>

      <div className="flex justify-end">
        {isAdaptive && currentQuestionIndex < test.questions.length - 1 && (
            <Button onClick={handleNextQuestion} size="md" className="min-w-[200px]">Next Question <ChevronRight size={18} className="ml-2" /></Button>
        )}
        {(!isAdaptive || currentQuestionIndex === test.questions.length - 1) && (
            <Button onClick={() => handleSubmit(false)} size="md" className="min-w-[200px]"><Send size={18} className="mr-2" /> Submit Test</Button>
        )}
      </div>
    </div>
  );
};

export default TestTakingPage;
