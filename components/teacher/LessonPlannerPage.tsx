import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { ClipboardEdit, Sparkles, BookOpen, Clock, HelpCircle } from 'lucide-react';
import { generateLessonPlan } from '../../services/geminiService';
import { LessonPlan } from '../../types';
import LoadingSpinner from '../common/LoadingSpinner';

const LessonPlannerPage: React.FC = () => {
  const [objective, setObjective] = useState('');
  const [plan, setPlan] = useState<LessonPlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!objective.trim()) return;
    setIsGenerating(true);
    setError(null);
    setPlan(null);
    try {
      const result = await generateLessonPlan(objective);
      setPlan(result);
    } catch (err) {
      setError('Failed to generate lesson plan. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-3">
        <ClipboardEdit size={32} className="text-primary-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-800">AI-Powered Lesson Planner</h1>
          <p className="text-gray-500">Generate structured lesson plans in seconds.</p>
        </div>
      </div>
      
      <Card>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="objective" className="block text-sm font-medium text-gray-700">Learning Objective</label>
            <textarea
              id="objective"
              value={objective}
              onChange={e => setObjective(e.target.value)}
              rows={3}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
              placeholder="e.g., Introduce the concept of chemical bonding to a Class X class, focusing on ionic and covalent bonds."
              required
            />
          </div>
          <div className="text-right">
            <Button type="submit" disabled={isGenerating || !objective.trim()} loading={isGenerating}>
              <Sparkles size={16} className="mr-2" />
              {isGenerating ? 'Generating...' : 'Generate Lesson Plan'}
            </Button>
          </div>
        </form>
      </Card>
      
      {isGenerating && (
        <div className="text-center py-8">
            <LoadingSpinner />
            <p className="mt-2 text-gray-600">Crafting your lesson plan...</p>
        </div>
      )}
      {error && <p className="text-red-500 text-center">{error}</p>}
      
      {plan && (
        <Card className="p-6 animate-fade-in">
          <h2 className="text-2xl font-bold text-gray-800">{plan.title}</h2>
          <div className="mt-4 space-y-4">
            <div>
                <h3 className="font-semibold flex items-center gap-2"><BookOpen size={18} className="text-primary-600" />Learning Objective</h3>
                <p className="mt-1 p-3 bg-gray-50 rounded-md border">{plan.objective}</p>
            </div>
            <div>
                <h3 className="font-semibold flex items-center gap-2"><Clock size={18} className="text-primary-600" />Activities</h3>
                <div className="space-y-3 mt-1">
                {plan.activities.map((activity, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                        <p className="font-bold">{activity.title} <span className="font-normal text-sm text-gray-500">({activity.duration} mins)</span></p>
                        <p className="text-sm text-gray-600">{activity.description}</p>
                    </div>
                ))}
                </div>
            </div>
             <div>
                <h3 className="font-semibold flex items-center gap-2"><HelpCircle size={18} className="text-primary-600" />Discussion Questions</h3>
                <ul className="list-decimal list-inside mt-1 space-y-1 text-gray-700">
                    {plan.discussionQuestions.map((q, i) => <li key={i}>{q}</li>)}
                </ul>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default LessonPlannerPage;