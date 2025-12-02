import React, { useState } from "react";
import { useCompetitiveUser } from "../../contexts/CompetitiveUserContext";

interface CompetitiveLoginProps {
  navigate: (view: string, context?: any) => void;
}

const CompetitiveLogin: React.FC<CompetitiveLoginProps> = ({ navigate }) => {
  const { login } = useCompetitiveUser();
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  const handleGoogleLogin = () => {
    // Simulate Google login (frontend-only for now)
    const mockUser = {
      id: `user_${Date.now()}`,
      name: "Demo User",
      email: "demo@gmail.com",
    };
    
    login(mockUser);
    navigate("onboarding");
  };

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) return;

    const user = {
      id: `user_${Date.now()}`,
      name: name,
      email: email,
    };
    
    login(user);
    navigate("onboarding");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo/Brand */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl mb-4">
              <span className="text-2xl font-bold text-white">E</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Competitive Exams</h1>
            <p className="text-slate-600">Sign in to start your preparation journey</p>
          </div>

          {/* Login Button */}
          {!showEmailInput ? (
            <>
              <button
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-slate-500">Or</span>
                </div>
              </div>

              <button
                onClick={() => setShowEmailInput(true)}
                className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
                <span>Sign in with Email</span>
              </button>
            </>
          ) : (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  required
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Continue
              </button>
              <button
                type="button"
                onClick={() => setShowEmailInput(false)}
                className="w-full text-slate-600 hover:text-slate-900 font-medium py-2"
              >
                Back to login options
              </button>
            </form>
          )}

          {/* Features */}
          <div className="mt-8 pt-8 border-t border-slate-200">
            <p className="text-sm font-semibold text-slate-900 mb-4">What you'll get:</p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-slate-600">Practice tests for SSC, KVS, NDA, CUET, AFCAT & more</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-slate-600">Detailed performance analytics and insights</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-slate-600">Personalized study guidance and recommendations</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-slate-600">Full-length and sectional mock tests</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-slate-500 mt-6">
          Powered by <span className="font-semibold text-slate-700">EduAI</span> – Your path to success
        </p>
      </div>
    </div>
  );
};

export default CompetitiveLogin;
