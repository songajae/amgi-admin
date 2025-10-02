// src/components/users/UserAddModal.jsx
// 역할: 새로운 유저 추가 팝업창 (이름, 이메일, 보유 팩 선택: "팩 단위")

import { useEffect, useMemo, useRef, useState } from "react";
import PackSelector from "./PackSelector";

export default function UserAddModal({
  packs = [],          // [{id, language, name, type}]
  anchorRect,
  onClose,
  onSave,
  yOffset = 8,
}) {
  const modalRef = useRef(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [selectedPackIds, setSelectedPackIds] = useState([]); // packId[]

  const style = useMemo(() => {
    if (!anchorRect) {
      return {
        position: "fixed",
        top: "15%",
        left: "50%",
        transform: "translateX(-50%)",
      };
    }
    return {
      position: "fixed",
      top: anchorRect.bottom + yOffset,
      left: Math.min(Math.max(12, anchorRect.left), window.innerWidth - 700),
    };
  }, [anchorRect, yOffset]);

  useEffect(() => {
    const handler = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const validateEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const submit = () => {
    if (!name.trim()) return alert("이름을 입력하세요.");
    if (!email.trim()) return alert("이메일을 입력하세요.");
    if (!validateEmail(email)) {
      setEmailError("이메일 형식이 올바르지 않습니다.");
      return;
    }
    setEmailError("");
    onSave({
      name: name.trim(),
      email: email.trim(),
      packs: selectedPackIds, // packId[]
    });
    onClose();
  };

  return (
    <div className="z-50" style={style} role="dialog" aria-modal="true">
      <div ref={modalRef} className="w-[680px] bg-white rounded-lg shadow-xl border">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold">유저 추가</h3>
          <button className="text-gray-500 hover:text-black" onClick={onClose}>✕</button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">이름</label>
            <input
              className="w-full border rounded px-3 py-2"
              placeholder="이름"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">이메일</label>
            <input
              className={`w-full border rounded px-3 py-2 ${emailError ? "border-red-500" : ""}`}
              placeholder="example@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() =>
                setEmailError(email && !validateEmail(email) ? "이메일 형식이 올바르지 않습니다." : "")
              }
            />
            {emailError && <p className="mt-1 text-xs text-red-600">{emailError}</p>}
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">보유 팩</label>
            <PackSelector
              packs={packs}
              value={selectedPackIds}
              onChange={setSelectedPackIds}
              height={280}
            />
          </div>
        </div>

        <div className="px-4 py-3 border-t flex items-center justify-end gap-2">
          <button className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200" onClick={onClose}>취소</button>
          <button className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700" onClick={submit}>저장</button>
        </div>
      </div>
    </div>
  );
}
