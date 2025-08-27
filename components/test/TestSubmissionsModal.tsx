import React, { useMemo, useState } from 'react';
import { Course, Chapter, TestSubmission, Student, Test } from '../../types';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { Award, TrendingUp, Loader2 } from 'lucide-react';
import { generateTestPerformanceSummary } from '../../services/geminiService';

interface TestSubmissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course;
  chapter: Chapter;
  test: Test;
  submissions: TestSubmission[];
  students: Student[];
}

const TestSubmissionsModal: React.FC<TestSubmissionsModalProps> = ({ isOpen, onClose, course, chapter, test, submissions, students }) => {
  const [summary, setSummary] = useState<{ strengths: string[]; focusAreas: string[]; overall: string; suggestedActions: string[] } | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ranked = useMemo(() => {
    const related = submissions.filter(s => s.testId === test.id && s.chapterId === chapter.id);
    const graded = related.filter(s => typeof s.score === 'number').sort((a,b) => (b.score! - a.score!));
    const ungraded = related.filter(s => typeof s.score !== 'number');
    let lastScore: number | null = null; let rank = 0;
    const rankedGraded = graded.map(s => {
      if (s.score !== lastScore) { rank += 1; lastScore = s.score!; }
      return { ...s, rank } as TestSubmission & { rank: number };
    });
    return [...rankedGraded, ...ungraded.map(s => ({ ...s, rank: undefined as any }))];
  }, [submissions, test.id, chapter.id]);

  const handleGenerateSummary = async () => {
    setLoadingSummary(true); setError(null); setSummary(null);
    try {
      const testSubs = submissions.filter(s => s.testId === test.id && s.chapterId === chapter.id);
      const result = await generateTestPerformanceSummary(test, testSubs, course);
      setSummary(result);
    } catch (e:any) {
      setError(e.message || 'Failed to generate summary');
    } finally {
      setLoadingSummary(false);
    }
  };

  if (!isOpen) return null;

  const studentName = (id: string) => students.find(st => st.id === id)?.name || 'Unknown';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Submissions • ${test.title}`}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-gray-700">Total Submissions: {ranked.length}</h3>
          <Button onClick={handleGenerateSummary} disabled={loadingSummary} variant="secondary">
            {loadingSummary ? <Loader2 className="animate-spin mr-2" size={16}/> : <TrendingUp size={16} className="mr-2"/>}
            {loadingSummary ? 'Analyzing...' : 'Generate Summary'}
          </Button>
        </div>
        <div className="overflow-x-auto border rounded-lg">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-gray-600">Rank</th>
                <th className="px-4 py-2 text-left font-medium text-gray-600">Student</th>
                <th className="px-4 py-2 text-left font-medium text-gray-600">Score</th>
                <th className="px-4 py-2 text-left font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {ranked.map(sub => (
                <tr key={sub.id} className={typeof sub.score === 'number' ? 'bg-white' : 'bg-yellow-50'}>
                  <td className="px-4 py-2 font-semibold text-gray-800">{typeof sub.score === 'number' ? (sub as any).rank : '—'}</td>
                  <td className="px-4 py-2">{studentName(sub.studentId)}</td>
                  <td className="px-4 py-2">{typeof sub.score === 'number' ? `${sub.score}/10` : 'Pending'}</td>
                  <td className="px-4 py-2">
                    {typeof sub.score === 'number' ? (
                      <span className="inline-flex items-center text-green-700 bg-green-100 px-2 py-0.5 rounded text-xs font-semibold">Evaluated</span>
                    ) : (
                      <span className="inline-flex items-center text-yellow-800 bg-yellow-200 px-2 py-0.5 rounded text-xs font-semibold">Pending</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>}
        {summary && (
          <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
            <h4 className="font-semibold text-gray-800 flex items-center"><Award size={16} className="mr-2 text-primary-500"/>AI Summary</h4>
            <p className="text-gray-700 whitespace-pre-wrap">{summary.overall}</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-bold uppercase text-green-600">Strengths</p>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 mt-1">{summary.strengths.map((s,i)=><li key={i}>{s}</li>)}</ul>
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-red-600">Focus Areas</p>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 mt-1">{summary.focusAreas.map((s,i)=><li key={i}>{s}</li>)}</ul>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-blue-600">Suggested Actions</p>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 mt-1">{summary.suggestedActions.map((s,i)=><li key={i}>{s}</li>)}</ul>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default TestSubmissionsModal;
