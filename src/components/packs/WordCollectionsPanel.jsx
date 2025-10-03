// ==============================
// File: src/components/packs/WordCollectionsPanel.jsx
// Role: 언어/언어팩/챕터별 단어 그룹을 카드형 레이아웃(최대 3열)으로 표시 + 검색 및 액션 버튼 제공
// ==============================

import { useMemo, useState } from "react";
import PropTypes from "prop-types";

import { STRINGS } from "../../constants/strings";

function matchesQuery(word, query) {
  if (!query) return true;
  const target = query.trim().toLowerCase();
  if (!target) return true;

  return [word.word, word.pos, word.meaning, word.example]
    .map((value) => (value || "").toLowerCase())
    .some((value) => value.includes(target));
}

export default function WordCollectionsPanel({
  groups = [],
  activeGroupKey = "",
  onAdd,
  onEdit,
  onDelete,
}) {
  const [query, setQuery] = useState("");

  const filteredGroups = useMemo(() => {
    return groups
      .map((group) => {
        const words = Array.isArray(group.words) ? group.words : [];
        const filteredWords = words.filter((word) => matchesQuery(word, query));
        return { ...group, filteredWords };
      })
      .filter((group) => group.filteredWords.length > 0 || group.key === activeGroupKey);
  }, [groups, query, activeGroupKey]);

  const totalWords = useMemo(
    () => filteredGroups.reduce((sum, group) => sum + group.filteredWords.length, 0),
    [filteredGroups]
  );

  return (
    <section className="mt-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            {STRINGS.packs.wordsPanel.title}
          </h3>
          <p className="text-sm text-slate-500">
            {STRINGS.packs.wordsPanel.totalLabel(totalWords)}
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={STRINGS.packs.wordsPanel.searchPlaceholder}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:w-64"
          />
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
          >
            {STRINGS.common.buttons.add}
          </button>
        </div>
      </header>

      <div className="mt-4 h-[560px] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="h-full overflow-y-auto overflow-x-hidden p-4">
          {filteredGroups.length === 0 ? (
            <p className="py-24 text-center text-sm text-slate-500">
              {STRINGS.common.messages.noResults}
            </p>
          ) : (
            filteredGroups.map((group) => {
              const isActiveGroup = group.key === activeGroupKey;

              return (
                <article key={group.key} className="mb-8 last:mb-0">
                  <div className="flex flex-col gap-4 lg:flex-row">
                    <aside className="shrink-0 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700 lg:w-64">
                      <dl className="space-y-2">
                        <div>
                          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            {STRINGS.packs.wordsPanel.labels.language}
                          </dt>
                          <dd className="text-base font-semibold text-slate-900">
                            {group.language || STRINGS.packs.wordsPanel.labels.unknown}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            {STRINGS.packs.wordsPanel.labels.pack}
                          </dt>
                          <dd className="text-base font-medium text-slate-900">
                            {group.packName || STRINGS.packs.wordsPanel.labels.unknown}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            {STRINGS.packs.wordsPanel.labels.chapter}
                          </dt>
                          <dd className="text-base font-medium text-slate-900">
                            {group.chapterTitle || STRINGS.packs.wordsPanel.labels.unknown}
                          </dd>
                        </div>
                      </dl>
                    </aside>

                    <div className="flex-1">
                      {group.filteredWords.length === 0 ? (
                        <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
                          {STRINGS.packs.wordsPanel.emptyMessage}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                          {group.filteredWords.map((word, index) => {
                            const cardKey = `${group.key}-${word.__index ?? index}`;
                            return (
                              <div
                                key={cardKey}
                                className="flex h-full flex-col justify-between rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-300 hover:shadow-md"
                              >
                                <div className="mb-3 flex items-start justify-between gap-3">
                                  <div>
                                    <h4 className="text-base font-semibold text-slate-900">{word.word}</h4>
                                    {word.pos && (
                                      <p className="text-xs font-medium uppercase tracking-wide text-blue-600">
                                        {word.pos}
                                      </p>
                                    )}
                                  </div>

                                  {isActiveGroup && typeof word.__index === "number" && (
                                    <div className="flex shrink-0 gap-2">
                                      <button
                                        type="button"
                                        onClick={() => onEdit?.(word.__index)}
                                        className="rounded-md bg-yellow-500 px-3 py-1 text-xs font-semibold text-white hover:bg-yellow-600"
                                      >
                                        {STRINGS.common.buttons.edit}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => onDelete?.(word.__index)}
                                        className="rounded-md bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700"
                                      >
                                        {STRINGS.common.buttons.delete}
                                      </button>
                                    </div>
                                  )}
                                </div>

                                <div className="space-y-2 text-sm text-slate-700">
                                  {word.meaning && <p className="whitespace-pre-line">{word.meaning}</p>}
                                  {word.example && (
                                    <p className="rounded-md bg-slate-50 p-3 text-xs text-slate-600">
                                      {word.example}
                                    </p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}

WordCollectionsPanel.propTypes = {
  groups: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      language: PropTypes.string,
      packId: PropTypes.string,
      packName: PropTypes.string,
      chapterId: PropTypes.string,
      chapterTitle: PropTypes.string,
      words: PropTypes.arrayOf(
        PropTypes.shape({
          word: PropTypes.string,
          pos: PropTypes.string,
          meaning: PropTypes.string,
          example: PropTypes.string,
          __index: PropTypes.number,
        })
      ),
    })
  ),
  activeGroupKey: PropTypes.string,
  onAdd: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
};