// ==============================
// File: src/pages/UsersPage.jsx
// Role: 유저 목록/검색/페이지 + 보유팩/기기관리 연동
// Note:
//   - 행 클릭 = 선택 → 하단 DeviceManager에 전달, 자동 조회/표시
//   - 기기관리 버튼/우측 입력창은 사용하지 않음
// ------------------------------
// Changelog:
//   [2025-09-27 PATCH] 행 선택만으로 기기관리 표시(버튼 제거). selectedUser 전달/하이라이트/스크롤 유지
// ==============================

import { useEffect, useMemo, useRef, useState } from "react";
import LoadingBar from "../components/LoadingBar";
import UserFormModal from "../components/users/UserFormModal";
import DeviceManager from "../components/videos/DeviceManager";
import {
  getUsers,
  addUser,
  updateUser,
  deleteUser,
  getWordPacks,
  setUserOwnedPacks,
} from "../lib/firestore";

// 보유팩 라벨 유틸
function makePackLabel(pack) {
  if (!pack) return "";
  const name = pack.name || "(no-name)";
  const lang = pack.language ? ` / ${pack.language}` : "";
  const type = pack.type ? ` (${pack.type})` : "";
  return `${name}${lang}${type}`;
}
function extractOwnedPackIds(user) {
  if (!user) return [];
  return (
    user.ownedPacks ||
    user.ownedPackIds ||
    user.packs ||
    user.purchased_packs ||
    []
  );
}
function displayNameOf(u) {
  return u.displayName || u.name || u.email || "-";
}

export default function UsersPage() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [packs, setPacks] = useState([]);

  const [q, setQ] = useState("");
  const [perPage, setPerPage] = useState(20);
  const [page, setPage] = useState(1);

  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState("add");
  const [editingUser, setEditingUser] = useState(null);
  const [anchorRect, setAnchorRect] = useState(null);
  const addBtnRef = useRef(null);

  // [2025-09-27 PATCH] 선택된 유저(하단 기기관리 연동)
  const [selectedUser, setSelectedUser] = useState(null);
  const deviceSectionRef = useRef(null);

  const fetchAll = async () => {
    setLoading(true);
    const [userList, packList] = await Promise.all([getUsers(), getWordPacks()]);
    setUsers(userList);
    setPacks(packList);
    setLoading(false);
  };
  useEffect(() => { fetchAll(); }, []);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return users;
    return users.filter((u) => {
      const email = (u.email || "").toLowerCase();
      const name = displayNameOf(u).toLowerCase();
      return email.includes(qq) || name.includes(qq);
    });
  }, [q, users]);

  const total = filtered.length;
  const lastPage = Math.max(1, Math.ceil(total / perPage));
  const safePage = Math.min(page, lastPage);
  const slice = filtered.slice((safePage - 1) * perPage, safePage * perPage);

  const openAdd = () => {
    setFormMode("add");
    setEditingUser(null);
    setAnchorRect(addBtnRef.current?.getBoundingClientRect() ?? null);
    setShowForm(true);
  };
  const openEdit = (u, anchor) => {
    setFormMode("edit");
    setEditingUser(u);
    setAnchorRect(anchor?.getBoundingClientRect?.() ?? null);
    setShowForm(true);
  };
  const closeForm = () => setShowForm(false);

  const handleSave = async (mode, data, idWhenEdit) => {
    if (mode === "add") {
      await addUser({ displayName: data.displayName, email: data.email, ownedPacks: data.ownedPacks });
      // 새 유저의 purchases 동기화는 필요 시 추가
    } else {
      await updateUser(idWhenEdit, { displayName: data.displayName, email: data.email, ownedPacks: data.ownedPacks });
      await setUserOwnedPacks(idWhenEdit, data.ownedPacks || []);
    }
    await fetchAll();
    setShowForm(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("해당 유저를 삭제하시겠습니까?")) return;
    await deleteUser(id);
    await fetchAll();
    setSelectedUser((prev) => (prev && prev.id === id ? null : prev));
  };

  // [2025-09-27 PATCH] 행 클릭 = 선택 + 기기관리 섹션으로 스크롤
  const selectUser = (u) => {
    setSelectedUser(u || null);
    setTimeout(() => {
      deviceSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  };

  function ownedPackText(u) {
    const ids = extractOwnedPackIds(u) || [];
    if (ids.length === 0) return "-";
    const byId = new Map(packs.map((p) => [p.id, p]));
    const labels = ids.map((id) => makePackLabel(byId.get(id))).filter(Boolean);
    if (labels.length <= 3) return labels.join(", ");
    return `${labels.slice(0, 3).join(", ")} 외 ${labels.length - 3}개`;
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-2xl font-bold">유저 관리</h1>
        <div className="flex items-center gap-2">
          <input
            className="border rounded px-3 py-2 w-64"
            placeholder="검색 (이메일 / 이름)"
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
          />
          <select
            className="border rounded px-2 py-2"
            value={perPage}
            onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}
          >
            <option value={10}>10개</option>
            <option value={20}>20개</option>
            <option value={50}>50개</option>
            <option value={100}>100개</option>
          </select>
          <button
            ref={addBtnRef}
            className="px-3 py-2 rounded bg-blue-600 text-white"
            onClick={openAdd}
          >
            유저 추가
          </button>
        </div>
      </div>

      <LoadingBar show={loading} />

      <div className="overflow-x-auto border rounded bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr className="text-left">
              <th className="px-4 py-2">이름</th>
              <th className="px-4 py-2">이메일</th>
              <th className="px-4 py-2">보유 팩</th>
              <th className="px-4 py-2 text-center">액션</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {slice.map((u) => {
              const isSel = selectedUser && selectedUser.id === u.id;
              return (
                <tr
                  key={u.id}
                  className={`cursor-pointer ${isSel ? "bg-blue-50" : "hover:bg-gray-50"}`}
                  onClick={() => selectUser(u)}
                >
                  <td className="px-4 py-2">{displayNameOf(u)}</td>
                  <td className="px-4 py-2">{u.email || "-"}</td>
                  <td className="px-4 py-2">{ownedPackText(u)}</td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2 justify-center">
                      <button
                        className="px-2 py-1 border rounded hover:bg-gray-100"
                        onClick={(e) => { e.stopPropagation(); openEdit(u, e.currentTarget); }}
                      >
                        수정
                      </button>
                      <button
                        className="px-2 py-1 border rounded bg-red-600 text-white hover:bg-red-700"
                        onClick={(e) => { e.stopPropagation(); handleDelete(u.id); }}
                      >
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {slice.length === 0 && !loading && (
              <tr>
                <td className="px-4 py-10 text-center text-gray-500" colSpan={4}>
                  결과가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      <div className="flex items-center justify-end gap-3 px-1 py-3 text-sm text-gray-600">
        <span>
          {(safePage - 1) * perPage + 1}-{Math.min(safePage * perPage, total)} / 총 {total}
        </span>
        <div className="flex items-center gap-2">
          <button
            className="px-2 py-1 border rounded hover:bg-gray-50"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage === 1}
          >
            이전
          </button>
          <span>페이지 {safePage} / {lastPage}</span>
          <button
            className="px-2 py-1 border rounded hover:bg-gray-50"
            onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
            disabled={safePage === lastPage}
          >
            다음
          </button>
        </div>
      </div>

      {/* 모달 */}
      {showForm && (
        <UserFormModal
          mode={formMode}
          initialUser={editingUser}
          packs={packs}
          anchorRect={anchorRect}
          onClose={closeForm}
          onSave={handleSave}
          yOffset={8}
        />
      )}

      {/* 하단 DeviceManager: 선택된 유저만으로 자동 표시 */}
      <div ref={deviceSectionRef} className="mt-8 space-y-3">
        <h2 className="text-xl font-bold">사용자 기기 관리</h2>
        <DeviceManager selectedUser={selectedUser} />
      </div>
    </div>
  );
}
