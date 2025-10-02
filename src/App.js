// ==============================
// File: src/App.js
// Role: 라우팅 + localStorage 기반 로그인 가드
// - localStorage 키(amgi_admin_auth, admin_logged_in) 확인
// - 로그인 유지 (브라우저 껐다 켜도 유지)
// - 로그아웃 시 localStorage 키 삭제
// ==============================

import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import TopNav from "./components/TopNav";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import UsersPage from "./pages/UsersPage";
import PacksPage from "./pages/PacksPage";
import VideosPage from "./pages/VideosPage";
import AdminsPage from "./pages/AdminsPage";
import { useState, useEffect } from "react";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(checkAuth());
  const navigate = useNavigate();
  const location = useLocation();

  function checkAuth() {
    return (
      localStorage.getItem("amgi_admin_auth") === "1" ||
      localStorage.getItem("admin_logged_in") === "1"
    );
  }

  // 항상 localStorage 상태와 싱크 맞추기
  useEffect(() => {
    setIsLoggedIn(checkAuth());

    if (!checkAuth() && location.pathname !== "/login") {
      navigate("/login", { replace: true });
    }
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("amgi_admin_auth");
    localStorage.removeItem("admin_logged_in");
    setIsLoggedIn(false);
    navigate("/login", { replace: true });
  };

  // 로그인 안 된 경우 무조건 Login 페이지
  if (!isLoggedIn) return <Login />;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <TopNav onLogout={handleLogout} />
      <div className="p-6">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/packs" element={<PacksPage />} />
          <Route path="/videos" element={<VideosPage />} />
          <Route path="/admins" element={<AdminsPage />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
