// ==============================
// File: src/pages/PacksPage.jsx
// Role: 언어 > 언어팩 > 챕터 > 단어 관리 + CSV 업로드(팩: 덮어쓰기/뒤에 추가, 챕터: 중복 단어 모달)
//       + 단어 리스트 검색/행수/페이지네이션 표시
//       + [요구 반영] 칩 재클릭 시 선택 해제 / 아무것도 선택 안 하면 전체 단어 표시
// ==============================

import { useEffect, useMemo, useRef, useState } from "react";

import LoadingBar from "../components/LoadingBar";
import LevelBar from "../components/packs/LevelBar";
import SelectChips from "../components/packs/SelectChips";
import WordsList from "../components/WordsList";
import PackSampleCsvButton from "../components/samples/PackSampleCsvButton";
import ChapterSampleCsvButton from "../components/samples/ChapterSampleCsvButton";
import DuplicateWordModal from "../components/modals/DuplicateWordModal";

import {
  getWordPacks, addWordPack, updateWordPack, deleteWordPack,
  getChaptersByPack, upsertChapter, deleteChapter
} from "../lib/firestore";

/* ===== utils ===== */
function wordsObjectToArray(wordsObj = {}) {
  const arr = [];
  for (const word of Object.keys(wordsObj)) {
    const entries = Array.isArray(wordsObj[word]) ? wordsObj[word] : [];
    for (const e of entries) {
      arr.push({
        word,
        pos: e.pos || "",
        meaning: e.meaning || "",
        example: e.example || ""
      });
    }
  }
  return arr;
}
function wordsArrayToObject(wordsArr = []) {
  const obj = {};
  for (const w of wordsArr) {
    const key = (w.word || "").trim();
    if (!key) continue;
    if (!obj[key]) obj[key] = [];
    obj[key].push({ pos: w.pos || "", meaning: w.meaning || "", example: w.example || "" });
  }
  return obj;
}
function parseCSV(text) {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => l.split(",").map((s) => s.trim()));
}
function ensureHeaders(header, required) {
  if (!header || header.length === 0) return false;
  const lower = header.map((h) => h.toLowerCase());
  return required.every((r) => lower.includes(r));
}
function idxOf(header, name) {
  return header.map((h) => h.toLowerCase()).indexOf(name);
}

export default function PacksPage() {
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chaptersByPack, setChaptersByPack] = useState({});

  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [selectedPackId, setSelectedPackId] = useState("");
  const [selectedChapter, setSelectedChapter] = useState("");

  // 파일 입력 ref
  const packCsvRef = useRef(null);
  const chapterCsvRef = useRef(null);

  // 언어팩 업로드 모드 선택 모달
  const [pendingPackGrouped, setPendingPackGrouped] = useState(null);
  const [showPackUploadMode, setShowPackUploadMode] = useState(false);

  // 챕터 업로드 중복 단어 모달
  const [dupWord, setDupWord] = useState(null);
  const dupResolverRef = useRef(null);
  const applyChoiceRef = useRef(null); // 'overwrite' | 'ignore' | null

  /* -----------------------------------------------------------
   * 초기 로드: 모든 팩과 각 팩의 챕터까지 미리 로드
   *  - 아무것도 선택 안 했을 때 전체 단어를 보이게 하기 위함
   * --------------------------------------------------------- */
  const fetchPacks = async () => {
    setLoading(true);
    const list = await getWordPacks();
    setPacks(list);

    const next = {};
    for (const p of list) {
      try {
        next[p.id] = await getChaptersByPack(p.id);
      } catch (e) {
        console.error("getChaptersByPack error:", e);
        next[p.id] = [];
      }
    }
    setChaptersByPack(next);
    setLoading(false);
  };
  useEffect(() => { fetchPacks(); }, []);

  /* 언어 칩 라벨 */
  const languages = useMemo(() => {
    const counts = {};
    for (const p of packs) counts[p.language] = (counts[p.language] || 0) + 1;
    return Object.keys(counts).map((lang) => ({ id: lang, label: `${lang} (${counts[lang]})` }));
  }, [packs]);

  /* 선택 언어 변경 → 언어팩, 챕터 초기화 */
  useEffect(() => {
    if (!selectedLanguage) { setSelectedPackId(""); setSelectedChapter(""); return; }
    const first = packs.find((p) => p.language === selectedLanguage);
    setSelectedPackId(first?.id || "");
  }, [selectedLanguage, packs]);

  const packsOfLanguage = useMemo(
    () => packs.filter((p) => p.language === selectedLanguage),
    [packs, selectedLanguage]
  );

  /* 선택 언어가 있을 때만(초기 전체 로딩과 중복 방지) 해당 언어의 챕터 보강 로드 */
  useEffect(() => {
    (async () => {
      if (!selectedLanguage) return;
      if (!packsOfLanguage.length) return;
      const next = { ...chaptersByPack };
      for (const p of packsOfLanguage) {
        if (!next[p.id]) next[p.id] = await getChaptersByPack(p.id);
      }
      setChaptersByPack(next);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [packsOfLanguage.map((p) => p.id).join(",")]);

  /* 선택 팩이 바뀌면 해당 팩의 챕터 최신화 + 첫 챕터 선택 */
  useEffect(() => {
    (async () => {
      if (!selectedPackId) { setSelectedChapter(""); return; }
      const list = await getChaptersByPack(selectedPackId);
      setChaptersByPack((prev) => ({ ...prev, [selectedPackId]: list }));
      setSelectedChapter(list[0]?.chapter || "");
    })();
  }, [selectedPackId]);

  const chapters = chaptersByPack[selectedPackId] || [];
  const selectedPack = packs.find((p) => p.id === selectedPackId) || null;
  const currentChapter = chapters.find((c) => c.chapter === selectedChapter) || null;

  /* -----------------------------------------------------------
   * 단어 목록 계산
   *  - 챕터 선택 시: 해당 챕터 단어
   *  - 아무것도 선택 안 함: 전체 팩/전체 챕터 단어
   *  - 그 외(언어만/팩만 선택 등): 선택된 챕터가 없으면 빈 배열
   * --------------------------------------------------------- */
  const words = useMemo(() => {
    // 챕터까지 정확히 선택된 경우
    if (selectedLanguage && selectedPackId && selectedChapter) {
      return wordsObjectToArray(currentChapter?.words);
    }

    // 아무것도 선택 안 한 경우: 전체 단어
    if (!selectedLanguage && !selectedPackId && !selectedChapter) {
      const all = [];
      for (const p of packs) {
        const chs = chaptersByPack[p.id] || [];
        for (const c of chs) {
          all.push(...wordsObjectToArray(c?.words || {}));
        }
      }
      return all;
    }

    // 그 외 케이스: 선택 챕터가 있으면 그 단어, 없으면 빈 배열
    if (currentChapter) return wordsObjectToArray(currentChapter.words);
    return [];
  }, [
    selectedLanguage,
    selectedPackId,
    currentChapter,
    selectedChapter,
    packs,
    chaptersByPack,
  ]);

  /* -----------------------------------------------------------
   * 칩 onChange: 재클릭 시 선택 해제
   * --------------------------------------------------------- */
  const onChangeLanguage = (id) => {
    setSelectedLanguage((prev) => (prev === id ? "" : id));
    setSelectedPackId("");
    setSelectedChapter("");
  };
  const onChangePack = (id) => {
    setSelectedPackId((prev) => (prev === id ? "" : id));
    setSelectedChapter("");
  };
  const onChangeChapter = (id) => {
    setSelectedChapter((prev) => (prev === id ? "" : id));
  };

  /* ===== 언어 액션들 ===== */
  const handleAddLanguage = async () => {
    const language = prompt("추가할 언어(예: 영어, 일본어 등)");
    if (!language) return;
    const name = prompt("초기 언어팩 이름", "기본팩") || "기본팩";
    const type = prompt('타입(예: "free"/"paid")', "free") || "free";
    await addWordPack({ language, name, type });
    setSelectedLanguage(language);
    await fetchPacks();
  };
  const handleEditLanguage = async () => {
    if (!selectedLanguage) return alert("언어를 선택하세요.");
    const newLang = prompt("언어 이름 변경", selectedLanguage);
    if (!newLang || newLang === selectedLanguage) return;
    const targets = packs.filter((p) => p.language === selectedLanguage);
    for (const t of targets) await updateWordPack(t.id, { language: newLang });
    setSelectedLanguage(newLang);
    await fetchPacks();
  };
  const handleDeleteLanguage = async () => {
    if (!selectedLanguage) return alert("언어를 선택하세요.");
    const targets = packs.filter((p) => p.language === selectedLanguage);
    if (!window.confirm(`"${selectedLanguage}" 언어의 언어팩 ${targets.length}개를 모두 삭제할까요?`)) return;
    for (const t of targets) await deleteWordPack(t.id);
    setSelectedLanguage("");
    setSelectedPackId("");
    setSelectedChapter("");
    await fetchPacks();
  };

  /* ===== 언어팩 액션 ===== */
  const handleAddPack = async () => {
    if (!selectedLanguage) return alert("먼저 언어를 선택하세요.");
    const name = prompt("언어팩 이름");
    if (!name) return;
    const type = prompt('타입(예: "free"/"paid")', "free") || "free";
    const created = await addWordPack({ language: selectedLanguage, name, type });
    setSelectedPackId(created.id);
    await fetchPacks();
  };
  const handleEditPack = async () => {
    if (!selectedPack) return alert("언어팩을 선택하세요.");
    const name = prompt("언어팩 이름 변경", selectedPack.name) || selectedPack.name;
    const type = prompt('타입 변경(예: "free"/"paid")', selectedPack.type || "free") || selectedPack.type;
    await updateWordPack(selectedPack.id, { name, type });
    await fetchPacks();
  };
  const handleDeletePack = async () => {
    if (!selectedPack) return alert("언어팩을 선택하세요.");
    if (!window.confirm(`"${selectedPack.name}" 언어팩을 삭제할까요?`)) return;
    await deleteWordPack(selectedPack.id);
    setSelectedPackId("");
    setSelectedChapter("");
    await fetchPacks();
  };

  /* ===== 챕터 액션 ===== */
  const handleAddChapter = async () => {
    if (!selectedPack) return alert("언어팩을 선택하세요.");
    const chapter = prompt("챕터 ID(예: ch1)");
    if (!chapter) return;
    const title = prompt("챕터 제목", chapter) || chapter;
    await upsertChapter(selectedPack.id, chapter, { title, words: {} });
    const list = await getChaptersByPack(selectedPack.id);
    setChaptersByPack((prev) => ({ ...prev, [selectedPack.id]: list }));
    setSelectedChapter(chapter);
  };
  const handleEditChapter = async () => {
    if (!selectedPack || !selectedChapter) return alert("챕터를 선택하세요.");
    const current = chapters.find((c) => c.chapter === selectedChapter);
    const newTitle = prompt("챕터 제목 변경", current?.title || selectedChapter) || current?.title;
    await upsertChapter(selectedPack.id, selectedChapter, { title: newTitle, words: current?.words || {} });
    const list = await getChaptersByPack(selectedPack.id);
    setChaptersByPack((prev) => ({ ...prev, [selectedPack.id]: list }));
  };
  const handleDeleteChapter = async () => {
    if (!selectedChapter) return alert("챕터를 선택하세요.");
    if (!window.confirm(`챕터 "${selectedChapter}" 를 삭제할까요?`)) return;
    await deleteChapter(selectedPack.id, selectedChapter); // ✅ 2025-09-27: packId 인자 추가
    const list = await getChaptersByPack(selectedPack.id);
    setChaptersByPack((prev) => ({ ...prev, [selectedPack.id]: list }));
    setSelectedChapter(list[0]?.chapter || "");
  };

  /* ===== 단어 액션 ===== */
  const handleAddWord = async () => {
    if (!selectedPack || !selectedChapter) return alert("챕터를 선택하세요.");
    const word = prompt("단어");
    if (!word) return;
    const pos = prompt("품사", "n.") || "";
    const meaning = prompt("뜻") || "";
    const example = prompt("예문(선택)") || "";
    const current = chapters.find((c) => c.chapter === selectedChapter);
    const arr = wordsObjectToArray(current?.words || []);
    arr.push({ word, pos, meaning, example });
    await upsertChapter(selectedPack.id, selectedChapter, {
      title: current?.title || selectedChapter,
      words: wordsArrayToObject(arr),
    });
    const list = await getChaptersByPack(selectedPack.id);
    setChaptersByPack((prev) => ({ ...prev, [selectedPack.id]: list }));
  };
  const handleEditWord = async (idx) => {
    if (!selectedPack || !selectedChapter) return;
    const current = chapters.find((c) => c.chapter === selectedChapter);
    const arr = wordsObjectToArray(current?.words || []);
    const w = arr[idx];
    if (!w) return;
    const word = prompt("단어", w.word) || w.word;
    const pos = prompt("품사", w.pos || "") || w.pos;
    const meaning = prompt("뜻", w.meaning || "") || w.meaning;
    const example = prompt("예문", w.example || "") || w.example;
    arr[idx] = { word, pos, meaning, example };
     await upsertChapter(selectedPack.id, selectedChapter, {
      title: current?.title || selectedChapter,
      words: wordsArrayToObject(arr),
    });
    const list = await getChaptersByPack(selectedPack.id);
    setChaptersByPack((prev) => ({ ...prev, [selectedPack.id]: list }));
  };
  const handleDeleteWord = async (idx) => {
    if (!selectedPack || !selectedChapter) return;
    if (!window.confirm("이 단어를 삭제할까요?")) return;
    const current = chapters.find((c) => c.chapter === selectedChapter);
    const arr = wordsObjectToArray(current?.words || []);
    arr.splice(idx, 1);
    await upsertChapter(selectedPack.id, selectedChapter, {
      title: current?.title || selectedChapter,
      words: wordsArrayToObject(arr),
    });
    const list = await getChaptersByPack(selectedPack.id);
    setChaptersByPack((prev) => ({ ...prev, [selectedPack.id]: list }));
  };

  /* ===== 언어팩 CSV: 모드 선택 모달 + 적용 ===== */
  const openPackCsv = () => packCsvRef.current?.click();

  const onPackCsvSelected = async (e) => {
    try {
      if (!selectedPack) return alert("먼저 언어팩을 선택하세요.");
      const file = e.target.files?.[0];
      if (!file) return;

      const text = await file.text();
      const rows = parseCSV(text);
      if (rows.length === 0) return alert("CSV 파일이 비어있습니다.");

      const [header, ...data] = rows;
      const required = ["chapter", "chaptertitle", "word", "pos", "meaning", "example"];
      if (!ensureHeaders(header, required)) {
        return alert('CSV 헤더가 올바르지 않습니다.\n필수: chapter,chapterTitle,word,pos,meaning,example');
      }
      const cIdx = idxOf(header, "chapter");
      const tIdx = idxOf(header, "chaptertitle");
      const wIdx = idxOf(header, "word");
      const pIdx = idxOf(header, "pos");
      const mIdx = idxOf(header, "meaning");
      const eIdx = idxOf(header, "example");

      const grouped = {};
      for (const r of data) {
        const chapter = r[cIdx];
        const title = (r[tIdx] || chapter)?.trim();
        if (!chapter || !title) continue;
        if (!grouped[chapter]) grouped[chapter] = { title, wordsArr: [] };
        const word = r[wIdx];
        if (word) {
          grouped[chapter].wordsArr.push({
            word, pos: r[pIdx] || "", meaning: r[mIdx] || "", example: r[eIdx] || "",
          });
        }
      }
      if (Object.keys(grouped).length === 0) return alert("업로드할 유효한 행이 없습니다.");

      setPendingPackGrouped(grouped);
      setShowPackUploadMode(true);
    } catch (err) {
      console.error(err);
      alert("CSV 처리 중 오류가 발생했습니다.");
    } finally {
      e.target.value = "";
    }
  };

  const applyPackGrouped = async (mode) => {
    if (!pendingPackGrouped || !selectedPack) return;
    const grouped = pendingPackGrouped;
    setShowPackUploadMode(false);

    if (mode === "overwrite") {
      const existing = await getChaptersByPack(selectedPack.id);
      for (const c of existing) await deleteChapter(selectedPack.id, c.chapter); // ✅ 2025-09-27
      for (const ch of Object.keys(grouped)) {
        const { title, wordsArr } = grouped[ch];
        await upsertChapter(selectedPack.id, ch, { title, words: wordsArrayToObject(wordsArr) });
      }
    } else if (mode === "append") {
      const existing = await getChaptersByPack(selectedPack.id);
      let cursor = existing.length;
      for (const ch of Object.keys(grouped)) {
        cursor += 1;
        const nextChapter = `ch${cursor}`;
        const { title, wordsArr } = grouped[ch];
        await upsertChapter(selectedPack.id, nextChapter, {
          title: title || nextChapter,
          words: wordsArrayToObject(wordsArr),
        });
      }
    }

    const refreshed = await getChaptersByPack(selectedPack.id);
    setChaptersByPack((prev) => ({ ...prev, [selectedPack.id]: refreshed }));
    setSelectedChapter(refreshed[0]?.chapter || "");
    setPendingPackGrouped(null);
  };

  /* ===== 챕터 CSV: 마지막 챕터에 단어 추가 + 중복 단어 모달 ===== */
  const askDuplicate = (word) =>
    new Promise((resolve) => {
      if (applyChoiceRef.current) return resolve({ choice: applyChoiceRef.current, applyAll: true });
      dupResolverRef.current = resolve;
      setDupWord(word);
    });
  const handleDupChoose = (choice, applyAll) => {
    if (applyAll) applyChoiceRef.current = choice;
    const resolver = dupResolverRef.current;
    dupResolverRef.current = null;
    setDupWord(null);
    resolver && resolver({ choice, applyAll });
  };

  const openChapterCsv = () => chapterCsvRef.current?.click();
  const onChapterCsvSelected = async (e) => {
    try {
      if (!selectedPack) return alert("먼저 언어팩을 선택하세요.");
      const file = e.target.files?.[0];
      if (!file) return;

      const text = await file.text();
      const rows = parseCSV(text);
      if (rows.length === 0) return alert("CSV 파일이 비어있습니다.");

      const [header, ...data] = rows;
      const required = ["chapter", "chaptertitle", "word", "pos", "meaning", "example"];
      if (!ensureHeaders(header, required)) {
        return alert('CSV 헤더가 올바르지 않습니다.\n필수: chapter,chapterTitle,word,pos,meaning,example');
      }
      const wIdx = idxOf(header, "word");
      const pIdx = idxOf(header, "pos");
      const mIdx = idxOf(header, "meaning");
      const eIdx = idxOf(header, "example");

      const current = await getChaptersByPack(selectedPack.id);
      if (current.length === 0) return alert("먼저 최소 1개의 챕터를 만들어 주세요.");
      const last = current[current.length - 1];
      const baseArr = wordsObjectToArray(last.words || []);
      const byWord = new Map(baseArr.map((w) => [(w.word || "").trim(), true]));

      for (const r of data) {
        const word = (r[wIdx] || "").trim();
        if (!word) continue;
        const item = { word, pos: r[pIdx] || "", meaning: r[mIdx] || "", example: r[eIdx] || "" };

        if (byWord.has(word)) {
          const { choice } = await askDuplicate(word);
          if (choice === "ignore") continue;
          if (choice === "overwrite") {
            for (let i = baseArr.length - 1; i >= 0; i--) {
              if ((baseArr[i].word || "").trim() === word) baseArr.splice(i, 1);
            }
            baseArr.push(item);
          }
        } else {
          baseArr.push(item);
          byWord.set(word, true);
        }
      }

      await upsertChapter(selectedPack.id, last.chapter, {
        title: last.title || last.chapter,
        words: wordsArrayToObject(baseArr),
      });

      const refreshed = await getChaptersByPack(selectedPack.id);
      setChaptersByPack((prev) => ({ ...prev, [selectedPack.id]: refreshed }));
      setSelectedChapter(last.chapter);
      alert("CSV를 마지막 챕터에 추가했습니다.");
    } catch (err) {
      console.error(err);
      alert("CSV 처리 중 오류가 발생했습니다.");
    } finally {
      applyChoiceRef.current = null;
      dupResolverRef.current = null;
      setDupWord(null);
      e.target.value = "";
    }
  };

  /* ===== 칩 라벨 ===== */
  const packItems = packsOfLanguage.map((p) => {
    const chCount = (chaptersByPack[p.id] || []).length;
    const typeText = (p.type || "free");
    return { id: p.id, label: `${p.name} (${chCount}) ${typeText}` };
  });
  const chapterItems = (chapters || []).map((c) => ({
    id: c.chapter,
    label: `${c.chapter}. ${c.title || c.chapter}`,
  }));

  return (
    <div className="p-4">
      <LoadingBar show={loading} />

      {/* 언어 */}
      <LevelBar
        title="언어 종류"
        color="bg-orange-500"
        actions={[
          { label: "추가", onClick: handleAddLanguage, className: "bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700" },
          { label: "삭제", onClick: handleDeleteLanguage, className: "bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700" },
          { label: "수정", onClick: handleEditLanguage, className: "bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600" },
        ]}
      >
        <SelectChips
          items={languages}
          value={selectedLanguage}
          onChange={onChangeLanguage}
          getKey={(x) => x.id}
          getLabel={(x) => x.label}
          activeClass="bg-orange-100 border-orange-300 text-orange-800"
        />
      </LevelBar>

      {/* 언어팩 */}
      <LevelBar
        title="언어팩 종류"
        color="bg-amber-300"
        actions={[
          { label: "CSV 업로드", onClick: openPackCsv, className: "bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700" },
          { label: "추가", onClick: handleAddPack, className: "bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700" },
          { label: "삭제", onClick: handleDeletePack, className: "bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700" },
          { label: "수정", onClick: handleEditPack, className: "bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600" },
        ]}
      >
        <div className="mb-2 flex justify-end">
          <PackSampleCsvButton />
        </div>
        {selectedLanguage ? (
          <SelectChips
            items={packItems}
            value={selectedPackId}
            onChange={onChangePack}
            getKey={(x) => x.id}
            getLabel={(x) => x.label}
          />
        ) : (
          <span className="text-gray-500 text-sm">먼저 위에서 언어를 선택하세요.</span>
        )}
        <input ref={packCsvRef} type="file" accept=".csv,text/csv" className="hidden" onChange={onPackCsvSelected} />
      </LevelBar>

      {/* 챕터 */}
      <LevelBar
        title="챕터"
        color="bg-amber-200"
        actions={[
          { label: "CSV 업로드", onClick: openChapterCsv, className: "bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700" },
          { label: "추가", onClick: handleAddChapter, className: "bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700" },
          { label: "삭제", onClick: handleDeleteChapter, className: "bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700" },
          { label: "수정", onClick: handleEditChapter, className: "bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600" },
        ]}
      >
        <div className="mb-2 flex justify-end">
          <ChapterSampleCsvButton />
        </div>
        {selectedPack ? (
          <SelectChips
            items={chapterItems}
            value={selectedChapter}
            onChange={onChangeChapter}
            getKey={(x) => x.id}
            getLabel={(x) => x.label}
            activeClass="bg-amber-50 border-amber-300 text-amber-900"
          />
        ) : (
          <span className="text-gray-500 text-sm">먼저 위에서 언어팩을 선택하세요.</span>
        )}
        <input ref={chapterCsvRef} type="file" accept=".csv,text/csv" className="hidden" onChange={onChapterCsvSelected} />
      </LevelBar>

      {/* 단어 리스트 */}
      <WordsList
        words={words}
        onAdd={handleAddWord}
        onEdit={handleEditWord}
        onDelete={handleDeleteWord}
      />

      {/* 모달들 */}
      {/* 팩 업로드 모드 선택 */}
      {showPackUploadMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white w-[320px] rounded-lg shadow-lg p-5">
            <h3 className="text-lg font-semibold mb-3">업로드 모드 선택</h3>
            <p className="text-sm text-gray-600 mb-4">덮어쓰기 vs 챕터 뒤에 추가, 어떻게 하시겠습니까?</p>
            <div className="flex justify-end gap-2">
              <button className="bg-gray-200 px-3 py-1 rounded" onClick={() => setShowPackUploadMode(false)}>취소</button>
              <button className="bg-yellow-500 text-white px-3 py-1 rounded" onClick={() => applyPackGrouped("overwrite")}>덮어쓰기</button>
              <button className="bg-green-600 text-white px-3 py-1 rounded" onClick={() => applyPackGrouped("append")}>뒤에 추가</button>
            </div>
          </div>
        </div>
      )}

      {/* 챕터 중복 단어 모달 */}
      {dupWord && (
        <DuplicateWordModal
          word={dupWord}
          onChoose={handleDupChoose}
          onCancel={() => { handleDupChoose("ignore", true); }}
        />
      )}
    </div>
  );
}
