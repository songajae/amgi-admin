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

import { useEffect, useLayoutEffect, useRef, useState } from "react";
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
  const [password, setPassword] = useState("1234");

  const modalRef = useRef(null);
  const [positionStyle, setPositionStyle] = useState({});

  const margin = 16; // 여백을 두어 화면에 가리지 않도록 함

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
      setPassword(""); // 수정 시에는 비밀번호를 초기화 (입력 시에만 변경)
    } else {
      setDisplayName("");
      setEmail("");
      setOwned([]);
      setPassword("1234");
    }
  }, [mode, initialUser]);

  useLayoutEffect(() => {
    const updatePosition = () => {
      if (!modalRef.current) return;

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const modalWidth = Math.min(720, viewportWidth - margin * 2);
      const modalHeight = modalRef.current.offsetHeight || 520;

      let left;
      let top;

      if (anchorRect) {
        left = anchorRect.left;
        top = anchorRect.bottom + (yOffset || 0);
      } else {
        left = (viewportWidth - modalWidth) / 2;
        top = (viewportHeight - modalHeight) / 2;
      }

      left = Math.min(
        viewportWidth - margin - modalWidth,
        Math.max(margin, left ?? margin)
      );

      top = Math.min(
        viewportHeight - margin - modalHeight,
        Math.max(margin, top ?? margin)
      );

      setPositionStyle({
        position: "fixed",
        left,
        top,
        width: modalWidth,
        maxHeight: `calc(100vh - ${margin * 2}px)`,
        overflowY: "auto",
        zIndex: 50,
      });
    };
  
    updatePosition();
    window.addEventListener("resize", updatePosition);
    return () => window.removeEventListener("resize", updatePosition);
  }, [anchorRect, yOffset, mode, displayName, email, owned, password]);

  const handleSave = () => {
    const payload = {
      displayName: displayName.trim(),
      email: email.trim(),
      ownedPacks: owned, // 표준 필드로 유지
    };
    const trimmedPassword = password.trim();
    if (mode === "add") {
      payload.password = trimmedPassword || "1234";
    } else if (trimmedPassword) {
      payload.password = trimmedPassword;
    }
    onSave(mode, payload, initialUser?.id);
  };

  return (
    <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose}>
     <div
        ref={modalRef}
        className="bg-white rounded-xl shadow-xl p-5 space-y-4"
        style={positionStyle}
        onClick={(e) => e.stopPropagation()}
      >
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
            <div className="text-sm text-gray-600 mb-1">비밀번호</div>
            <input
              type="password"
              className="border rounded px-3 py-2 w-full"
              placeholder={mode === "add" ? "기본값: 1234" : "변경 시에만 입력"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {mode === "edit" && (
              <p className="mt-1 text-xs text-gray-500">비밀번호를 변경하지 않으려면 비워 두세요.</p>
            )}
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
