// ==============================
// File: src/pages/Login.jsx
// Role: 암기송 관리자 로그인 화면
// - placeholder: ID / PASS
// - Firestore admins 인증 우선
// - 불러오기 실패/빈 결과시 안내
// - admin/0000 기본 계정 폴백 항상 허용
// - 로그인 성공 시 localStorage 키 저장
// ==============================

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAdmins } from "../lib/firestore";

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const N = (s) => (s ?? "").toString().trim();

  async function handleSubmit(e) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    const u = N(username);
    const p = N(password);

    try {
      // 0) 기본 계정 폴백
      if (u === "admin" && p === "0000") {
        finishLogin();
        return;
      }

      // 1) Firestore admins 조회
      let fetchError = false;
      let admins = [];
      try {
        const res = await getAdmins();
        admins = Array.isArray(res) ? res : [];
      } catch {
        fetchError = true;
      }

      if (fetchError || admins.length === 0) {
        alert("계정 정보를 불러오지 못했습니다.\n기본 계정(admin / 0000)으로 로그인해 주세요.");
        return;
      }

      // 2) 계정 검사
      const found = admins.find((a) => N(a.username) === u);
      if (!found) {
        alert("아이디가 틀렸습니다.");
        return;
      }
      if (N(found.password) !== p) {
        alert("비밀번호가 틀렸습니다.");
        return;
      }

      // 3) 성공
      finishLogin();
    } finally {
      setLoading(false);
    }
  }

  function finishLogin() {
    // localStorage 기반 인증
    localStorage.setItem("amgi_admin_auth", "1");
    localStorage.setItem("admin_logged_in", "1");

    navigate("/", { replace: true });
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-xl border bg-white p-6 shadow-sm">
        <h1 className="mb-6 text-center text-2xl font-bold">
          암기송 관리자 로그인
        </h1>

        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          <label htmlFor="admin-id" className="sr-only">
            ID
          </label>
          <input
            id="admin-id"
            type="text"
            className="w-full rounded-md border px-3 py-2 outline-none focus:border-blue-500"
            placeholder="ID"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />

          <label htmlFor="admin-pass" className="sr-only">
            PASS
          </label>
          <input
            id="admin-pass"
            type="password"
            className="w-full rounded-md border px-3 py-2 outline-none focus:border-blue-500"
            placeholder="PASS"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-md bg-blue-600 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "로그인 중..." : "로그인"}
          </button>
        </form>
      </div>
    </div>
  );
}
