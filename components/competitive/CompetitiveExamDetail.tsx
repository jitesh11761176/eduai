import React, { useEffect } from "react";
import { useCompetitiveUser } from "../../contexts/CompetitiveUserContext";
import { getExamById } from "../../data/competitive";

interface CompetitiveExamDetailProps {
  navigate: (view: string, context?: any) => void;
  examId: string;
}

const CompetitiveExamDetail: React.FC<CompetitiveExamDetailProps> = ({ navigate, examId }) => {
  const { isAuthenticated, testResults } = useCompetitiveUser();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("login");
    }
  }, [isAuthenticated, navigate]);

  if (!examId) return null;

  const exam = getExamById(examId);
  if (!exam) {
    return <div className="p-8">Exam not found</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate("dashboard")}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{exam.name}</h1>
          <p className="text-slate-600">{exam.description}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exam.categories.map((category) => {
            const categoryTests = testResults.filter(
              (r) => r.examId === examId && r.categoryId === category.id
            );
            const completedTests = categoryTests.length;
            const avgScore = categoryTests.length > 0
              ? Math.round(categoryTests.reduce((sum, r) => sum + r.scorePercent, 0) / categoryTests.length)
              : null;

            return (
              <div
                key={category.id}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate("categoryTests", { examId, categoryId: category.id })}
              >
                <h3 className="text-lg font-bold text-slate-900 mb-2">{category.name}</h3>
                {category.description && (
                  <p className="text-sm text-slate-600 mb-4">{category.description}</p>
                )}

                <div className="flex items-center justify-between text-sm text-slate-500 mb-2">
                  <span>{category.tests.length} tests available</span>
                  {completedTests > 0 && (
                    <span className="text-blue-600 font-medium">
                      {completedTests} completed
                    </span>
                  )}
                </div>

                {avgScore !== null && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Last Score:</span>
                      <span className={`text-lg font-bold ${
                        avgScore >= 70 ? "text-green-600" : avgScore >= 50 ? "text-yellow-600" : "text-red-600"
                      }`}>
                        {avgScore}%
                      </span>
                    </div>
                  </div>
                )}

                <button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors">
                  View Tests
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CompetitiveExamDetail;
