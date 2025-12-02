import React, { useEffect } from "react";
import { useCompetitiveUser } from "../../contexts/CompetitiveUserContext";
import { competitiveExams } from "../../data/competitive";
import { generatePerformanceSnapshot, getGuidanceFromPerformance, getNextRecommendedTest } from "../../utils/competitiveGuidance";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface CompetitiveDashboardProps {
  navigate: (view: string, context?: any) => void;
}

const CompetitiveDashboard: React.FC<CompetitiveDashboardProps> = ({ navigate }) => {
  const { user, testResults, isAuthenticated, isAdmin, logout } = useCompetitiveUser();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("login");
    }
  }, [isAuthenticated, navigate]);

  if (!user) return null;

  const performance = generatePerformanceSnapshot(testResults, user.selectedExams);
  const guidanceTips = getGuidanceFromPerformance(testResults);
  const nextTest = getNextRecommendedTest(testResults, user.selectedExams);

  const userExams = competitiveExams.filter((exam) => user.selectedExams.includes(exam.id));

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Welcome back, {user.name.split(" ")[0]}! 👋
              </h1>
              <p className="text-slate-600 mt-1">
                You're preparing for: {user.selectedExams.map(id => competitiveExams.find(e => e.id === id)?.name).join(", ")}
              </p>
            </div>
            <div className="flex gap-3">
              {isAdmin && (
                <button
                  onClick={() => navigate("admin")}
                  className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                >
                  Admin Dashboard
                </button>
              )}
              <button
                onClick={() => navigate("onboarding")}
                className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                Change Exams
              </button>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Stats Cards */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-slate-600">Tests Taken</p>
                <p className="text-2xl font-bold text-slate-900">{performance.totalTestsTaken}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-slate-600">Average Score</p>
                <p className="text-2xl font-bold text-slate-900">{performance.averageScore}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-slate-600">Exams Selected</p>
                <p className="text-2xl font-bold text-slate-900">{user.selectedExams.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* My Exams */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">My Exams</h2>
            <div className="space-y-4">
              {userExams.map((exam) => {
                const examTests = testResults.filter(r => r.examId === exam.id);
                const totalTests = exam.categories.reduce((sum, cat) => sum + cat.tests.length, 0);
                const completedTests = examTests.length;
                const avgScore = examTests.length > 0 
                  ? Math.round(examTests.reduce((sum, r) => sum + r.scorePercent, 0) / examTests.length)
                  : 0;

                return (
                  <div key={exam.id} className="border border-slate-200 rounded-lg p-4 hover:border-blue-300 transition-colors cursor-pointer"
                       onClick={() => navigate("examDetail", { examId: exam.id })}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-slate-900">{exam.name}</h3>
                      <span className="text-sm text-slate-500">{completedTests}/{totalTests} tests</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(completedTests / totalTests) * 100}%` }}
                      ></div>
                    </div>
                    {examTests.length > 0 && (
                      <p className="text-sm text-slate-600">Average Score: {avgScore}%</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Next Recommended Test */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-sm p-6 text-white">
            <h2 className="text-xl font-bold mb-4">Next Recommended Test</h2>
            {nextTest ? (
              <>
                <div className="bg-white/10 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-100 mb-1">{nextTest.exam} • {nextTest.category}</p>
                  <h3 className="text-lg font-bold mb-3">{nextTest.test.title}</h3>
                  <div className="flex gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {nextTest.test.durationMinutes} min
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {nextTest.test.numQuestions} questions
                    </span>
                    <span className="px-2 py-1 bg-white/20 rounded text-xs">{nextTest.test.difficulty}</span>
                  </div>
                </div>
                <button
                  onClick={() => navigate("testRunner", { testId: nextTest.test.id })}
                  className="w-full bg-white text-blue-600 font-semibold py-3 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Start Test
                </button>
              </>
            ) : (
              <p className="text-blue-100">Select an exam to get started!</p>
            )}
          </div>
        </div>

        {/* Performance Snapshot */}
        {performance.scoreHistory.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Score Trend</h2>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={performance.scoreHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="testName" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Subject Accuracy</h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={performance.subjectAccuracy}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="subject" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="accuracy" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Guidance & Tips */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Guidance & Tips</h2>
          <div className="space-y-3">
            {guidanceTips.map((tip, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-semibold mt-0.5">
                  {index + 1}
                </div>
                <p className="text-slate-700">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompetitiveDashboard;
