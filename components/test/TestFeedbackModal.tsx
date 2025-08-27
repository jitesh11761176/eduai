import React, { useMemo } from 'react';
import { Course, Test, TestSubmission, Question, Rubric } from '../../types';
import Modal from '../common/Modal';
import { BookOpen, HelpCircle, MessageSquare, Star, CheckCircle, XCircle, ClipboardCheck } from 'lucide-react';

interface TestFeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    course: Course;
    test: Test;
    submission: TestSubmission & { rank?: number }; // rank optionally injected
}

const RubricDisplay: React.FC<{ rubric: Rubric, evaluation?: Record<string, number> }> = ({ rubric, evaluation }) => {
    const totalPoints = evaluation ? (Object.values(evaluation) as number[]).reduce((sum: number, pts: number) => sum + pts, 0) : 0;
    const maxPoints = rubric.criteria.reduce((sum, crit) => sum + Math.max(...crit.levels.map(l => l.points)), 0);

    return (
        <div className="space-y-4 mt-4">
            <h4 className="font-bold text-lg text-gray-800 flex items-center"><ClipboardCheck size={20} className="mr-2 text-purple-500" />Grading Rubric</h4>
            {rubric.criteria.map(criterion => {
                const awardedPoints = evaluation?.[criterion.id];
                const selectedLevel = criterion.levels.find(l => l.points === awardedPoints);
                return (
                    <div key={criterion.id} className="p-3 border rounded-lg bg-white">
                        <div className="flex justify-between items-baseline">
                             <p className="font-semibold text-gray-700">{criterion.description}</p>
                             {awardedPoints !== undefined && (
                                <p className="font-bold text-sm text-primary-600">{awardedPoints} / {Math.max(...criterion.levels.map(l => l.points))} pts</p>
                             )}
                        </div>
                        {selectedLevel && (
                             <p className="text-sm mt-1 text-gray-600 bg-primary-50 border border-primary-100 rounded-md px-2 py-1">
                                Level: <span className="font-semibold">{selectedLevel.description}</span>
                            </p>
                        )}
                    </div>
                );
            })}
             <div className="text-right font-bold text-gray-700">Rubric Total: {totalPoints} / {maxPoints} Points</div>
        </div>
    )
}

const TestFeedbackModal: React.FC<TestFeedbackModalProps> = ({ isOpen, onClose, course, test, submission }) => {
  if (!isOpen) return null;

  const answerMap = useMemo(() => 
    new Map(submission.answers.map(a => [a.questionId, a.answer]))
  , [submission.answers]);

  const renderAnswerDisplay = (question: Question) => {
    const studentAnswer = answerMap.get(question.id) || 'No answer provided.';
    
    if (question.type === 'subjective') {
        return <p className="mt-1 text-gray-800 pl-7 whitespace-pre-wrap">{studentAnswer}</p>;
    }
    
    const isCorrect = studentAnswer === question.correctAnswer;
    const indicator = isCorrect ? <CheckCircle className="text-green-500"/> : <XCircle className="text-red-500"/>;

    return (
        <div className="pl-7 space-y-1">
            <div className="flex items-center space-x-2">
                {indicator}
                <span className={isCorrect ? 'text-gray-800' : 'text-red-700 line-through'}>{studentAnswer}</span>
            </div>
            {!isCorrect && <p className="text-sm text-green-700 font-semibold">Correct answer: {question.correctAnswer}</p>}
        </div>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Feedback for: ${test.title}`}>
      <div className="space-y-6">
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h3 className="font-bold text-lg text-gray-800 flex items-center"><Star size={20} className="mr-2 text-green-500" />Overall Result & Feedback</h3>
            <div className="mt-2 pl-7">
                                <p className="text-sm text-gray-600 font-semibold flex items-center gap-3">Score {submission.rank !== undefined && (
                                    <span className="text-xs font-bold inline-flex items-center bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Rank #{submission.rank}</span>
                                )}</p>
                                <p className="text-3xl font-bold text-green-700">{submission.score}/10</p>
                
                <p className="text-sm text-gray-600 font-semibold mt-4">Feedback from {course.teacher}</p>
                <p className="text-gray-800 whitespace-pre-wrap leading-relaxed mt-1">{submission.feedback || 'No feedback provided.'}</p>
            </div>
        </div>

        {test.rubric && <RubricDisplay rubric={test.rubric} evaluation={submission.rubricEvaluation} />}

        <div className="space-y-4">
            <p className="flex items-center text-sm font-semibold text-gray-600"><BookOpen size={16} className="mr-2 text-primary-500" />{course.title}</p>
            {test.questions.map((question, index) => (
                <div key={question.id}>
                    <div className="p-4 bg-gray-50 rounded-lg border">
                        <h3 className="font-bold text-lg text-gray-800 flex items-center"><HelpCircle size={20} className="mr-2 text-gray-500" />Question {index + 1}:</h3>
                        <p className="mt-1 text-gray-800 pl-7">{question.text}</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 mt-2">
                        <h3 className="font-bold text-lg text-gray-800 flex items-center"><MessageSquare size={20} className="mr-2 text-blue-500" />Your Answer:</h3>
                        {renderAnswerDisplay(question)}
                    </div>
                </div>
            ))}
        </div>
      </div>
    </Modal>
  );
};

export default TestFeedbackModal;