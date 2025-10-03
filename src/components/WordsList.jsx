// ==============================
// File: src/components/WordsList.jsx
// Role: 단어 배열을 '단어별로 묶어' 영단어/품사.뜻/예문 형태로 렌더링 + 검색/행수/페이지네이션 UI 제공
// ==============================

import React, { useMemo, useState } from "react";
import PaginationFooter from "./common/PaginationFooter";
import { STRINGS } from "../constants/strings";

export default function WordsList({ words = [], onAdd, onEdit, onDelete }) {
  const [query, setQuery] = useState("");
  const [perPage, setPerPage] = useState(20);
  const [page, setPage] = useState(1);

  // 단어별 그룹핑
  const grouped = useMemo(() => {
    const map = new Map();
    for (const w of words) {
      const key = (w.word || "").trim();
      if (!key) continue;
      const list = map.get(key) || [];
      list.push(w);
      map.set(key, list);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [words]);

  // 검색
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return grouped;
    return grouped.filter(([word, items]) => {
      if (word.toLowerCase().includes(q)) return true;
      return items.some(
        (it) =>
          (it.pos || "").toLowerCase().includes(q) ||
          (it.meaning || "").toLowerCase().includes(q) ||
          (it.example || "").toLowerCase().includes(q)
      );
    });
  }, [grouped, query]);

  // 페이지네이션
  const total = filtered.length;
  const lastPage = Math.max(1, Math.ceil(total / perPage));
  const safePage = Math.min(Math.max(1, page), lastPage);
  const slice = filtered.slice((safePage - 1) * perPage, safePage * perPage);

    return (
    <div className="mt-4 border rounded-md bg-white">
      {/* 헤더 */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between px-4 py-3 border-b">
         <h3 className="font-semibold">{STRINGS.packs.wordsList.title}</h3>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            placeholder={STRINGS.packs.wordsList.searchPlaceholder}
            className="flex-1 md:w-64 border rounded-md px-3 py-1"
          />
          <select
            value={perPage}
            onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}
            className="border rounded-md px-3 py-1"
          >
            {STRINGS.packs.wordsList.perPageOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            onClick={onAdd}
            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
            type="button"
          >
          {STRINGS.common.buttons.add}
          </button>
        </div>
      </div>

      {/* 목록 */}
      {slice.length === 0 ? (
        <div className="px-4 py-8 text-gray-500 text-sm">
          {STRINGS.common.messages.noResults}
        </div>
      ) : (
        <ul className="divide-y">
          {slice.map(([word, items], groupIdx) => {
            const posMeaningLines = items.map((it) =>
              `${it.pos || ""} ${it.meaning || ""}`.trim()
            );
            const examples = Array.from(
              new Set(items.map((it) => (it.example || "").trim()).filter(Boolean))
            );

            return (
              <li key={word} className="px-4 py-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="font-bold text-base mb-1">{word}</div>
                    {posMeaningLines.map((line, i) => (
                      <div key={i} className="text-sm leading-6">{line}</div>
                    ))}
                    {examples.length > 0 && (
                      <div className="text-sm text-gray-600 mt-1">
                        {examples.join(" / ")}
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 flex gap-2">
                    <button
                      className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                      onClick={() => onEdit && onEdit((safePage - 1) * perPage + groupIdx)}
                      type="button"
                    >
                      {STRINGS.common.buttons.edit}
                    </button>
                    <button
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                      onClick={() => onDelete && onDelete((safePage - 1) * perPage + groupIdx)}
                      type="button"
                    >
                      {STRINGS.common.buttons.delete}
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <PaginationFooter
        page={page}
        perPage={perPage}
        total={total}
        onPageChange={setPage}
        className="px-4 py-2 border-t"
      />
    </div>
  );
}
