import React, { useState, useEffect } from "react";
import { useCompetitiveUser } from "../../contexts/CompetitiveUserContext";
import { getCompetitiveExams } from "../../data/competitive";
import { Exam } from "../../types/competitive";
import BulkTestUploadModal from "../admin/BulkTestUploadModal";
import { saveCompetitiveExams, subscribeToCompetitiveExams } from "../../services/firebase";

interface CompetitiveAdminDashboardProps {
  navigate: (view: string, context?: any) => void;
}

const CompetitiveAdminDashboard: React.FC<CompetitiveAdminDashboardProps> = ({ navigate }) => {
  const { isAdmin, testResults } = useCompetitiveUser();
  const [activeTab, setActiveTab] = useState<"overview" | "exams" | "users">("overview");
  
  // Load exams from localStorage or use default data
  const [exams, setExams] = useState<Exam[]>(() => {
    return getCompetitiveExams();
  });
  
  const [showAddExamModal, setShowAddExamModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showAddTestModal, setShowAddTestModal] = useState(false);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [selectedExamId, setSelectedExamId] = useState<string>("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");

  // Form states
  const [examForm, setExamForm] = useState({ name: "", fullName: "", description: "", icon: "📚" });
  const [categoryForm, setCategoryForm] = useState({ name: "", description: "" });
  const [testForm, setTestForm] = useState({
    title: "",
    difficulty: "Easy" as "Easy" | "Medium" | "Hard",
    durationMinutes: 30,
    numQuestions: 20,
  });

  // Get user data from localStorage
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [allTestResults, setAllTestResults] = useState<any[]>([]);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Save exams to Firebase whenever they change
  useEffect(() => {
    const saveData = async () => {
      setIsSaving(true);
      await saveCompetitiveExams(exams);
      // Also keep localStorage as backup
      localStorage.setItem("competitive_exams_data", JSON.stringify(exams));
      setLastSaved(new Date());
      setIsSaving(false);
      console.log("📝 Admin saved data to Firebase:", exams);
    };
    
    saveData();
  }, [exams]);

  useEffect(() => {
    // Load all competitive users from localStorage
    const users: any[] = [];
    const results: any[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("competitive_user_")) {
        try {
          const user = JSON.parse(localStorage.getItem(key) || "");
          users.push(user);
          
          // Also load their test results
          const email = key.replace("competitive_user_", "");
          const userResults = localStorage.getItem(`competitive_test_results_${email}`);
          if (userResults) {
            const parsed = JSON.parse(userResults);
            results.push(...parsed);
          }
        } catch (e) {
          console.error("Failed to parse user data:", e);
        }
      }
    }
    setAllUsers(users);
    setAllTestResults(results);
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
      alert("Exam deleted successfully!");
    }
  };

  const handleAddExam = () => {
    if (!examForm.name || !examForm.fullName) {
      alert("Please fill in all required fields");
      return;
    }
    const newExam: Exam = {
      id: examForm.name.toLowerCase().replace(/\s+/g, "-"),
      name: examForm.name,
      fullName: examForm.fullName,
      description: examForm.description,
      icon: examForm.icon,
      categories: [],
    };
    setExams([...exams, newExam]);
    setExamForm({ name: "", fullName: "", description: "", icon: "📚" });
    setShowAddExamModal(false);
    alert("Exam added successfully!");
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

  const handleAddCategory = () => {
    if (!categoryForm.name || !selectedExamId) {
      alert("Please fill in all required fields");
      return;
    }
    const newCategory = {
      id: `cat-${Date.now()}`,
      name: categoryForm.name,
      description: categoryForm.description,
      tests: [],
    };
    setExams(
      exams.map((exam) => {
        if (exam.id === selectedExamId) {
          return {
            ...exam,
            categories: [...exam.categories, newCategory],
          };
        }
        return exam;
      })
    );
    setCategoryForm({ name: "", description: "" });
    setShowAddCategoryModal(false);
    setSelectedExamId("");
    alert("Category added successfully!");
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

  const handleBulkUpload = (testData: {
    title: string;
    difficulty: "Easy" | "Medium" | "Hard";
    durationMinutes: number;
    questions: any[];
  }) => {
    if (!selectedExamId || !selectedCategoryId) {
      alert("Please select exam and category");
      return;
    }
    
    const newTest = {
      id: `test-${Date.now()}`,
      title: testData.title,
      difficulty: testData.difficulty,
      durationMinutes: testData.durationMinutes,
      numQuestions: testData.questions.length,
      questions: testData.questions, // Store actual questions
    };
    
    setExams(
      exams.map((exam) => {
        if (exam.id === selectedExamId) {
          return {
            ...exam,
            categories: exam.categories.map((cat) => {
              if (cat.id === selectedCategoryId) {
                return {
                  ...cat,
                  tests: [...cat.tests, newTest],
                };
              }
              return cat;
            }),
          };
        }
        return exam;
      })
    );
    
    setShowBulkUploadModal(false);
    setSelectedExamId("");
    setSelectedCategoryId("");
    alert(`Test "${testData.title}" created with ${testData.questions.length} questions!`);
  };

  const handleAddTest = () => {
    if (!testForm.title || !selectedExamId || !selectedCategoryId) {
      alert("Please fill in all required fields");
      return;
    }
    const newTest = {
      id: `test-${Date.now()}`,
      title: testForm.title,
      difficulty: testForm.difficulty,
      durationMinutes: testForm.durationMinutes,
      numQuestions: testForm.numQuestions,
    };
    setExams(
      exams.map((exam) => {
        if (exam.id === selectedExamId) {
          return {
            ...exam,
            categories: exam.categories.map((cat) => {
              if (cat.id === selectedCategoryId) {
                return {
                  ...cat,
                  tests: [...cat.tests, newTest],
                };
              }
              return cat;
            }),
          };
        }
        return exam;
      })
    );
    setTestForm({ title: "", difficulty: "Easy", durationMinutes: 30, numQuestions: 20 });
    setShowAddTestModal(false);
    setSelectedExamId("");
    setSelectedCategoryId("");
    alert("Test added successfully!");
  };

  const handleDeleteUser = (userEmail: string) => {
    if (confirm(`Are you sure you want to delete all data for ${userEmail}? This action cannot be undone.`)) {
      // Remove user data and test results
      localStorage.removeItem(`competitive_user_${userEmail}`);
      localStorage.removeItem(`competitive_test_results_${userEmail}`);
      
      // Refresh user list
      const users: any[] = [];
      const results: any[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith("competitive_user_")) {
          try {
            const user = JSON.parse(localStorage.getItem(key) || "");
            users.push(user);
            
            // Also load their test results
            const email = key.replace("competitive_user_", "");
            const userResults = localStorage.getItem(`competitive_test_results_${email}`);
            if (userResults) {
              const parsed = JSON.parse(userResults);
              results.push(...parsed);
            }
          } catch (e) {
            console.error("Failed to parse user data:", e);
          }
        }
      }
      setAllUsers(users);
      setAllTestResults(results);
      alert("User data deleted successfully!");
    }
  };

  const totalTests = exams.reduce(
    (sum, exam) => sum + exam.categories.reduce((catSum, cat) => catSum + cat.tests.length, 0),
    0
  );

  const totalAttempts = testResults.length;
  
  const handleRefreshData = () => {
    const freshData = getCompetitiveExams();
    setExams(freshData);
    alert("Data refreshed from localStorage!");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Data Sync Indicator */}
      {lastSaved && (
        <div className={`border-b py-2 ${isSaving ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'}`}>
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
            <span className="text-sm">
              {isSaving ? (
                <span className="text-yellow-700">⏳ Saving to Firebase...</span>
              ) : (
                <span className="text-green-700">✓ Saved to Firebase at {lastSaved.toLocaleTimeString()}</span>
              )}
            </span>
            <button
              onClick={handleRefreshData}
              className={`text-sm font-medium underline ${isSaving ? 'text-yellow-700 hover:text-yellow-800' : 'text-green-700 hover:text-green-800'}`}
            >
              🔄 Refresh Data
            </button>
          </div>
        </div>
      )}
      
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
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setSelectedExamId(exam.id);
                                setSelectedCategoryId(category.id);
                                setShowAddTestModal(true);
                              }}
                              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-3 py-1 rounded text-sm"
                            >
                              + Add Test
                            </button>
                            <button
                              onClick={() => {
                                setSelectedExamId(exam.id);
                                setSelectedCategoryId(category.id);
                                setShowBulkUploadModal(true);
                              }}
                              className="bg-green-600 hover:bg-green-700 text-white font-medium px-3 py-1 rounded text-sm"
                            >
                              📤 Bulk Upload
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(exam.id, category.id)}
                              className="text-red-600 hover:text-red-700 font-medium text-sm"
                            >
                              Delete Category
                            </button>
                          </div>
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
                    <th className="text-right px-6 py-4 text-sm font-semibold text-slate-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {allUsers.map((user, index) => {
                    const userAttempts = allTestResults.filter((r) =>
                      user.selectedExams?.includes(r.examId)
                    ).length;
                    
                    // Get exam names from IDs
                    const examNames = user.selectedExams?.map((examId: string) => 
                      exams.find(e => e.id === examId)?.name || examId
                    ).join(", ") || "None";
                    
                    return (
                      <tr key={index} className="hover:bg-slate-50">
                        <td className="px-6 py-4 text-slate-900">{user.name}</td>
                        <td className="px-6 py-4 text-slate-600">{user.email}</td>
                        <td className="px-6 py-4 text-slate-600">
                          {examNames}
                        </td>
                        <td className="px-6 py-4 text-slate-900 font-semibold">{userAttempts}</td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDeleteUser(user.email)}
                            className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors"
                          >
                            Delete User
                          </button>
                        </td>
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Add New Exam</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Exam Name (Short) *
                </label>
                <input
                  type="text"
                  value={examForm.name}
                  onChange={(e) => setExamForm({ ...examForm, name: e.target.value })}
                  placeholder="e.g., UPSC"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={examForm.fullName}
                  onChange={(e) => setExamForm({ ...examForm, fullName: e.target.value })}
                  placeholder="e.g., Union Public Service Commission"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  value={examForm.description}
                  onChange={(e) => setExamForm({ ...examForm, description: e.target.value })}
                  placeholder="Brief description of the exam"
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Icon (Emoji)
                </label>
                <input
                  type="text"
                  value={examForm.icon}
                  onChange={(e) => setExamForm({ ...examForm, icon: e.target.value })}
                  placeholder="📚"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddExam}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg"
              >
                Add Exam
              </button>
              <button
                onClick={() => {
                  setShowAddExamModal(false);
                  setExamForm({ name: "", fullName: "", description: "", icon: "📚" });
                }}
                className="flex-1 bg-slate-300 hover:bg-slate-400 text-slate-700 font-semibold py-3 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-md w-full">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Add New Category</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  placeholder="e.g., General Intelligence & Reasoning"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  placeholder="Brief description of the category"
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddCategory}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg"
              >
                Add Category
              </button>
              <button
                onClick={() => {
                  setShowAddCategoryModal(false);
                  setCategoryForm({ name: "", description: "" });
                  setSelectedExamId("");
                }}
                className="flex-1 bg-slate-300 hover:bg-slate-400 text-slate-700 font-semibold py-3 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Test Modal */}
      {showAddTestModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-md w-full">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Add New Test</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Test Title *
                </label>
                <input
                  type="text"
                  value={testForm.title}
                  onChange={(e) => setTestForm({ ...testForm, title: e.target.value })}
                  placeholder="e.g., Reasoning Basics - Test 1"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Difficulty *
                </label>
                <select
                  value={testForm.difficulty}
                  onChange={(e) =>
                    setTestForm({ ...testForm, difficulty: e.target.value as "Easy" | "Medium" | "Hard" })
                  }
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Duration (minutes) *
                </label>
                <input
                  type="number"
                  value={testForm.durationMinutes}
                  onChange={(e) => setTestForm({ ...testForm, durationMinutes: parseInt(e.target.value) })}
                  min="5"
                  max="180"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Number of Questions *
                </label>
                <input
                  type="number"
                  value={testForm.numQuestions}
                  onChange={(e) => setTestForm({ ...testForm, numQuestions: parseInt(e.target.value) })}
                  min="5"
                  max="200"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddTest}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg"
              >
                Add Test
              </button>
              <button
                onClick={() => {
                  setShowAddTestModal(false);
                  setTestForm({ title: "", difficulty: "Easy", durationMinutes: 30, numQuestions: 20 });
                  setSelectedExamId("");
                  setSelectedCategoryId("");
                }}
                className="flex-1 bg-slate-300 hover:bg-slate-400 text-slate-700 font-semibold py-3 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Bulk Upload Modal */}
      {showBulkUploadModal && (
        <BulkTestUploadModal
          isOpen={showBulkUploadModal}
          onClose={() => {
            setShowBulkUploadModal(false);
            setSelectedExamId("");
            setSelectedCategoryId("");
          }}
          onUpload={handleBulkUpload}
          examName={exams.find(e => e.id === selectedExamId)?.name}
          categoryName={exams.find(e => e.id === selectedExamId)?.categories.find(c => c.id === selectedCategoryId)?.name}
        />
      )}
    </div>
  );
};

export default CompetitiveAdminDashboard;
