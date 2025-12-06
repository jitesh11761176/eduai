import React, { useEffect, useState } from "react";
import { useCompetitiveUser } from "../../contexts/CompetitiveUserContext";
import { getTestById, getTestSummaryById } from "../../data/competitive";
import { Question, TestResult } from "../../types/competitive";

interface CompetitiveTestRunnerProps {
  navigate: (view: string, context?: any) => void;
  testId: string;
}

const CompetitiveTestRunner: React.FC<CompetitiveTestRunnerProps> = ({ navigate, testId }) => {
  const { isAuthenticated, addTestResult } = useCompetitiveUser();

  const [hasStarted, setHasStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [questionId: string]: number }>({});
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const test = testId ? getTestById(testId) : null;
  const testInfo = testId ? getTestSummaryById(testId) : null;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("login");
      return;
    }

    if (test && hasStarted) {
      setTimeRemaining(test.durationMinutes * 60);
    }
  }, [isAuthenticated, navigate, test, hasStarted]);

  const handleStartTest = () => {
    setHasStarted(true);
  };

  const handleSubmit = () => {
    if (!test) return;
    
    // Calculate results
    let correctCount = 0;
    let wrongCount = 0;
    const topicWeaknesses: string[] = [];
    const sectionWiseAccuracy: { [key: string]: number } = {};

    test.questions.forEach((q) => {
      const userAnswer = answers[q.id];
      if (userAnswer === undefined) {
        // unattempted
      } else if (userAnswer === q.correctOptionIndex) {
        correctCount++;
      } else {
        wrongCount++;
        if (q.topic && !topicWeaknesses.includes(q.topic)) {
          topicWeaknesses.push(q.topic);
        }
      }

      // Calculate section-wise accuracy (using topic as section)
      if (q.topic) {
        if (!sectionWiseAccuracy[q.topic]) {
          sectionWiseAccuracy[q.topic] = 0;
        }
        if (userAnswer === q.correctOptionIndex) {
          sectionWiseAccuracy[q.topic] += 1;
        }
      }
    });

    // Convert counts to percentages
    Object.keys(sectionWiseAccuracy).forEach((topic) => {
      const topicQuestions = test.questions.filter((q) => q.topic === topic).length;
      sectionWiseAccuracy[topic] = Math.round((sectionWiseAccuracy[topic] / topicQuestions) * 100);
    });

    const unattemptedCount = test.questions.length - correctCount - wrongCount;
    const scorePercent = Math.round((correctCount / test.questions.length) * 100);
    const timeTakenMinutes = test.durationMinutes - Math.floor(timeRemaining / 60);

    const result: TestResult = {
      testId: test.id,
      examId: test.examId,
      categoryId: test.categoryId,
      scorePercent,
      correctCount,
      wrongCount,
      unattemptedCount,
      timeTakenMinutes,
      sectionWiseAccuracy,
      topicWeaknesses,
      answers,
      completedAt: new Date(),
    };

    addTestResult(result);
    navigate("testResult", { testId });
  };

  // Timer - only start when test has started
  useEffect(() => {
    if (!hasStarted) return;
    
    if (timeRemaining <= 0) {
      handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, handleSubmit, hasStarted]);

  if (!test || !testInfo) {
    return <div className="p-8">Test not found</div>;
  }

  // Show start screen before test begins
  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">{test.title}</h1>
            <p className="text-slate-600">{testInfo.examName} • {testInfo.categoryName}</p>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8 p-6 bg-slate-50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{test.questions.length}</div>
              <div className="text-sm text-slate-600">Questions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{test.durationMinutes}</div>
              <div className="text-sm text-slate-600">Minutes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{test.difficulty}</div>
              <div className="text-sm text-slate-600">Difficulty</div>
            </div>
          </div>

          <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Instructions
            </h3>
            <ul className="space-y-2 text-sm text-blue-900">
              <li className="flex items-start gap-2">
                <span className="font-bold">•</span>
                <span>The test will start as soon as you click "Start Test"</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">•</span>
                <span>Timer will begin immediately and cannot be paused</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">•</span>
                <span>You can flag questions for review and navigate between questions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">•</span>
                <span>Make sure you have a stable internet connection</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">•</span>
                <span>The test will auto-submit when time expires</span>
              </li>
            </ul>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => navigate("dashboard")}
              className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleStartTest}
              className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Start Test
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = test.questions[currentQuestionIndex];
  const isAnswered = (questionId: string) => answers[questionId] !== undefined;
  const isFlagged = (questionId: string) => flagged.has(questionId);

  const handleAnswerSelect = (optionIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionIndex,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < test.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleFlag = () => {
    setFlagged((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(currentQuestion.id)) {
        newSet.delete(currentQuestion.id);
      } else {
        newSet.add(currentQuestion.id);
      }
      return newSet;
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const answeredCount = Object.keys(answers).length;
  const flaggedCount = flagged.size;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-900">{test.title}</h1>
              <p className="text-sm text-slate-600">
                Question {currentQuestionIndex + 1} of {test.questions.length}
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className={`text-2xl font-bold ${timeRemaining < 300 ? "text-red-600" : "text-slate-900"}`}>
                  {formatTime(timeRemaining)}
                </div>
                <div className="text-xs text-slate-500">Time Left</div>
              </div>
              <button
                onClick={() => setShowSubmitModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
              >
                Submit Test
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Main Content */}
        <div className="flex-1 max-w-4xl mx-auto p-8">
          <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
            <div className="flex items-start justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-900">
                Q{currentQuestionIndex + 1}. {currentQuestion.text}
              </h2>
              <button
                onClick={handleFlag}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isFlagged(currentQuestion.id)
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <svg className="w-4 h-4" fill={isFlagged(currentQuestion.id) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                </svg>
                {isFlagged(currentQuestion.id) ? "Flagged" : "Flag"}
              </button>
            </div>

            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => {
                const isSelected = answers[currentQuestion.id] === index;
                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      isSelected
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex items-center justify-center w-6 h-6 rounded-full border-2 ${
                          isSelected
                            ? "border-blue-500 bg-blue-500"
                            : "border-slate-300"
                        }`}
                      >
                        {isSelected && (
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className="flex-1 text-slate-700">{option}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>
            <button
              onClick={handleNext}
              disabled={currentQuestionIndex === test.questions.length - 1}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Question Navigator */}
        <div className="w-80 bg-white border-l border-slate-200 p-6 overflow-y-auto">
          <h3 className="font-bold text-slate-900 mb-4">Question Navigator</h3>
          
          <div className="grid grid-cols-5 gap-2 mb-6">
            {test.questions.map((q, index) => {
              const answered = isAnswered(q.id);
              const flaggedQ = isFlagged(q.id);
              const current = index === currentQuestionIndex;

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`w-10 h-10 rounded-lg font-semibold text-sm transition-colors ${
                    current
                      ? "bg-blue-600 text-white ring-2 ring-blue-300"
                      : answered
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : flaggedQ
                      ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-green-100"></div>
              <span className="text-slate-600">Answered ({answeredCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-slate-100"></div>
              <span className="text-slate-600">Not Answered ({test.questions.length - answeredCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-yellow-100"></div>
              <span className="text-slate-600">Flagged ({flaggedCount})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md mx-4">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Submit Test?</h3>
            <div className="space-y-2 mb-6">
              <p className="text-slate-600">
                <span className="font-semibold">{answeredCount}</span> answered
              </p>
              <p className="text-slate-600">
                <span className="font-semibold">{test.questions.length - answeredCount}</span> not answered
              </p>
              <p className="text-slate-600">
                <span className="font-semibold">{flaggedCount}</span> flagged for review
              </p>
            </div>
            <p className="text-sm text-slate-500 mb-6">
              Once submitted, you cannot change your answers.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompetitiveTestRunner;
