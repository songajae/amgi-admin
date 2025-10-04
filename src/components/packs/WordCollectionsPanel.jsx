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

  return [word.word, word.pos, word.meaning, word.example, word.exampleMeaning]
    .map((value) => (value || "").toLowerCase())
    .some((value) => value.includes(target));
}

function aggregateWordEntries(entries = [], fallbackWordLabel = "") {
  const map = new Map();

  entries.forEach((entry, index) => {
    const trimmedWord = (entry.word || "").trim();
    const mapKey = trimmedWord.toLowerCase() || `__entry-${index}`;

    if (!map.has(mapKey)) {
      map.set(mapKey, {
        key: mapKey,
        word: trimmedWord || fallbackWordLabel,
        senses: [],
      });
    }

    const target = map.get(mapKey);
    target.senses.push({
      pos: entry.pos || "",
      meaning: entry.meaning || "",
      example: entry.example || "",
      exampleMeaning: entry.exampleMeaning || "",
      __index: typeof entry.__index === "number" ? entry.__index : index,
    });
  });

  return Array.from(map.values());
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
    // ✅ 검색된 단어를 미리 집계해 중복 단어도 1건으로 계산하도록 보강
    return groups
      .map((group) => {
        const words = Array.isArray(group.words) ? group.words : [];
        const filteredWords = words.filter((word) => matchesQuery(word, query));
        const aggregatedWords = aggregateWordEntries(
          filteredWords,
          STRINGS.packs.wordsPanel.labels.unknown
        );

        return { ...group, filteredWords, aggregatedWords };
      })
      .filter((group) => group.aggregatedWords.length > 0 || group.key === activeGroupKey);
  }, [groups, query, activeGroupKey]);

  const totalWords = useMemo(
    () =>
      filteredGroups.reduce(
        (sum, group) => sum + (Array.isArray(group.aggregatedWords) ? group.aggregatedWords.length : 0),
        0
      ),
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
              const isActiveGroup = activeGroupKey ? group.key === activeGroupKey : true;

              return (
                <article key={group.key} className="mb-8 last:mb-0">
                  <div className="flex flex-col gap-4 lg:flex-row">
                    <aside className="shrink-0 rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-50 p-4 text-sm leading-6 text-blue-900 shadow-inner lg:w-64">
                      <dl className="space-y-2">
                        <div>
                          <dt className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                            {STRINGS.packs.wordsPanel.labels.language}
                          </dt>
                          <dd className="text-base font-semibold text-blue-950">
                            {group.language || STRINGS.packs.wordsPanel.labels.unknown}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            {STRINGS.packs.wordsPanel.labels.pack}
                          </dt>
                          <dd className="text-base font-semibold text-blue-950">
                            {group.packName || STRINGS.packs.wordsPanel.labels.unknown}
                          </dd>
                        </div>
                        <div>
                         <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            {STRINGS.packs.wordsPanel.labels.chapter}
                          </dt>
                          <dd className="text-base font-semibold text-blue-950">
                            {group.chapterNumber ? (
                              <>
                                <span className="block text-sm font-semibold uppercase tracking-wide text-blue-700">
                                  챕터 {group.chapterNumber}.
                                </span>
                                <span className="mt-1 block text-base font-semibold text-blue-950">
                                  {group.chapterTitle || STRINGS.packs.wordsPanel.labels.unknown}
                                </span>
                              </>
                            ) : (
                              group.chapterTitle || STRINGS.packs.wordsPanel.labels.unknown
                            )}
                          </dd>
                        </div>
                      </dl>
                    </aside>

                    <div className="flex-1">
                      {group.aggregatedWords.length === 0 ? (
                        <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
                          {STRINGS.packs.wordsPanel.emptyMessage}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                          {group.aggregatedWords.map((word, index) => {
                            const cardKey = `${group.key}-${word.key || index}`;
                            return (
                              <div
                                key={cardKey}
                                className="flex h-full flex-col justify-between rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-300 hover:shadow-md"
                              >
                                <div className="space-y-3 text-sm text-slate-700">
                                  {word.senses.map((sense, senseIndex) => {
                                    const line = [sense.pos, sense.meaning].filter(Boolean).join(" ").trim();

                                    return (
                                      <div key={`${cardKey}-sense-${senseIndex}`} className="space-y-2">
                                        <div className="flex items-start justify-between gap-3">
                                          <p className="whitespace-pre-line">
                                            {senseIndex === 0 ? (
                                              <>
                                                <span className="font-semibold text-slate-900">{word.word}</span>
                                                {line && <span>{` ${line}`}</span>}
                                              </>
                                            ) : (
                                              <span>{line}</span>
                                            )}
                                          </p>

                                          {isActiveGroup && typeof sense.__index === "number" && (
                                            <div className="flex shrink-0 gap-2">
                                              <button
                                                type="button"
                                                  onClick={() =>
                                                  onEdit?.({
                                                    index: sense.__index,
                                                    packId: group.packId,
                                                    chapterId: group.chapterId,
                                                    word: word.word,
                                                    sense,
                                                  })
                                                }
                                                className="rounded-md bg-yellow-500 px-3 py-1 text-xs font-semibold text-white hover:bg-yellow-600"
                                              >
                                                {STRINGS.common.buttons.edit}
                                              </button>
                                              <button
                                                type="button"
                                                  onClick={() =>
                                                  onDelete?.({
                                                    index: sense.__index,
                                                    packId: group.packId,
                                                    chapterId: group.chapterId,
                                                    word: word.word,
                                                    sense,
                                                  })

                                                }
      
                                                className="rounded-md bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700"
                                              >
                                                {STRINGS.common.buttons.delete}
                                              </button>
                                            </div>
                                          )}
                                        </div>

                                        {(sense.example || sense.exampleMeaning) && (
                                          <div className="space-y-2 rounded-md bg-slate-50 p-3 text-xs text-slate-600">
                                            {sense.example && (
                                              <p className="text-slate-700">
                                                <strong>{sense.example}</strong>
                                              </p>
                                            )}
                                            {sense.exampleMeaning && <p>{sense.exampleMeaning}</p>}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
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
      chapterNumber: PropTypes.number,
      words: PropTypes.arrayOf(
        PropTypes.shape({
          word: PropTypes.string,
          pos: PropTypes.string,
          meaning: PropTypes.string,
          example: PropTypes.string,
          __index: PropTypes.number,
          exampleMeaning: PropTypes.string,
        })
      ),
    })
  ),
  activeGroupKey: PropTypes.string,
  onAdd: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
};