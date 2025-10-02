// src/components/users/UserEditorModal.jsx
// 역할: 유저(이름/이메일/보유 팩) 추가/수정 모달. 이메일 형식 검증 및 다중 팩 선택 지원.

import { useEffect, useMemo, useState } from "react";

const emailRegex =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // 간단하고 안전한 기본 검증

export default function UserEditorModal({
  open,
  title = "유저 추가",
  packs = [],                // [{id, name, language, type}]
  initial,                   // { id?, name, email, packs: [packId, ...] }
  onSave,                    // async ({name, email, packs}) => void
  onClose,
}) {
  const [name, setName] = useState(initial?.name || "");
  const [email, setEmail] = useState(initial?.email || "");
  const [selectedPackIds, setSelectedPackIds] = useState(initial?.packs || []);
  const emailValid = useMemo(() => emailRegex.test(email.trim()), [email]);

  useEffect(() => {
    if (!open) return;
    setName(initial?.name || "");
    setEmail(initial?.email || "");
    setSelectedPackIds(Array.isArray(initial?.packs) ? initial.packs : []);
  }, [open, initial]);

  const togglePack = (pid) =>
    setSelectedPackIds((prev) =>
      prev.includes(pid) ? prev.filter((x) => x !== pid) : [...prev, pid]
    );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-[420px] rounded-xl shadow-2xl p-5">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>

        {/* 이름 */}
        <label className="block text-sm font-medium mb-1">이름</label>
        <input
          className="w-full border rounded px-3 py-2 mb-3"
          placeholder="이름"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {/* 이메일 */}
        <label className="block text-sm font-medium mb-1">이메일</label>
        <input
          className={`w-full border rounded px-3 py-2 ${
            email.length && !emailValid ? "border-red-500" : ""
          }`}
          placeholder="example@mail.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {email.length > 0 && !emailValid && (
          <p className="mt-1 text-xs text-red-600">
            올바른 이메일 형식이 아닙니다.
          </p>
        )}

        {/* 보유 팩 선택 */}
        <label className="block text-sm font-medium mt-4 mb-2">보유 팩</label>
        <div className="max-h-44 overflow-auto border rounded p-2 space-y-1">
          {packs.length === 0 ? (
            <p className="text-sm text-gray-500 px-1">등록된 언어팩이 없습니다.</p>
          ) : (
            packs.map((p) => {
              const checked = selectedPackIds.includes(p.id);
              return (
                <label
                  key={p.id}
                  className="flex items-center gap-2 px-1 py-1 cursor-pointer hover:bg-gray-50 rounded"
                >
                  <input
                    type="checkbox"
                    className="accent-blue-600"
                    checked={checked}
                    onChange={() => togglePack(p.id)}
                  />
                  <span className="text-sm">
                    {p.name} <span className="text-gray-500">/ {p.language}</span>{" "}
                    <span className="text-xs text-gray-500">({p.type || "free"})</span>
                  </span>
                </label>
              );
            })
          )}
        </div>

        {/* 액션 */}
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
            onClick={onClose}
          >
            취소
          </button>
          <button
            type="button"
            className={`px-3 py-1 rounded text-white ${
              name.trim() && emailValid
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-blue-300 cursor-not-allowed"
            }`}
            disabled={!name.trim() || !emailValid}
            onClick={() =>
              onSave?.({
                name: name.trim(),
                email: email.trim(),
                packs: selectedPackIds,
              })
            }
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
