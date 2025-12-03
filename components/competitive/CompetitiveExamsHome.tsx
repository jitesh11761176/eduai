import React from "react";

interface CompetitiveExamsHomeProps {
  onNavigateToLogin: () => void;
}

const CompetitiveExamsHome: React.FC<CompetitiveExamsHomeProps> = ({ onNavigateToLogin }) => {
  const exams = [
    { id: "ssc", name: "SSC", badge: "Popular" },
    { id: "kvs", name: "KVS", badge: "Trending" },
    { id: "nda", name: "NDA", badge: "Elite" },
    { id: "cuet", name: "CUET", badge: "New" },
    { id: "afcat", name: "AFCAT", badge: "Defense" },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-indigo-50 via-white to-blue-50 border-y border-indigo-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl text-slate-900 mb-4">
            Competitive Exams Prep
          </h2>
          <p className="mt-4 max-w-3xl mx-auto text-xl text-slate-600">
            Practice full-length and sectional tests for SSC, KVS, NDA, CUET, AFCAT and more.
            Get personalized analytics and AI-powered guidance to ace your exams.
          </p>
        </div>

        {/* CTA Button */}
        <div className="flex flex-col items-center mb-12">
          <button
            onClick={onNavigateToLogin}
            className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-lg px-8 py-4 rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Login to Competitive Exams
          </button>
          
          {/* Admin Help Tip */}
          <div className="mt-4 flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-lg px-4 py-2">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-purple-700">
              <strong>Admin Access:</strong> Login with <code className="bg-purple-100 px-2 py-0.5 rounded">jiteshshahpgtcs2@gmail.com</code> to manage exams
            </span>
          </div>
        </div>

        {/* Exam Chips */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {exams.map((exam) => (
            <div
              key={exam.id}
              className="group relative bg-white rounded-xl px-6 py-3 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-blue-300"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-slate-900">{exam.name}</span>
                {exam.badge && (
                  <span
                    className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
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
              </div>
            </div>
          ))}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">1000+ Practice Tests</h3>
            <p className="text-slate-600 text-sm">
              Full-length and sectional tests covering all topics and difficulty levels
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Detailed Analytics</h3>
            <p className="text-slate-600 text-sm">
              Track your performance with comprehensive charts and insights
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">AI Guidance</h3>
            <p className="text-slate-600 text-sm">
              Get personalized recommendations and study tips powered by AI
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CompetitiveExamsHome;
