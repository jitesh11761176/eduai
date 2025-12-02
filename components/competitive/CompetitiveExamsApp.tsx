import React, { useState } from "react";
import { CompetitiveUserProvider, useCompetitiveUser } from "../../contexts/CompetitiveUserContext";
import CompetitiveLogin from "./CompetitiveLogin";
import CompetitiveOnboarding from "./CompetitiveOnboarding";
import CompetitiveDashboard from "./CompetitiveDashboard";
import CompetitiveExamDetail from "./CompetitiveExamDetail";
import CompetitiveCategoryTests from "./CompetitiveCategoryTests";
import CompetitiveTestRunner from "./CompetitiveTestRunner";
import CompetitiveTestResult from "./CompetitiveTestResult";
import CompetitiveAdminDashboard from "./CompetitiveAdminDashboard";

type CompetitiveView = 
  | "login"
  | "onboarding"
  | "dashboard"
  | "admin"
  | "examDetail"
  | "examList"
  | "categoryTests"
  | "testRunner"
  | "testResult";

interface CompetitiveViewContext {
  examId?: string;
  categoryId?: string;
  testId?: string;
}

interface NavigateFunction {
  (view: CompetitiveView, context?: CompetitiveViewContext): void;
}

const CompetitiveRouter: React.FC = () => {
  const [view, setView] = useState<CompetitiveView>("login");
  const [context, setContext] = useState<CompetitiveViewContext>({});
  const { isAuthenticated } = useCompetitiveUser();

  const navigate: NavigateFunction = (newView, newContext = {}) => {
    setView(newView);
    setContext(newContext);
  };

  // Auto-redirect to login if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated && view !== "login") {
      setView("login");
    }
  }, [isAuthenticated, view]);

  switch (view) {
    case "login":
      return <CompetitiveLogin navigate={navigate} />;
    case "onboarding":
      return <CompetitiveOnboarding navigate={navigate} />;
    case "dashboard":
      return <CompetitiveDashboard navigate={navigate} />;
    case "admin":
      return <CompetitiveAdminDashboard navigate={navigate} />;
    case "examDetail":
      if (!context.examId) return <CompetitiveDashboard navigate={navigate} />;
      return <CompetitiveExamDetail navigate={navigate} examId={context.examId} />;
    case "categoryTests":
      if (!context.examId || !context.categoryId) return <CompetitiveDashboard navigate={navigate} />;
      return <CompetitiveCategoryTests navigate={navigate} examId={context.examId} categoryId={context.categoryId} />;
    case "testRunner":
      if (!context.testId) return <CompetitiveDashboard navigate={navigate} />;
      return <CompetitiveTestRunner navigate={navigate} testId={context.testId} />;
    case "testResult":
      if (!context.testId) return <CompetitiveDashboard navigate={navigate} />;
      return <CompetitiveTestResult navigate={navigate} testId={context.testId} />;
    default:
      return <CompetitiveLogin navigate={navigate} />;
  }
};

const CompetitiveExamsApp: React.FC = () => {
  return (
    <CompetitiveUserProvider>
      <CompetitiveRouter />
    </CompetitiveUserProvider>
  );
};

export default CompetitiveExamsApp;
