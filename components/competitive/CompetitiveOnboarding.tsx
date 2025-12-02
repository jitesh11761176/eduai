import React, { useState } from "react";
import { useCompetitiveUser } from "../../contexts/CompetitiveUserContext";
import { competitiveExams } from "../../data/competitive";

interface CompetitiveOnboardingProps {
  navigate: (view: string, context?: any) => void;
}

const CompetitiveOnboarding: React.FC<CompetitiveOnboardingProps> = ({ navigate }) => {
  const { user, updateSelectedExams } = useCompetitiveUser();
  const [selectedExams, setSelectedExams] = useState<string[]>([]);

  const handleExamToggle = (examId: string) => {
    setSelectedExams((prev) =>
      prev.includes(examId) ? prev.filter((id) => id !== examId) : [...prev, examId]
    );
  };

  const handleContinue = () => {
    if (selectedExams.length > 0) {
      updateSelectedExams(selectedExams);
      navigate("dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">
            Which exams are you preparing for?
          </h1>
          <p className="text-lg text-slate-600">
            Select one or more exams to personalize your experience
          </p>
        </div>

        {/* Exam Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {competitiveExams.map((exam) => {
            const isSelected = selectedExams.includes(exam.id);
            return (
              <button
                key={exam.id}
                onClick={() => handleExamToggle(exam.id)}
                className={`relative bg-white rounded-xl p-6 text-left transition-all duration-200 border-2 ${
                  isSelected
                    ? "border-blue-500 shadow-lg ring-2 ring-blue-200"
                    : "border-slate-200 hover:border-slate-300 hover:shadow-md"
                }`}
              >
                {/* Badge */}
                {exam.badge && (
                  <span
                    className={`absolute top-4 right-4 px-3 py-1 text-xs font-semibold rounded-full ${
                      exam.badge === "Popular"
                        ? "bg-orange-100 text-orange-700"
                        : exam.badge === "Trending"
                        ? "bg-green-100 text-green-700"
                        : exam.badge === "Elite"
                        ? "bg-purple-100 text-purple-700"
                        : exam.badge === "New"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {exam.badge}
                  </span>
                )}

                {/* Selection Indicator */}
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-lg ${
                      isSelected
                        ? "bg-blue-500 text-white"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {isSelected ? (
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      <span className="text-xl font-bold">{exam.name.charAt(0)}</span>
                    )}
                  </div>
                </div>

                {/* Exam Info */}
                <h3 className="text-xl font-bold text-slate-900 mb-2">{exam.name}</h3>
                <p className="text-sm text-slate-600 mb-4">{exam.description}</p>

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {exam.categories.length} categories
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    {exam.categories.reduce((sum, cat) => sum + cat.tests.length, 0)} tests
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Continue Button */}
        <div className="flex justify-center">
          <button
            onClick={handleContinue}
            disabled={selectedExams.length === 0}
            className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 ${
              selectedExams.length === 0
                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:scale-105"
            }`}
          >
            {selectedExams.length === 0
              ? "Select at least one exam"
              : `Continue with ${selectedExams.length} exam${selectedExams.length > 1 ? "s" : ""}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompetitiveOnboarding;
