import React, { createContext, useContext, useState, useEffect } from "react";
import { CompetitiveUser, TestResult } from "../types/competitive";

interface CompetitiveUserContextType {
  user: CompetitiveUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (userData: Omit<CompetitiveUser, "selectedExams">) => void;
  logout: () => void;
  updateSelectedExams: (exams: string[]) => void;
  testResults: TestResult[];
  addTestResult: (result: TestResult) => void;
  getTestAttempts: (testId: string) => number;
  getLastScore: (testId: string) => number | undefined;
}

const CompetitiveUserContext = createContext<CompetitiveUserContextType | undefined>(undefined);

const STORAGE_KEY = "competitive_user";
const RESULTS_KEY = "competitive_test_results";
const ADMIN_EMAIL = "jiteshshahpgtcs2@gmail.com";

export const CompetitiveUserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<CompetitiveUser | null>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);

  // Load user and results from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem(STORAGE_KEY);
    const storedResults = localStorage.getItem(RESULTS_KEY);
    
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse stored user:", e);
      }
    }
    
    if (storedResults) {
      try {
        setTestResults(JSON.parse(storedResults));
      } catch (e) {
        console.error("Failed to parse stored results:", e);
      }
    }
  }, []);

  // Save user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  // Save results to localStorage whenever they change
  useEffect(() => {
    if (testResults.length > 0) {
      localStorage.setItem(RESULTS_KEY, JSON.stringify(testResults));
    }
  }, [testResults]);

  const login = (userData: Omit<CompetitiveUser, "selectedExams">) => {
    setUser({
      ...userData,
      selectedExams: [],
    });
  };

  const logout = () => {
    setUser(null);
    setTestResults([]);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(RESULTS_KEY);
  };

  const updateSelectedExams = (exams: string[]) => {
    if (user) {
      setUser({
        ...user,
        selectedExams: exams,
      });
    }
  };

  const addTestResult = (result: TestResult) => {
    setTestResults((prev) => [...prev, result]);
  };

  const getTestAttempts = (testId: string): number => {
    return testResults.filter((r) => r.testId === testId).length;
  };

  const getLastScore = (testId: string): number | undefined => {
    const testAttempts = testResults.filter((r) => r.testId === testId);
    if (testAttempts.length === 0) return undefined;
    return testAttempts[testAttempts.length - 1].scorePercent;
  };

  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  // Debug log
  useEffect(() => {
    if (user) {
      console.log("Current user:", user);
      console.log("User email:", user.email);
      console.log("Admin email:", ADMIN_EMAIL);
      console.log("Is admin:", isAdmin);
    }
  }, [user, isAdmin]);

  return (
    <CompetitiveUserContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin,
        login,
        logout,
        updateSelectedExams,
        testResults,
        addTestResult,
        getTestAttempts,
        getLastScore,
      }}
    >
      {children}
    </CompetitiveUserContext.Provider>
  );
};

export const useCompetitiveUser = () => {
  const context = useContext(CompetitiveUserContext);
  if (context === undefined) {
    throw new Error("useCompetitiveUser must be used within a CompetitiveUserProvider");
  }
  return context;
};
