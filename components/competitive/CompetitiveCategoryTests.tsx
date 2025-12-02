import React, { useEffect, useState } from "react";
import { useCompetitiveUser } from "../../contexts/CompetitiveUserContext";
import { getCategoryById, getExamById } from "../../data/competitive";
import { TestSummary } from "../../types/competitive";

interface CompetitiveCategoryTestsProps {
  navigate: (view: string, context?: any) => void;
  examId: string;
  categoryId: string;
}

const CompetitiveCategoryTests: React.FC<CompetitiveCategoryTestsProps> = ({ navigate, examId, categoryId }) => {
  const { isAuthenticated, testResults, getTestAttempts, getLastScore } = useCompetitiveUser();
  const [filterDifficulty, setFilterDifficulty] = useState<string>("All");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("login");
    }
  }, [isAuthenticated, navigate]);

  const exam = getExamById(examId);
  const category = getCategoryById(examId, categoryId);

  if (!exam || !category) {
    return <div className="p-8">Category not found</div>;
  }

  const filteredTests = filterDifficulty === "All" 
    ? category.tests 
    : category.tests.filter(t => t.difficulty === filterDifficulty);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate("examDetail", { examId })}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to {exam.name}
          </button>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{category.name}</h1>
          <p className="text-slate-600">{category.description}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-700">Filter by difficulty:</span>
            <div className="flex gap-2">
              {["All", "Easy", "Medium", "Hard"].map((difficulty) => (
                <button
                  key={difficulty}
                  onClick={() => setFilterDifficulty(difficulty)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterDifficulty === difficulty
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {difficulty}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tests Grid */}
        <div className="grid grid-cols-1 gap-4">
          {filteredTests.map((test) => {
            const attempts = getTestAttempts(test.id);
            const lastScore = getLastScore(test.id);
            const status = attempts === 0 ? "Not started" : "Completed";

            return (
              <div
                key={test.id}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-slate-900">{test.title}</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          test.difficulty === "Easy"
                            ? "bg-green-100 text-green-700"
                            : test.difficulty === "Medium"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {test.difficulty}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          status === "Not started"
                            ? "bg-slate-100 text-slate-600"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {status}
                      </span>
                    </div>

                    <div className="flex items-center gap-6 text-sm text-slate-600 mb-4">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {test.durationMinutes} minutes
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        {test.numQuestions} questions
                      </span>
                      {attempts > 0 && (
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          {attempts} attempt{attempts > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>

                    {lastScore !== undefined && (
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-slate-600">Last Score:</span>
                        <span
                          className={`text-xl font-bold ${
                            lastScore >= 70
                              ? "text-green-600"
                              : lastScore >= 50
                              ? "text-yellow-600"
                              : "text-red-600"
                          }`}
                        >
                          {lastScore}%
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => navigate("testRunner", { testId: test.id })}
                    className="ml-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
                  >
                    {attempts === 0 ? "Start Test" : "Retake"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredTests.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <p className="text-slate-600">No tests found for the selected difficulty level.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompetitiveCategoryTests;
