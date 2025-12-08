import { TestResult, GuidanceResult, TestSummary, PerformanceSnapshot } from "../types/competitive";
import { getCompetitiveExams } from "../data/competitive";

/**
 * Generate personalized guidance based on test results
 */
export const generateGuidanceFromResult = (result: TestResult): GuidanceResult => {
  const competitiveExams = getCompetitiveExams();
  const textTips: string[] = [];
  const recommendedTests: TestSummary[] = [];

  // Analyze score
  if (result.scorePercent < 40) {
    textTips.push("Focus on building fundamental concepts in this subject.");
    textTips.push("Consider attempting easier tests first to build confidence.");
  } else if (result.scorePercent < 60) {
    textTips.push("You're making progress! Focus on improving accuracy.");
    textTips.push("Review questions you got wrong and understand the concepts.");
  } else if (result.scorePercent < 80) {
    textTips.push("Good performance! Try harder difficulty tests to challenge yourself.");
    textTips.push("Work on time management to improve speed.");
  } else {
    textTips.push("Excellent work! Maintain consistency with regular practice.");
    textTips.push("Try full-length mock tests to simulate exam conditions.");
  }

  // Analyze weak topics
  if (result.topicWeaknesses.length > 0) {
    textTips.push(`Focus areas: ${result.topicWeaknesses.slice(0, 3).join(", ")}`);
  }

  // Find recommended tests
  const exam = competitiveExams.find((e) => e.id === result.examId);
  if (exam) {
    const category = exam.categories.find((c) => c.id === result.categoryId);
    if (category) {
      // Recommend next difficulty level or similar tests
      const currentTests = category.tests;
      
      // Find tests not attempted or with low scores
      const untried = currentTests.filter((t) => t.id !== result.testId);
      if (untried.length > 0) {
        recommendedTests.push(...untried.slice(0, 3));
      }
    }
  }

  const recommendedCategory = result.scorePercent < 60 ? "Practice more in this category" : "Try advanced tests";

  return {
    recommendedCategory,
    recommendedTests,
    textTips,
  };
};

/**
 * Get overall guidance based on multiple test results
 */
export const getGuidanceFromPerformance = (testResults: TestResult[]): string[] => {
  const tips: string[] = [];

  if (testResults.length === 0) {
    return ["Start with an easy test to assess your current level.", "Practice regularly for better results."];
  }

  // Calculate average score
  const avgScore = testResults.reduce((sum, r) => sum + r.scorePercent, 0) / testResults.length;

  // Calculate accuracy trend
  const recentTests = testResults.slice(-5);
  const recentAvg = recentTests.reduce((sum, r) => sum + r.scorePercent, 0) / recentTests.length;

  if (recentAvg > avgScore + 5) {
    tips.push("✅ Your performance is improving! Keep up the good work.");
  } else if (recentAvg < avgScore - 5) {
    tips.push("⚠️ Your recent scores are declining. Review fundamentals.");
  } else {
    tips.push("📊 Your performance is steady. Try challenging yourself with harder tests.");
  }

  // Analyze subject-wise performance
  const subjectScores: { [subject: string]: number[] } = {};
  testResults.forEach((result) => {
    Object.entries(result.sectionWiseAccuracy).forEach(([subject, accuracy]) => {
      if (!subjectScores[subject]) {
        subjectScores[subject] = [];
      }
      subjectScores[subject].push(accuracy);
    });
  });

  // Find weakest subject
  let weakestSubject = "";
  let lowestAvg = 100;
  Object.entries(subjectScores).forEach(([subject, scores]) => {
    const avg = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    if (avg < lowestAvg && avg < 60) {
      lowestAvg = avg;
      weakestSubject = subject;
    }
  });

  if (weakestSubject) {
    tips.push(`🎯 Focus on ${weakestSubject} – accuracy is below 60%.`);
  }

  // Test frequency
  if (testResults.length < 5) {
    tips.push("💪 Take more tests to build momentum and confidence.");
  } else if (testResults.length >= 10) {
    tips.push("🏆 Great practice frequency! Consider attempting full-length tests.");
  }

  // Time management
  const avgTimeRatio = testResults.reduce((sum, r) => sum + (r.timeTakenMinutes / 60), 0) / testResults.length;
  if (avgTimeRatio > 0.9) {
    tips.push("⏱️ Work on time management – you're using most of the allotted time.");
  }

  return tips;
};

/**
 * Generate performance snapshot for dashboard
 */
export const generatePerformanceSnapshot = (
  testResults: TestResult[],
  selectedExams: string[]
): PerformanceSnapshot => {
  if (testResults.length === 0) {
    return {
      scoreHistory: [],
      subjectAccuracy: [],
      totalTestsTaken: 0,
      averageScore: 0,
    };
  }

  // Score history (last 5 tests)
  const recentTests = testResults.slice(-5);
  const scoreHistory = recentTests.map((r, idx) => ({
    testName: `Test ${testResults.length - recentTests.length + idx + 1}`,
    score: r.scorePercent,
  }));

  // Subject-wise accuracy
  const subjectScores: { [subject: string]: number[] } = {};
  testResults.forEach((result) => {
    Object.entries(result.sectionWiseAccuracy).forEach(([subject, accuracy]) => {
      if (!subjectScores[subject]) {
        subjectScores[subject] = [];
      }
      subjectScores[subject].push(accuracy);
    });
  });

  const subjectAccuracy = Object.entries(subjectScores).map(([subject, scores]) => ({
    subject,
    accuracy: Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length),
  }));

  // Calculate average score
  const averageScore = Math.round(
    testResults.reduce((sum, r) => sum + r.scorePercent, 0) / testResults.length
  );

  return {
    scoreHistory,
    subjectAccuracy,
    totalTestsTaken: testResults.length,
    averageScore,
  };
};

/**
 * Get next recommended test based on user's performance and selected exams
 */
export const getNextRecommendedTest = (
  testResults: TestResult[],
  selectedExams: string[]
): { exam: string; category: string; test: TestSummary } | null => {
  if (selectedExams.length === 0) return null;

  const competitiveExams = getCompetitiveExams();
  
  // Get all exams user selected
  const userExams = competitiveExams.filter((e) => selectedExams.includes(e.id));

  // Find tests not yet attempted
  const attemptedTestIds = new Set(testResults.map((r) => r.testId));

  for (const exam of userExams) {
    // Safety check: ensure categories exists and is array
    const categories = Array.isArray(exam.categories) ? exam.categories : [];
    for (const category of categories) {
      // Safety check: ensure tests exists and is array
      const tests = Array.isArray(category.tests) ? category.tests : [];
      for (const test of tests) {
        if (!attemptedTestIds.has(test.id)) {
          return {
            exam: exam.name,
            category: category.name,
            test,
          };
        }
      }
    }
  }

  // If all tests attempted, recommend retaking lowest scoring test
  if (testResults.length > 0) {
    const lowestScore = [...testResults].sort((a, b) => a.scorePercent - b.scorePercent)[0];
    
    for (const exam of userExams) {
      // Safety check: ensure categories exists and is array
      const categories = Array.isArray(exam.categories) ? exam.categories : [];
      for (const category of categories) {
        // Safety check: ensure tests exists and is array
        const tests = Array.isArray(category.tests) ? category.tests : [];
        const test = tests.find((t) => t.id === lowestScore.testId);
        if (test) {
          return {
            exam: exam.name,
            category: category.name,
            test,
          };
        }
      }
    }
  }

  // Default: return first test of first selected exam
  if (userExams.length > 0) {
    const firstExam = userExams[0];
    const categories = Array.isArray(firstExam.categories) ? firstExam.categories : [];
    if (categories.length > 0) {
      const tests = Array.isArray(categories[0].tests) ? categories[0].tests : [];
      if (tests.length > 0) {
        return {
          exam: firstExam.name,
          category: categories[0].name,
          test: tests[0],
        };
      }
    }
  }

  return null;
};
