import React, { useState, useEffect } from "react";
import { useCompetitiveUser } from "../../contexts/CompetitiveUserContext";
import { competitiveExams } from "../../data/competitive";
import { Exam } from "../../types/competitive";

interface CompetitiveAdminDashboardProps {
  navigate: (view: string, context?: any) => void;
}

const CompetitiveAdminDashboard: React.FC<CompetitiveAdminDashboardProps> = ({ navigate }) => {
  const { isAdmin, testResults } = useCompetitiveUser();
  const [activeTab, setActiveTab] = useState<"overview" | "exams" | "users">("overview");
  const [exams, setExams] = useState<Exam[]>([...competitiveExams]);
  const [showAddExamModal, setShowAddExamModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [selectedExamId, setSelectedExamId] = useState<string>("");

  // Get user data from localStorage
  const [allUsers, setAllUsers] = useState<any[]>([]);

  useEffect(() => {
    // Load all competitive users from localStorage
    const users: any[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("competitive_user")) {
        try {
          const user = JSON.parse(localStorage.getItem(key) || "");
          users.push(user);
        } catch (e) {}
      }
    }
    setAllUsers(users);
  }, []);

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-slate-600 mb-6">You don't have permission to access this page.</p>
          <button
            onClick={() => navigate("dashboard")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const handleDeleteExam = (examId: string) => {
    if (confirm("Are you sure you want to delete this exam?")) {
      setExams(exams.filter((e) => e.id !== examId));
      // In a real app, this would update the backend
      alert("Exam deleted successfully!");
    }
  };

  const handleDeleteCategory = (examId: string, categoryId: string) => {
    if (confirm("Are you sure you want to delete this category?")) {
      setExams(
        exams.map((exam) => {
          if (exam.id === examId) {
            return {
              ...exam,
              categories: exam.categories.filter((c) => c.id !== categoryId),
            };
          }
          return exam;
        })
      );
      alert("Category deleted successfully!");
    }
  };

  const handleDeleteTest = (examId: string, categoryId: string, testId: string) => {
    if (confirm("Are you sure you want to delete this test?")) {
      setExams(
        exams.map((exam) => {
          if (exam.id === examId) {
            return {
              ...exam,
              categories: exam.categories.map((cat) => {
                if (cat.id === categoryId) {
                  return {
                    ...cat,
                    tests: cat.tests.filter((t) => t.id !== testId),
                  };
                }
                return cat;
              }),
            };
          }
          return exam;
        })
      );
      alert("Test deleted successfully!");
    }
  };

  const totalTests = exams.reduce(
    (sum, exam) => sum + exam.categories.reduce((catSum, cat) => catSum + cat.tests.length, 0),
    0
  );

  const totalAttempts = testResults.length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
              <p className="text-slate-600 mt-1">Manage competitive exams content</p>
            </div>
            <button
              onClick={() => navigate("dashboard")}
              className="bg-slate-600 hover:bg-slate-700 text-white font-semibold px-6 py-3 rounded-lg"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab("overview")}
              className={`py-4 font-semibold border-b-2 transition-colors ${
                activeTab === "overview"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("exams")}
              className={`py-4 font-semibold border-b-2 transition-colors ${
                activeTab === "exams"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              Manage Exams
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`py-4 font-semibold border-b-2 transition-colors ${
                activeTab === "users"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              Users Data
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === "overview" && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <div className="text-3xl font-bold text-blue-600 mb-2">{exams.length}</div>
                <div className="text-slate-600">Total Exams</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {exams.reduce((sum, exam) => sum + exam.categories.length, 0)}
                </div>
                <div className="text-slate-600">Total Categories</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <div className="text-3xl font-bold text-purple-600 mb-2">{totalTests}</div>
                <div className="text-slate-600">Total Tests</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <div className="text-3xl font-bold text-orange-600 mb-2">{totalAttempts}</div>
                <div className="text-slate-600">Total Attempts</div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Quick Stats</h2>
              <div className="space-y-4">
                {exams.map((exam) => {
                  const examTests = exam.categories.reduce((sum, cat) => sum + cat.tests.length, 0);
                  const examAttempts = testResults.filter((r) => r.examId === exam.id).length;
                  return (
                    <div key={exam.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div>
                        <div className="font-semibold text-slate-900">{exam.name}</div>
                        <div className="text-sm text-slate-600">
                          {exam.categories.length} categories • {examTests} tests
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">{examAttempts}</div>
                        <div className="text-sm text-slate-600">Attempts</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === "exams" && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">Manage Exams</h2>
              <button
                onClick={() => setShowAddExamModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg"
              >
                + Add New Exam
              </button>
            </div>

            <div className="space-y-6">
              {exams.map((exam) => (
                <div key={exam.id} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">{exam.name}</h3>
                      <p className="text-slate-600">{exam.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedExamId(exam.id);
                          setShowAddCategoryModal(true);
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg text-sm"
                      >
                        + Add Category
                      </button>
                      <button
                        onClick={() => handleDeleteExam(exam.id)}
                        className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg text-sm"
                      >
                        Delete Exam
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {exam.categories.map((category) => (
                      <div key={category.id} className="bg-slate-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-slate-900">{category.name}</h4>
                            <p className="text-sm text-slate-600">{category.description}</p>
                          </div>
                          <button
                            onClick={() => handleDeleteCategory(exam.id, category.id)}
                            className="text-red-600 hover:text-red-700 font-medium text-sm"
                          >
                            Delete Category
                          </button>
                        </div>

                        <div className="space-y-2">
                          {category.tests.map((test) => (
                            <div
                              key={test.id}
                              className="flex items-center justify-between bg-white p-3 rounded border border-slate-200"
                            >
                              <div>
                                <div className="font-medium text-slate-900">{test.title}</div>
                                <div className="text-sm text-slate-600">
                                  {test.difficulty} • {test.durationMinutes} mins • {test.numQuestions} questions
                                </div>
                              </div>
                              <button
                                onClick={() => handleDeleteTest(exam.id, category.id, test.id)}
                                className="text-red-600 hover:text-red-700 font-medium text-sm"
                              >
                                Delete
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Competitive Exam Users</h2>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Name</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Email</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Selected Exams</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Total Attempts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {allUsers.map((user, index) => {
                    const userAttempts = testResults.filter((r) =>
                      user.selectedExams?.includes(r.examId)
                    ).length;
                    return (
                      <tr key={index} className="hover:bg-slate-50">
                        <td className="px-6 py-4 text-slate-900">{user.name}</td>
                        <td className="px-6 py-4 text-slate-600">{user.email}</td>
                        <td className="px-6 py-4 text-slate-600">
                          {user.selectedExams?.join(", ") || "None"}
                        </td>
                        <td className="px-6 py-4 text-slate-900 font-semibold">{userAttempts}</td>
                      </tr>
                    );
                  })}
                  {allUsers.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add Exam Modal */}
      {showAddExamModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md mx-4 w-full">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Add New Exam</h3>
            <p className="text-slate-600 mb-6">
              This is a demo modal. In production, this would have a form to add new exams.
            </p>
            <button
              onClick={() => setShowAddExamModal(false)}
              className="w-full bg-slate-600 hover:bg-slate-700 text-white font-semibold py-3 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md mx-4 w-full">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Add New Category</h3>
            <p className="text-slate-600 mb-6">
              This is a demo modal. In production, this would have a form to add new categories.
            </p>
            <button
              onClick={() => setShowAddCategoryModal(false)}
              className="w-full bg-slate-600 hover:bg-slate-700 text-white font-semibold py-3 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompetitiveAdminDashboard;
