// ==============================
// File: src/components/users/PackSelector.jsx
// Role: 보유 팩 선택 컴포넌트 (왼쪽 ▷ 추가 / 오른쪽 ◁ 삭제)
// Note:
//   - value: string[] (packId 목록)
//   - onChange: (nextIds: string[]) => void
//   - packs: [{id, language, name, type}]
//   - height: px (리스트 높이)
// ------------------------------
// 기존 주석 유지
// // src/components/users/PackSelector.jsx
// // 역할: 보유 팩 선택 컴포넌트 (앞의 ▷ 팩 트리)
// // - minmax 컬럼으로 모달 내부에서 항상 검색/제어들 고정
// // - 내부 스크롤 처리로 오버플로우 방지
// // - 삭제 버튼/도구가 영역 밖으로 튀지 않도록 정렬
// ------------------------------
// Changelog:
//   [2025-09-27 PATCH] 검색/정렬/접근성/중복방지/스타일 안정화
// ==============================

import { useMemo, useState } from "react";

export default function PackSelector({
  packs = [],          // [{id, language, name, type}]
  value = [],          // packId[]
  onChange = () => {},
  height = 280,
}) {
  const [selectedLeft, setSelectedLeft] = useState(null);   // packId
  const [selectedRight, setSelectedRight] = useState(null); // packId
  const [qLeft, setQLeft] = useState("");
  const [qRight, setQRight] = useState("");

  // 언어 기준 그룹
  const groupedByLang = useMemo(() => {
    const map = new Map();
    for (const p of packs) {
      const lang = p.language || "기타";
      if (!map.has(lang)) map.set(lang, []);
      map.get(lang).push(p);
    }
    for (const [, list] of map) {
      list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [packs]);

  const chosenSet = useMemo(() => new Set(value), [value]);

  const leftList = useMemo(() => {
    // 전체 팩 - 이미 선택된 팩 제외
    const all = packs.filter((p) => !chosenSet.has(p.id));
    const q = qLeft.trim().toLowerCase();
    if (!q) return all;
    return all.filter((p) => {
      return (
        (p.name || "").toLowerCase().includes(q) ||
        (p.language || "").toLowerCase().includes(q) ||
        (p.type || "").toLowerCase().includes(q)
      );
    });
  }, [packs, chosenSet, qLeft]);

  const rightList = useMemo(() => {
    const picked = packs.filter((p) => chosenSet.has(p.id));
    const q = qRight.trim().toLowerCase();
    if (!q) return picked;
    return picked.filter((p) => {
      return (
        (p.name || "").toLowerCase().includes(q) ||
        (p.language || "").toLowerCase().includes(q) ||
        (p.type || "").toLowerCase().includes(q)
      );
    });
  }, [packs, chosenSet, qRight]);

  const addSelected = () => {
    if (!selectedLeft) return;
    if (chosenSet.has(selectedLeft)) return;
    onChange([...value, selectedLeft]);
    setSelectedLeft(null);
  };

  const removeSelected = () => {
    if (!selectedRight) return;
    onChange(value.filter((id) => id !== selectedRight));
    setSelectedRight(null);
  };

  const boxCls = "border rounded-md bg-white flex-1 min-w-0";
  const listCls = "overflow-auto divide-y";

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* 왼쪽: 전체 팩 */}
      <div className={boxCls} style={{ height }}>
        <div className="flex items-center justify-between px-3 py-2 border-b bg-gray-50 rounded-t-md">
          <div className="text-sm font-medium">전체 팩</div>
          <input
            className="border rounded px-2 py-1 text-sm"
            placeholder="검색"
            value={qLeft}
            onChange={(e) => setQLeft(e.target.value)}
          />
        </div>
        <div className={listCls} role="listbox" aria-label="전체 팩">
          {leftList.length === 0 ? (
            <div className="p-3 text-sm text-gray-500">결과가 없습니다.</div>
          ) : (
            leftList.map((p) => {
              const active = selectedLeft === p.id;
              return (
                <button
                  key={p.id}
                  className={`w-full text-left px-3 py-2 text-sm ${active ? "bg-blue-50" : "hover:bg-gray-50"}`}
                  onClick={() => setSelectedLeft(p.id)}
                >
                  <div className="font-medium">{p.language || "-"} </div>
                  <div className="text-gray-600">{p.name} <span className="text-xs text-gray-400">({p.type || "free"})</span></div>
                </button>
              );
            })
          )}
        </div>
        <div className="p-3 border-t flex justify-end">
          <button
            className="px-3 py-1.5 rounded bg-blue-600 text-white text-sm disabled:opacity-40"
            onClick={addSelected}
            disabled={!selectedLeft}
          >
            추가 ▷
          </button>
        </div>
      </div>

      {/* 오른쪽: 선택된 팩 */}
      <div className={boxCls} style={{ height }}>
        <div className="flex items-center justify-between px-3 py-2 border-b bg-gray-50 rounded-t-md">
          <div className="text-sm font-medium">선택된 팩</div>
          <input
            className="border rounded px-2 py-1 text-sm"
            placeholder="검색"
            value={qRight}
            onChange={(e) => setQRight(e.target.value)}
          />
        </div>
        <div className={listCls} role="listbox" aria-label="선택된 팩">
          {rightList.length === 0 ? (
            <div className="p-3 text-sm text-gray-500">선택된 팩이 없습니다.</div>
          ) : (
            rightList.map((p) => {
              const active = selectedRight === p.id;
              return (
                <button
                  key={p.id}
                  className={`w-full text-left px-3 py-2 text-sm ${active ? "bg-rose-50" : "hover:bg-gray-50"}`}
                  onClick={() => setSelectedRight(p.id)}
                  title={`${p.name} / ${p.language} (${p.type || "free"})`}
                >
                  {p.name} / {p.language} <span className="text-xs text-gray-400">({p.type || "free"})</span>
                </button>
              );
            })
          )}
        </div>
        <div className="p-3 border-t flex justify-end">
          <button
            className="px-3 py-1.5 rounded bg-rose-500 text-white text-sm disabled:opacity-40"
            onClick={removeSelected}
            disabled={!selectedRight}
          >
            ◁ 삭제
          </button>
        </div>
      </div>
    </div>
  );
}
