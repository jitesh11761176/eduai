import React, { useState, useMemo } from 'react';
import { Course, TestSubmission, ClassInsights, Test, Chapter } from '../../types';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { generateClassInsights } from '../../services/geminiService';
import { BarChart2, Lightbulb, User, AlertTriangle, BookOpen } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';

interface ClassAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course;
  submissions: TestSubmission[];
}

const InsightsDisplay: React.FC<{ insights: ClassInsights }> = ({ insights }) => (
    <div className="space-y-6 mt-4">
        <div>
            <h4 className="font-semibold text-lg text-gray-800">Overall Summary</h4>
            <p className="text-gray-700 mt-1 bg-gray-50 p-3 rounded-md border">{insights.overallSummary}</p>
        </div>
        <div>
            <h4 className="font-semibold text-lg text-gray-800 flex items-center">
                <AlertTriangle size={20} className="mr-2 text-yellow-600"/> Common Misconceptions
            </h4>
            <div className="space-y-3 mt-2">
                {insights.commonMisconceptions.map((mc, index) => (
                    <div key={index} className="p-4 border rounded-lg bg-white">
                        <p className="font-semibold text-gray-800">{mc.concept}</p>
                        <p className="text-sm text-gray-600 mt-1">{mc.analysis}</p>
                        {mc.studentExamples.length > 0 && (
                             <div className="mt-2 text-xs text-gray-500 italic border-l-2 pl-2">
                                {mc.studentExamples.map((ex, i) => <p key={i}>"{ex}"</p>)}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
         <div>
            <h4 className="font-semibold text-lg text-gray-800 flex items-center">
                <Lightbulb size={20} className="mr-2 text-green-600"/> Teaching Recommendations
            </h4>
            <ul className="list-disc list-inside space-y-1 mt-2 text-gray-700">
                {insights.teachingRecommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                ))}
            </ul>
        </div>
    </div>
);

const ClassAnalyticsModal: React.FC<ClassAnalyticsModalProps> = ({ isOpen, onClose, course, submissions }) => {
  const [selectedTestId, setSelectedTestId] = useState<string>('');
  const [insights, setInsights] = useState<ClassInsights | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testsWithSubmissions = useMemo(() => {
    const testMap = new Map<string, { test: Test, chapter: Chapter, submissionCount: number }>();
    course.chapters.forEach(chapter => {
        if (chapter.test) {
            const submissionCount = submissions.filter(s => s.testId === chapter.test!.id).length;
            if (submissionCount > 0) {
                 testMap.set(chapter.test.id, { test: chapter.test, chapter, submissionCount });
            }
        }
    });
    return Array.from(testMap.values());
  }, [course, submissions]);

  const handleGenerate = async () => {
    if (!selectedTestId) return;

    const testInfo = testsWithSubmissions.find(t => t.test.id === selectedTestId);
    if (!testInfo) return;

    const relevantSubmissions = submissions.filter(s => s.testId === selectedTestId);
    
    setIsGenerating(true);
    setError(null);
    setInsights(null);
    try {
        const result = await generateClassInsights(testInfo.test, relevantSubmissions, course);
        setInsights(result);
    } catch (err) {
        console.error(err);
        setError("An error occurred while generating insights. Please try again.");
    } finally {
        setIsGenerating(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`AI Class Analytics for ${course.title}`}>
      <div className="space-y-4">
        <div>
          <label htmlFor="test-select" className="block text-sm font-medium text-gray-700 mb-1">
            Select a Test to Analyze
          </label>
          <select
            id="test-select"
            value={selectedTestId}
            onChange={(e) => {
              setSelectedTestId(e.target.value);
              setInsights(null);
              setError(null);
            }}
            className="w-full p-2 border border-gray-300 rounded-md bg-white"
            disabled={testsWithSubmissions.length === 0}
          >
            <option value="" disabled>
              {testsWithSubmissions.length > 0 ? '-- Choose a test --' : 'No tests with submissions available'}
            </option>
            {testsWithSubmissions.map(({ test, chapter, submissionCount }) => (
              <option key={test.id} value={test.id}>
                {chapter.title}: {test.title} ({submissionCount} submissions)
              </option>
            ))}
          </select>
        </div>
        <div className="text-center">
            <Button onClick={handleGenerate} disabled={!selectedTestId || isGenerating} loading={isGenerating}>
                <BarChart2 size={16} className="mr-2" />
                {isGenerating ? 'Analyzing...' : 'Generate AI Insights'}
            </Button>
        </div>

        {error && <p className="text-sm text-center text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
        
        <div className="mt-6">
            {isGenerating && (
                 <div className="text-center py-8">
                    <LoadingSpinner />
                    <p className="mt-2 text-gray-600">Analyzing submissions... this may take a moment.</p>
                </div>
            )}
            {insights && <InsightsDisplay insights={insights} />}
        </div>
      </div>
    </Modal>
  );
};

export default ClassAnalyticsModal;