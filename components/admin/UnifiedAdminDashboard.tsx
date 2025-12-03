import React, { useState } from "react";
import CompetitiveAdminDashboard from "../competitive/CompetitiveAdminDashboard";

interface UnifiedAdminDashboardProps {
  navigate: (view: string, context?: any) => void;
  competitiveNavigate?: (view: string, context?: any) => void;
}

const UnifiedAdminDashboard: React.FC<UnifiedAdminDashboardProps> = ({ navigate, competitiveNavigate }) => {
  const [activeSection, setActiveSection] = useState<"school" | "competitive">("school");

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">EduAI Admin Dashboard</h1>
              <p className="text-purple-100">Full control over School & Competitive Exams sections</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                <span className="text-sm font-medium">Admin: jiteshshahpgtcs2@gmail.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveSection("school")}
              className={`px-8 py-4 font-semibold text-lg border-b-4 transition-all ${
                activeSection === "school"
                  ? "border-blue-600 text-blue-600 bg-blue-50"
                  : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                School Section (Balvatika - XII)
              </div>
            </button>
            <button
              onClick={() => setActiveSection("competitive")}
              className={`px-8 py-4 font-semibold text-lg border-b-4 transition-all ${
                activeSection === "competitive"
                  ? "border-indigo-600 text-indigo-600 bg-indigo-50"
                  : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Competitive Exams (SSC, NDA, etc.)
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div>
        {activeSection === "school" ? (
          <SchoolAdminSection navigate={navigate} />
        ) : (
          <div className="bg-slate-50">
            <CompetitiveAdminDashboard navigate={competitiveNavigate || navigate} />
          </div>
        )}
      </div>
    </div>
  );
};

// School Admin Section
const SchoolAdminSection: React.FC<{ navigate: (view: string, context?: any) => void }> = ({ navigate }) => {
  const [activeTab, setActiveTab] = useState<"overview" | "courses" | "users" | "tests">("overview");

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-blue-200">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">0</div>
              <div className="text-sm text-slate-600">Total Courses</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-green-200">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">0</div>
              <div className="text-sm text-slate-600">Total Students</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-purple-200">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600">0</div>
              <div className="text-sm text-slate-600">Total Teachers</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-orange-200">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600">0</div>
              <div className="text-sm text-slate-600">Total Tests</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-8">
        <div className="border-b border-slate-200 px-6">
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
              onClick={() => setActiveTab("courses")}
              className={`py-4 font-semibold border-b-2 transition-colors ${
                activeTab === "courses"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              Manage Courses
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`py-4 font-semibold border-b-2 transition-colors ${
                activeTab === "users"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              Manage Users
            </button>
            <button
              onClick={() => setActiveTab("tests")}
              className={`py-4 font-semibold border-b-2 transition-colors ${
                activeTab === "tests"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              Manage Tests
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === "overview" && (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h3 className="text-xl font-bold text-slate-900 mb-2">School Section Overview</h3>
              <p className="text-slate-600 mb-6">
                Full control over courses, students, teachers, and assessments for Classes Balvatika to XII
              </p>
              <button
                onClick={() => navigate("dashboard")}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Go to School Dashboard
              </button>
            </div>
          )}

          {activeTab === "courses" && (
            <div className="text-center py-12">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Course Management</h3>
              <p className="text-slate-600 mb-6">Create, edit, and manage all school courses</p>
              <div className="flex justify-center gap-4">
                <button className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors">
                  + Add New Course
                </button>
                <button className="bg-slate-600 hover:bg-slate-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors">
                  View All Courses
                </button>
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div className="text-center py-12">
              <h3 className="text-xl font-bold text-slate-900 mb-2">User Management</h3>
              <p className="text-slate-600 mb-6">Manage students, teachers, and principals</p>
              <div className="flex justify-center gap-4">
                <button className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors">
                  + Add New User
                </button>
                <button className="bg-slate-600 hover:bg-slate-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors">
                  View All Users
                </button>
              </div>
            </div>
          )}

          {activeTab === "tests" && (
            <div className="text-center py-12">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Test Management</h3>
              <p className="text-slate-600 mb-6">Create and manage assessments for all courses</p>
              <div className="flex justify-center gap-4">
                <button className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors">
                  + Create New Test
                </button>
                <button className="bg-slate-600 hover:bg-slate-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors">
                  View All Tests
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UnifiedAdminDashboard;
