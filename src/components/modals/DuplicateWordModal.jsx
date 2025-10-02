// ==============================
// File: src/components/modals/DuplicateWordModal.jsx
// Role: CSV 업로드 중 중복 단어 충돌 시, 덮어쓰기/무시 + '동일 선택 계속 적용' 입력 받는 모달
// ==============================

import React, { useState } from "react";

export default function DuplicateWordModal({ word, onChoose, onCancel }) {
  const [applyAll, setApplyAll] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-[360px] rounded-lg shadow-lg p-5">
        <h3 className="text-lg font-semibold mb-3">중복 단어 처리</h3>
        <p className="text-sm text-gray-700 mb-3">
          '<span className="font-semibold">{word}</span>' 단어가 이미 존재합니다. 어떻게 처리할까요?
        </p>

        <label className="flex items-center gap-2 text-sm mb-4 select-none">
          <input
            type="checkbox"
            checked={applyAll}
            onChange={(e) => setApplyAll(e.target.checked)}
          />
          동일한 선택 계속 적용
        </label>

        <div className="flex justify-end gap-2">
          <button className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300" onClick={onCancel}>
            취소
          </button>
          <button
            className="px-3 py-1 rounded bg-yellow-500 text-white hover:bg-yellow-600"
            onClick={() => onChoose("overwrite", applyAll)}
          >
            덮어쓰기
          </button>
          <button
            className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
            onClick={() => onChoose("ignore", applyAll)}
          >
            무시하기
          </button>
        </div>
      </div>
    </div>
  );
}
