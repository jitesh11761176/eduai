import React, { useEffect } from "react";
import { useCompetitiveUser } from "../../contexts/CompetitiveUserContext";
import { getTestById, getTestSummaryById } from "../../data/competitive";
import { generateGuidanceFromResult } from "../../utils/competitiveGuidance";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface CompetitiveTestResultProps {
  navigate: (view: string, context?: any) => void;
  testId: string;
}

const CompetitiveTestResult: React.FC<CompetitiveTestResultProps> = ({ navigate, testId }) => {
  const { isAuthenticated, testResults } = useCompetitiveUser();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("login");
    }
  }, [isAuthenticated, navigate]);

  const test = getTestById(testId);
  const testInfo = getTestSummaryById(testId);
  const result = testResults.find((r) => r.testId === testId);

  if (!test || !testInfo || !result) {
    return <div className="p-8">Result not found. Please complete the test first.</div>;
  }

  const guidance = generateGuidanceFromResult(result);

  // Prepare data for charts
  const pieData = [
    { name: "Correct", value: result.correctCount, color: "#10b981" },
    { name: "Wrong", value: result.wrongCount, color: "#ef4444" },
    { name: "Unattempted", value: result.unattemptedCount, color: "#94a3b8" },
  ];

  const sectionData = Object.entries(result.sectionWiseAccuracy).map(([section, accuracy]) => ({
    section,
    accuracy,
  }));

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <h1 className="text-4xl font-bold mb-4">{test.title}</h1>
          <div className="inline-flex items-center justify-center w-32 h-32 bg-white rounded-full mb-6">
            <span className={`text-5xl font-bold ${
              result.scorePercent >= 70 ? "text-green-600" : result.scorePercent >= 50 ? "text-yellow-600" : "text-red-600"
            }`}>
              {result.scorePercent}%
            </span>
          </div>
          <p className="text-xl text-blue-100">
            {result.scorePercent >= 70 ? "Excellent Performance! 🎉" : result.scorePercent >= 50 ? "Good Effort! 👍" : "Keep Practicing! 💪"}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-sm text-slate-600 mb-1">Correct</div>
            <div className="text-3xl font-bold text-green-600">{result.correctCount}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-sm text-slate-600 mb-1">Wrong</div>
            <div className="text-3xl font-bold text-red-600">{result.wrongCount}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-sm text-slate-600 mb-1">Unattempted</div>
            <div className="text-3xl font-bold text-slate-600">{result.unattemptedCount}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-sm text-slate-600 mb-1">Time Taken</div>
            <div className="text-3xl font-bold text-blue-600">{result.timeTakenMinutes} min</div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Performance Overview</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {sectionData.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Topic-wise Accuracy</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={sectionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="section" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="accuracy" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Weak Areas */}
        {result.topicWeaknesses.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-bold text-amber-900 mb-4">Areas for Improvement</h2>
            <div className="flex flex-wrap gap-2">
              {result.topicWeaknesses.map((topic, index) => (
                <span key={index} className="px-4 py-2 bg-amber-100 text-amber-800 rounded-lg font-medium">
                  {topic}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Guidance */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Personalized Guidance</h2>
          <div className="space-y-3 mb-6">
            {guidance.textTips.map((tip, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold mt-0.5">
                  {index + 1}
                </div>
                <p className="text-slate-700">{tip}</p>
              </div>
            ))}
          </div>

          {guidance.recommendedTests.length > 0 && (
            <>
              <h3 className="font-bold text-slate-900 mb-3">Recommended Next Tests</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {guidance.recommendedTests.slice(0, 2).map((test) => (
                  <div key={test.id} className="border border-slate-200 rounded-lg p-4">
                    <h4 className="font-semibold text-slate-900 mb-2">{test.title}</h4>
                    <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
                      <span>{test.durationMinutes} min</span>
                      <span>{test.numQuestions} questions</span>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        test.difficulty === "Easy" ? "bg-green-100 text-green-700" :
                        test.difficulty === "Medium" ? "bg-yellow-100 text-yellow-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {test.difficulty}
                      </span>
                    </div>
                    <button
                      onClick={() => navigate("testRunner", { testId: test.id })}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors"
                    >
                      Start Test
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Question-wise Analysis */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Question-wise Analysis</h2>
          <div className="space-y-4">
            {test.questions.map((question, index) => {
              const userAnswer = result.answers[question.id];
              const isCorrect = userAnswer === question.correctOptionIndex;
              const isUnattempted = userAnswer === undefined;

              return (
                <div
                  key={question.id}
                  className={`border-2 rounded-lg p-4 ${
                    isUnattempted ? "border-slate-200 bg-slate-50" :
                    isCorrect ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      isUnattempted ? "bg-slate-200 text-slate-600" :
                      isCorrect ? "bg-green-500 text-white" : "bg-red-500 text-white"
                    }`}>
                      {isUnattempted ? "-" : isCorrect ? "✓" : "✗"}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 mb-3">
                        Q{index + 1}. {question.text}
                      </h3>
                      <div className="space-y-2 mb-3">
                        {question.options.map((option, optIndex) => {
                          const isUserAnswer = userAnswer === optIndex;
                          const isCorrectAnswer = optIndex === question.correctOptionIndex;

                          return (
                            <div
                              key={optIndex}
                              className={`p-2 rounded ${
                                isCorrectAnswer ? "bg-green-100 border border-green-300" :
                                isUserAnswer && !isCorrect ? "bg-red-100 border border-red-300" :
                                "bg-white"
                              }`}
                            >
                              <span className="text-slate-700">
                                {String.fromCharCode(65 + optIndex)}. {option}
                                {isCorrectAnswer && " ✓"}
                                {isUserAnswer && !isCorrect && " (Your answer)"}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      {question.explanation && (
                        <div className="bg-blue-50 border border-blue-200 rounded p-3">
                          <p className="text-sm font-semibold text-blue-900 mb-1">Explanation:</p>
                          <p className="text-sm text-blue-800">{question.explanation}</p>
                        </div>
                      )}
                      {question.topic && (
                        <div className="mt-2">
                          <span className="text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded">
                            Topic: {question.topic}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-8 justify-center">
          <button
            onClick={() => navigate("testRunner", { testId })}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            Retake Test
          </button>
          <button
            onClick={() => navigate("dashboard")}
            className="px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-lg transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompetitiveTestResult;
