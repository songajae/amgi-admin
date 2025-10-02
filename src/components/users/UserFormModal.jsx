// ==============================
// File: src/components/users/UserFormModal.jsx
// Role: 유저 추가/수정 모달 (이름/이메일 + 보유 팩 선택)
// Note:
//   - mode: 'add' | 'edit'
//   - initialUser: 편집 시 { id, displayName, email, ownedPacks? }
//   - packs: 전체 팩 목록
//   - onSave(mode, payload, idWhenEdit)
// ------------------------------
// Changelog:
//   [2025-09-27 PATCH] 저장 시 users + user_purchases(또는 users.ownedPacks) 동기화
//   [2025-09-27 PATCH] 초기값/레이아웃/버튼 정리
// ==============================

import { useEffect, useMemo, useState } from "react";
import PackSelector from "./PackSelector";

export default function UserFormModal({
  mode = "add",
  initialUser = null,
  packs = [],
  anchorRect = null,
  onClose = () => {},
  onSave = () => {},
  yOffset = 8,
}) {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [owned, setOwned] = useState([]); // packId[]

  useEffect(() => {
    if (mode === "edit" && initialUser) {
      setDisplayName(initialUser.displayName || initialUser.name || "");
      setEmail(initialUser.email || "");
      const ids =
        initialUser.ownedPacks ||
        initialUser.ownedPackIds ||
        initialUser.packs ||
        initialUser.purchased_packs ||
        [];
      setOwned(Array.isArray(ids) ? ids : []);
    } else {
      setDisplayName("");
      setEmail("");
      setOwned([]);
    }
  }, [mode, initialUser]);

  const style = useMemo(() => {
    if (!anchorRect) return {};
    return {
      position: "fixed",
      left: Math.min(window.innerWidth - 720, Math.max(16, anchorRect.left)),
      top: Math.min(window.innerHeight - 520, Math.max(16, anchorRect.bottom + (yOffset || 0))),
      width: 720,
      zIndex: 50,
    };
  }, [anchorRect, yOffset]);

  const handleSave = () => {
    const payload = {
      displayName: displayName.trim(),
      email: email.trim(),
      ownedPacks: owned, // 표준 필드로 유지
    };
    onSave(mode, payload, initialUser?.id);
  };

  return (
    <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl p-5 space-y-4" style={style} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold">{mode === "add" ? "유저 추가" : "유저 수정"}</div>
          <button className="text-gray-500 hover:text-black" onClick={onClose}>✕</button>
        </div>

        {/* 폼 */}
        <div className="space-y-3">
          <div>
            <div className="text-sm text-gray-600 mb-1">이름</div>
            <input
              className="border rounded px-3 py-2 w-full"
              placeholder="이름"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">이메일</div>
            <input
              className="border rounded px-3 py-2 w-full"
              placeholder="이메일"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <div className="text-sm text-gray-600 mb-2">보유 팩</div>
            <PackSelector packs={packs} value={owned} onChange={setOwned} height={260} />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button className="px-4 py-2 rounded border" onClick={onClose}>취소</button>
          <button className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700" onClick={handleSave}>
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
