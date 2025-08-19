import React, { useState } from 'react';
import { Course, TestSubmission, StudyPlan } from '../../types';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { generateStudyPlan } from '../../services/geminiService';
import { BrainCircuit, Sparkles, Calendar, Check } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';

interface StudyPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  gradedTests: TestSubmission[];
  courses: Course[];
}

const StudyPlannerModal: React.FC<StudyPlannerModalProps> = ({ isOpen, onClose, gradedTests, courses }) => {
  const [goal, setGoal] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setError(null);
    setPlan(null);

    const performanceData = gradedTests.map(s => {
        const course = courses.find(c => c.id === s.courseId);
        const chapter = course?.chapters.find(c => c.id === s.chapterId);
        return {
            course: course?.title,
            chapter: chapter?.title,
            score: s.score
        };
    });

    try {
      const result = await generateStudyPlan(goal, targetDate, performanceData);
      setPlan(result);
    } catch (err) {
      console.error(err);
      setError('An error occurred while generating your plan. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const isFormValid = goal.trim() !== '' && targetDate !== '';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AI Study Planner">
      <div className="space-y-6">
        {!plan && (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="goal" className="block text-sm font-medium text-gray-700">What is your study goal?</label>
              <input
                type="text"
                id="goal"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                placeholder="e.g., Ace my Physics final exam"
                required
              />
            </div>
             <div>
              <label htmlFor="targetDate" className="block text-sm font-medium text-gray-700">When is your target date?</label>
              <input
                type="date"
                id="targetDate"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                min={new Date().toISOString().split("T")[0]}
                required
              />
            </div>
            {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
            <div className="pt-4 flex justify-end">
                <Button type="submit" disabled={!isFormValid || isGenerating} loading={isGenerating}>
                    <Sparkles size={16} className="mr-2"/>
                    {isGenerating ? 'Generating Plan...' : 'Generate My Plan'}
                </Button>
            </div>
        </form>
        )}

        {isGenerating && (
             <div className="text-center py-8">
                <LoadingSpinner />
                <p className="mt-2 text-gray-600">Building your personalized plan...</p>
            </div>
        )}
        
        {plan && (
            <div className='animate-fade-in'>
                <h3 className="text-xl font-bold text-gray-800 flex items-center mb-4"><BrainCircuit size={22} className="mr-3 text-primary-600"/>Your Personalized Study Plan</h3>
                <p className="font-semibold">Goal: <span className="font-normal">{plan.goal}</span></p>
                <div className="mt-4 space-y-4 max-h-80 overflow-y-auto pr-2">
                    {plan.schedule.map((day, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg border">
                            <p className="font-semibold text-gray-700 flex items-center"><Calendar size={16} className="mr-2 text-primary-500"/>{day.date}</p>
                            <ul className="mt-2 space-y-1 list-inside">
                                {day.tasks.map((task, i) => (
                                    <li key={i} className="text-sm text-gray-800 flex items-start"><Check size={14} className="mr-2 mt-0.5 text-green-500 flex-shrink-0"/>{task}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
                <div className='mt-6 text-center'>
                    <Button variant="secondary" onClick={() => setPlan(null)}>Create a New Plan</Button>
                </div>
            </div>
        )}
      </div>
    </Modal>
  );
};

export default StudyPlannerModal;
