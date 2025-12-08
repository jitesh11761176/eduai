import React, { useEffect, useState } from "react";
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
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedback, setFeedback] = useState({
    questionQuality: 5,
    explanationClarity: 5,
    difficultyRating: 3,
    comments: "",
  });
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

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

  const handleSubmitFeedback = () => {
    // Save feedback to localStorage (in production, send to backend)
    const existingFeedback = JSON.parse(localStorage.getItem("test_feedback") || "{}");
    existingFeedback[testId] = {
      ...feedback,
      testId,
      testTitle: test.title,
      submittedAt: new Date().toISOString(),
    };
    localStorage.setItem("test_feedback", JSON.stringify(existingFeedback));
    
    setFeedbackSubmitted(true);
    setTimeout(() => {
      setShowFeedbackModal(false);
      setFeedbackSubmitted(false);
    }, 2000);
  };

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
            onClick={() => setShowFeedbackModal(true)}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            Give Feedback
          </button>
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

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Test Feedback</h2>
                <button
                  onClick={() => setShowFeedbackModal(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {feedbackSubmitted ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Thank You!</h3>
                  <p className="text-slate-600">Your feedback has been submitted successfully.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Question Quality */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-3">
                      How would you rate the quality of questions?
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => setFeedback({ ...feedback, questionQuality: rating })}
                          className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${
                            feedback.questionQuality >= rating
                              ? "border-yellow-400 bg-yellow-50 text-yellow-700"
                              : "border-slate-200 text-slate-400 hover:border-slate-300"
                          }`}
                        >
                          <svg className="w-6 h-6 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                          </svg>
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                      <span>Poor</span>
                      <span>Excellent</span>
                    </div>
                  </div>

                  {/* Explanation Clarity */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-3">
                      Were the explanations clear and helpful?
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => setFeedback({ ...feedback, explanationClarity: rating })}
                          className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${
                            feedback.explanationClarity >= rating
                              ? "border-blue-400 bg-blue-50 text-blue-700"
                              : "border-slate-200 text-slate-400 hover:border-slate-300"
                          }`}
                        >
                          <svg className="w-6 h-6 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                          </svg>
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                      <span>Not Clear</span>
                      <span>Very Clear</span>
                    </div>
                  </div>

                  {/* Difficulty Rating */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-3">
                      How did you find the difficulty level?
                    </label>
                    <div className="flex gap-2">
                      {[
                        { value: 1, label: "Too Easy" },
                        { value: 2, label: "Easy" },
                        { value: 3, label: "Just Right" },
                        { value: 4, label: "Hard" },
                        { value: 5, label: "Too Hard" },
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setFeedback({ ...feedback, difficultyRating: option.value })}
                          className={`flex-1 py-2 px-3 rounded-lg border-2 text-sm font-medium transition-all ${
                            feedback.difficultyRating === option.value
                              ? "border-purple-500 bg-purple-50 text-purple-700"
                              : "border-slate-200 text-slate-600 hover:border-slate-300"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Comments */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                      Additional Comments (Optional)
                    </label>
                    <textarea
                      value={feedback.comments}
                      onChange={(e) => setFeedback({ ...feedback, comments: e.target.value })}
                      placeholder="Share your thoughts about the test, questions, or anything else..."
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={4}
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => setShowFeedbackModal(false)}
                      className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmitFeedback}
                      className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
                    >
                      Submit Feedback
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompetitiveTestResult;
