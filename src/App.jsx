// App.jsx — Root, uses useAuth + useToast hooks
import { useEffect, useState } from "react";
import { injectGlobalStyles } from "./styles/global.js";
import { useAuth }   from "./hooks/useAuth.js";
import { useToast }  from "./hooks/useToast.js";
import Sidebar       from "./components/Sidebar.jsx";
import { Toast }     from "./components/UI.jsx";

import LoginPage       from "./pages/LoginPage.jsx";
import DashboardPage   from "./pages/DashboardPage.jsx";
import UsersPage       from "./pages/Userspage.tsx";
import TasksPage       from "./pages/TasksPage.jsx";
import InterviewsPage  from "./pages/InterviewsPage.jsx";
import SubmissionsPage from "./pages/Submisionpage.tsx";
import SalaryPage      from "./pages/SalaryPage.jsx";
import ChatPage        from "./pages/ChatPage.jsx";

injectGlobalStyles();

const DEFAULT_PAGE = {
  owner:     "dashboard",
  developer: "tasks",
  caller:    "interviews",
  bidder:    "submissions",
};

export default function App() {
  const { user, logout } = useAuth();
  const { toast, show: showToast, hide: hideToast } = useToast();
  const [page, setPage] = useState("dashboard");

  useEffect(() => {
    if (user) setPage(DEFAULT_PAGE[user.role] || "dashboard");
  }, [user?.role]);

  if (!user) {
    return <LoginPage onLogin={() => {
      // useAuth already saved to localStorage — just trigger re-render
      window.location.reload();
    }} />;
  }

  const renderPage = () => {
    switch (page) {
      case "dashboard":   return <DashboardPage />;
      case "users":       return <UsersPage       toast={showToast} />;
      case "tasks":       return <TasksPage        user={user} toast={showToast} />;
      case "interviews":  return <InterviewsPage   user={user} toast={showToast} />;
      case "submissions": return <SubmissionsPage  user={user} toast={showToast} />;
      case "salary":      return <SalaryPage       user={user} toast={showToast} />;
      case "chat":        return <ChatPage         user={user} toast={showToast} />;
      default:            return <DashboardPage />;
    }
  };

  return (
    <div className="app">
      <Sidebar user={user} active={page} setActive={setPage} logout={logout} />
      <div className="page-content">{renderPage()}</div>
      {toast && <Toast {...toast} onClose={hideToast} />}
    </div>
  );
}