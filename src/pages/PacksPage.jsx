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
import WordCollectionsPanel from "../components/packs/WordCollectionsPanel";
import PackSampleCsvButton from "../components/samples/PackSampleCsvButton";
import ChapterSampleCsvButton from "../components/samples/ChapterSampleCsvButton";
import DuplicateWordModal from "../components/modals/DuplicateWordModal";
import ConfirmModal from "../components/modals/ConfirmModal";
import FormModal from "../components/modals/FormModal";
import CsvUploadModeModal from "../components/modals/CsvUploadModeModal";

import { STRINGS } from "../constants/strings";

import {
  getWordPacks, addWordPack, updateWordPack, deleteWordPack,
  getChaptersByPack, upsertChapter, deleteChapter
} from "../lib/firestore";

/* ===== utils ===== */
function wordsObjectToArray(wordsObj = {}, extra = {}) {
  const arr = [];
  for (const word of Object.keys(wordsObj)) {
    const entries = Array.isArray(wordsObj[word]) ? wordsObj[word] : [];
    for (const e of entries) {
      arr.push({
        word,
        pos: e.pos || "",
        meaning: e.meaning || "",
        example: e.example || "",
        ...extra,
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
const CSV_REQUIRED_HEADERS = ["chapter", "chaptertitle", "word", "pos", "meaning", "example"];

function normalizeHeaderValue(value = "") {
  return value.replace(/^\ufeff/, "").trim().toLowerCase();
}

function parseCSV(text) {
  // ✅ BOM 과 공백을 제거해 헤더 불일치 문제를 예방
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const columns = line.split(",").map((segment) => segment.trim());
      if (index === 0 && columns.length > 0) {
        columns[0] = columns[0].replace(/^\ufeff/, "");
      }
      return columns;
    });
}
function ensureHeaders(header, required) {
  if (!header || header.length === 0) return false;
  const normalized = header.map((value) => normalizeHeaderValue(value));
  return required.every((item) => normalized.includes(item));
}

function idxOf(header, name) {
  return header.map((value) => normalizeHeaderValue(value)).indexOf(name);
}

function buildWordMeta(pack, chapter) {
  const packId = pack?.id || "";
  const packLanguage = pack?.language || "";
  const packName = pack?.name || packLanguage || packId;
  const chapterId = chapter?.chapterId || "";
  const chapterTitle = chapter?.title || chapter?.chapter || chapter?.chapterId || "";
  const packChapterLabel = [packName, chapterTitle].filter(Boolean).join(" - ");

  return {
    packId,
    packName,
    packLanguage,
    chapterId,
    chapterTitle,
    packChapterLabel,
  };
}

function extractChapterNumber(chapter, fallbackIndex = 0) {
  if (!chapter) return fallbackIndex + 1;

  const { order, chapter: chapterCode, chapterId } = chapter;

  if (typeof order === "number" && Number.isFinite(order)) {
    if (order >= 1) return order;
    if (order >= 0) return order + 1;
  }

  const raw = String(chapterCode || chapterId || "");
  const matched = raw.match(/(\d+)/);
  if (matched) {
    const value = Number(matched[1]);
    if (Number.isFinite(value)) return value;
  }

  return fallbackIndex + 1;
}

export default function PacksPage() {
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chaptersByPack, setChaptersByPack] = useState({});

  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [selectedPackId, setSelectedPackId] = useState("");
  const [selectedChapterId, setSelectedChapterId] = useState("");

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

  // ✅ 언어/언어팩/챕터 CRUD를 모달로 처리하기 위한 상태 추가
  const [formModalConfig, setFormModalConfig] = useState(null);
  const [confirmModalConfig, setConfirmModalConfig] = useState(null);

  const closeFormModal = () => setFormModalConfig(null);
  const closeConfirmModal = () => setConfirmModalConfig(null);


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
        if (!selectedLanguage) { setSelectedPackId(""); setSelectedChapterId(""); return; }
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
      if (!selectedPackId) { setSelectedChapterId(""); return; }
      const list = await getChaptersByPack(selectedPackId);
      setChaptersByPack((prev) => ({ ...prev, [selectedPackId]: list }));
      setSelectedChapterId(list[0]?.chapterId || "");
    })();
  }, [selectedPackId]);

  const chapters = chaptersByPack[selectedPackId] || [];
  const selectedPack = packs.find((p) => p.id === selectedPackId) || null;
  const currentChapter = chapters.find((c) => c.chapterId === selectedChapterId) || null;

  /* -----------------------------------------------------------
   * 단어 목록 계산
   *  - 챕터 선택 시: 해당 챕터 단어
   *  - 아무것도 선택 안 함: 전체 팩/전체 챕터 단어
   *  - 그 외(언어만/팩만 선택 등): 선택된 챕터가 없으면 빈 배열
   * --------------------------------------------------------- */
  const wordGroups = useMemo(() => {
    const groups = [];

    const pushGroup = (pack, chapter, fallbackIndex = 0) => {
      if (!pack || !chapter) return;
      const chapterId = chapter.chapterId || chapter.chapter || "";
      const chapterNumber = extractChapterNumber(chapter, fallbackIndex);
      const wordsArr = wordsObjectToArray(chapter?.words || {}).map((word, index) => ({
        ...word,
        __index: index,
      }));

      groups.push({
        key: `${pack.id}:${chapterId || `fallback-${fallbackIndex}`}`,
        language: pack.language,
        packId: pack.id,
        packName: pack.name,
        chapterId,
        chapterTitle: chapter.title || chapter.chapter || chapterId,
        chapterNumber,
        words: wordsArr,
      });
    };

        const appendByPack = (pack) => {
      if (!pack) return;
      const chapters = chaptersByPack[pack.id] || [];
      chapters.forEach((chapter, index) => {
        pushGroup(pack, chapter, index);
      });
    };

    if (selectedLanguage && selectedPackId && selectedChapterId) {
      if (selectedPack && currentChapter) pushGroup(selectedPack, currentChapter);
    } else if (!selectedLanguage && !selectedPackId && !selectedChapterId) {
      for (const pack of packs) appendByPack(pack);
    } else if (selectedPackId) {
      if (selectedPack) appendByPack(selectedPack);
    } else if (selectedLanguage) {
      for (const pack of packs.filter((item) => item.language === selectedLanguage)) {
        appendByPack(pack);
      }
      } else {
      for (const pack of packs) appendByPack(pack);
    }

    return groups.sort((a, b) => {
      const languageCompare = (a.language || "").localeCompare(b.language || "");
      if (languageCompare !== 0) return languageCompare;
      const packCompare = (a.packName || "").localeCompare(b.packName || "");
      if (packCompare !== 0) return packCompare;
      const chapterNumberCompare = (a.chapterNumber || 0) - (b.chapterNumber || 0);
      if (chapterNumberCompare !== 0) return chapterNumberCompare;
      return (a.chapterTitle || "").localeCompare(b.chapterTitle || "");
    });
  }, [
    selectedLanguage,
    selectedPack,
    currentChapter,
    selectedPack,
    currentChapter,
    selectedChapterId,
    packs,
    chaptersByPack,
  ]);

  const activeGroupKey = useMemo(() => {
    if (!selectedPackId || !selectedChapterId) return "";
    return `${selectedPackId}:${selectedChapterId}`;
  }, [selectedPackId, selectedChapterId]);


  /* -----------------------------------------------------------
   * 칩 onChange: 재클릭 시 선택 해제
   * --------------------------------------------------------- */
  const onChangeLanguage = (id) => {
    setSelectedLanguage((prev) => (prev === id ? "" : id));
    setSelectedPackId("");
    setSelectedChapterId("");
  };
  const onChangePack = (id) => {
    setSelectedPackId((prev) => (prev === id ? "" : id));
    setSelectedChapterId("");
  };
  const onChangeChapter = (id) => {
    setSelectedChapterId((prev) => (prev === id ? "" : id));
  };

  /* ===== 언어 액션들 ===== */
  const handleAddLanguage = () => {
    // ✅ 언어 추가를 모달 입력으로 대체
    setFormModalConfig({
      title: STRINGS.packsPage.forms.addLanguageTitle,
      description: STRINGS.packsPage.forms.addLanguageDescription,
      submitLabel: STRINGS.packsPage.forms.addLanguageSubmit,
      fields: [
        {
          name: "language",
          label: STRINGS.packsPage.forms.languageNameLabel,
          placeholder: "예: 영어",
          required: true,
        },
        {
          name: "packName",
          label: STRINGS.packsPage.forms.initialPackNameLabel,
          placeholder: "예: 기본팩",
          required: true,
        },
        {
          name: "packType",
          label: STRINGS.packsPage.forms.packTypeLabel,
          placeholder: STRINGS.packsPage.forms.packTypePlaceholder,
        },
      ],
      initialValues: { language: "", packName: "기본팩", packType: "free" },
      onSubmit: async ({ language, packName, packType }) => {
        try {
          const trimmedLanguage = (language || "").trim();
          if (!trimmedLanguage) return false;
          const trimmedPackName = (packName || "").trim() || trimmedLanguage;
          const sanitizedPackType = (packType || "free").trim() || "free";

          await addWordPack({ language: trimmedLanguage, name: trimmedPackName, type: sanitizedPackType });
          setSelectedLanguage(trimmedLanguage);
          await fetchPacks();
          return true;
        } catch (error) {
          console.error(error);
          alert(STRINGS.packsPage.alerts.operationFailed);
          return false;
        }
      },
    });
  };
  const handleEditLanguage = () => {
    if (!selectedLanguage) return alert(STRINGS.packsPage.alerts.selectLanguageFirst);

    setFormModalConfig({
      title: STRINGS.packsPage.forms.editLanguageTitle,
      description: STRINGS.packsPage.forms.editLanguageDescription,
      submitLabel: STRINGS.packsPage.forms.editLanguageSubmit,
      fields: [
        {
          name: "language",
          label: STRINGS.packsPage.forms.languageNameLabel,
          required: true,
        },
      ],
      initialValues: { language: selectedLanguage },
      onSubmit: async ({ language }) => {
        try {
          const trimmed = (language || "").trim();
          if (!trimmed || trimmed === selectedLanguage) return false;
          const targets = packs.filter((pack) => pack.language === selectedLanguage);
          for (const pack of targets) {
            await updateWordPack(pack.id, { language: trimmed });
          }
          setSelectedLanguage(trimmed);
          await fetchPacks();
          return true;
        } catch (error) {
          console.error(error);
          alert(STRINGS.packsPage.alerts.operationFailed);
          return false;
        }
      },
    });
  };

  const handleDeleteLanguage = () => {
    if (!selectedLanguage) return alert(STRINGS.packsPage.alerts.selectLanguageFirst);

    const targets = packs.filter((pack) => pack.language === selectedLanguage);
    const description = [
      STRINGS.packsPage.forms.deleteLanguageDescription(selectedLanguage),
      STRINGS.packsPage.alerts.confirmDeleteLanguage(selectedLanguage, targets.length),
    ].join("\n");

    setConfirmModalConfig({
      title: STRINGS.packsPage.forms.deleteLanguageTitle,
      description,
      confirmLabel: STRINGS.common.buttons.delete,
      confirmTone: "danger",
      onConfirm: async () => {
        try {
          for (const pack of targets) {
            await deleteWordPack(pack.id);
          }
          setSelectedLanguage("");
          setSelectedPackId("");
          setSelectedChapterId("");
          await fetchPacks();
          return true;
        } catch (error) {
          console.error(error);
          alert(STRINGS.packsPage.alerts.operationFailed);
          return false;
        }
      },
    });
  };

  /* ===== 언어팩 액션 ===== */
  const handleAddPack = () => {
    if (!selectedLanguage) return alert(STRINGS.packsPage.alerts.selectLanguageFirst);

    setFormModalConfig({
      title: STRINGS.packsPage.forms.addPackTitle,
      description: STRINGS.packsPage.forms.addPackDescription,
      submitLabel: STRINGS.packsPage.forms.addPackSubmit,
      fields: [
        {
          name: "name",
          label: STRINGS.packsPage.forms.packNameLabel,
          placeholder: "예: 기본팩",
          required: true,
        },
        {
          name: "type",
          label: STRINGS.packsPage.forms.packTypeLabel,
          placeholder: STRINGS.packsPage.forms.packTypePlaceholder,
        },
      ],
      initialValues: { name: "", type: "free" },
      onSubmit: async ({ name, type }) => {
        try {
          const trimmedName = (name || "").trim();
          if (!trimmedName) return false;
          const sanitizedType = (type || "free").trim() || "free";
          const created = await addWordPack({ language: selectedLanguage, name: trimmedName, type: sanitizedType });
          setSelectedPackId(created.id);
          await fetchPacks();
          return true;
        } catch (error) {
          console.error(error);
          alert(STRINGS.packsPage.alerts.operationFailed);
          return false;
        }
      },
    });
  };

  const handleEditPack = () => {
    if (!selectedPack) return alert(STRINGS.packsPage.alerts.selectPackFirst);

    setFormModalConfig({
      title: STRINGS.packsPage.forms.editPackTitle,
      description: STRINGS.packsPage.forms.editPackDescription,
      submitLabel: STRINGS.packsPage.forms.editPackSubmit,
      fields: [
        {
          name: "name",
          label: STRINGS.packsPage.forms.packNameLabel,
          required: true,
        },
        {
          name: "type",
          label: STRINGS.packsPage.forms.packTypeLabel,
          placeholder: STRINGS.packsPage.forms.packTypePlaceholder,
        },
      ],
      initialValues: { name: selectedPack.name || "", type: selectedPack.type || "free" },
      onSubmit: async ({ name, type }) => {
        try {
          const trimmedName = (name || "").trim();
          if (!trimmedName) return false;
          const sanitizedType = (type || selectedPack.type || "free").trim() || selectedPack.type || "free";
          await updateWordPack(selectedPack.id, { name: trimmedName, type: sanitizedType });
          await fetchPacks();
          return true;
        } catch (error) {
          console.error(error);
          alert(STRINGS.packsPage.alerts.operationFailed);
          return false;
        }
      },
    });
  };

  const handleDeletePack = () => {
    if (!selectedPack) return alert(STRINGS.packsPage.alerts.selectPackFirst);

    const description = [
      STRINGS.packsPage.forms.deletePackDescription(selectedPack.name),
      STRINGS.packsPage.alerts.confirmDeletePack(selectedPack.name),
    ].join("\n");

    setConfirmModalConfig({
      title: STRINGS.packsPage.forms.deletePackTitle,
      description,
      confirmLabel: STRINGS.common.buttons.delete,
      confirmTone: "danger",
      onConfirm: async () => {
        try {
          await deleteWordPack(selectedPack.id);
          setSelectedPackId("");
          setSelectedChapterId("");
          await fetchPacks();
          return true;
        } catch (error) {
          console.error(error);
          alert(STRINGS.packsPage.alerts.operationFailed);
          return false;
        }
      },
    });
  };

  /* ===== 챕터 액션 ===== */
  const handleAddChapter = () => {
    if (!selectedPack) return alert(STRINGS.packsPage.alerts.selectPackFirst);

    setFormModalConfig({
      title: STRINGS.packsPage.forms.addChapterTitle,
      description: STRINGS.packsPage.forms.addChapterDescription,
      submitLabel: STRINGS.packsPage.forms.addChapterSubmit,
      fields: [
        {
          name: "chapter",
          label: STRINGS.packsPage.forms.chapterIdLabel,
          placeholder: "예: ch1",
          required: true,
        },
        {
          name: "title",
          label: STRINGS.packsPage.forms.chapterTitleLabel,
          placeholder: "예: 동물",
          required: true,
        },
      ],
      initialValues: { chapter: "", title: "" },
      onSubmit: async ({ chapter, title }) => {
        try {
          const trimmedChapter = (chapter || "").trim();
          if (!trimmedChapter) return false;
          const trimmedTitle = (title || "").trim() || trimmedChapter;
          const chapterId = await upsertChapter(selectedPack.id, null, {
            chapter: trimmedChapter,
            title: trimmedTitle,
            words: {},
          });
          const list = await getChaptersByPack(selectedPack.id);
          setChaptersByPack((prev) => ({ ...prev, [selectedPack.id]: list }));
          setSelectedChapterId(chapterId);
          return true;
        } catch (error) {
          console.error(error);
          alert(STRINGS.packsPage.alerts.operationFailed);
          return false;
        }
      },
    });
  };

  const handleEditChapter = () => {
    if (!selectedPack || !selectedChapterId) return alert(STRINGS.packsPage.alerts.selectChapterFirst);

    const current = chapters.find((chapter) => chapter.chapterId === selectedChapterId);
    const chapterLabel = current?.chapter || current?.chapterId || selectedChapterId;

    setFormModalConfig({
      title: STRINGS.packsPage.forms.editChapterTitle,
      description: STRINGS.packsPage.forms.editChapterDescription,
      submitLabel: STRINGS.packsPage.forms.editChapterSubmit,
      fields: [
        {
          name: "chapter",
          label: STRINGS.packsPage.forms.chapterIdLabel,
          disabled: true,
          readOnly: true,
        },
        {
          name: "title",
          label: STRINGS.packsPage.forms.chapterTitleLabel,
          required: true,
        },
      ],
      initialValues: {
        chapter: chapterLabel,
        title: current?.title || chapterLabel,
      },
      onSubmit: async ({ title }) => {
        try {
          const trimmedTitle = (title || "").trim() || chapterLabel;
          await upsertChapter(selectedPack.id, selectedChapterId, {
            chapter: chapterLabel,
            title: trimmedTitle,
            words: current?.words || {},
          });
          const list = await getChaptersByPack(selectedPack.id);
          setChaptersByPack((prev) => ({ ...prev, [selectedPack.id]: list }));
          return true;
        } catch (error) {
          console.error(error);
          alert(STRINGS.packsPage.alerts.operationFailed);
          return false;
        }
      },
    });
  };

  const handleDeleteChapter = () => {
    if (!selectedPack || !selectedChapterId) return alert(STRINGS.packsPage.alerts.selectChapterFirst);

    const current = chapters.find((chapter) => chapter.chapterId === selectedChapterId);
    const chapterLabel = current?.chapter || current?.title || selectedChapterId;
    const description = [
      STRINGS.packsPage.forms.deleteChapterDescription(chapterLabel),
      STRINGS.packsPage.alerts.confirmDeleteChapter(chapterLabel),
    ].join("\n");

    setConfirmModalConfig({
      title: STRINGS.packsPage.forms.deleteChapterTitle,
      description,
      confirmLabel: STRINGS.common.buttons.delete,
      confirmTone: "danger",
      onConfirm: async () => {
        try {
          await deleteChapter(selectedPack.id, selectedChapterId);
          const list = await getChaptersByPack(selectedPack.id);
          setChaptersByPack((prev) => ({ ...prev, [selectedPack.id]: list }));
          setSelectedChapterId(list[0]?.chapterId || "");
          return true;
        } catch (error) {
          console.error(error);
          alert(STRINGS.packsPage.alerts.operationFailed);
          return false;
        }
      },
    });
  };

  /* ===== 단어 액션 ===== */
  const resolveWordContext = (payload) => {
    if (payload == null) return null;

    if (typeof payload === "number") {
      if (!selectedPackId || !selectedChapterId) return null;
      const pack = packs.find((p) => p.id === selectedPackId) || null;
      const chapterList = chaptersByPack[selectedPackId] || [];
      const chapter = chapterList.find((c) => c.chapterId === selectedChapterId) || null;
      return {
        index: payload,
        pack,
        chapter,
        packId: selectedPackId,
        chapterId: selectedChapterId,
      };
    }

    if (typeof payload === "object") {
      const { index, packId, chapterId } = payload;
      if (typeof index !== "number" || !packId || !chapterId) return null;
      const pack = packs.find((p) => p.id === packId) || null;
      const chapterList = chaptersByPack[packId] || [];
      const chapter = chapterList.find((c) => c.chapterId === chapterId) || null;
      return {
        index,
        pack,
        chapter,
        packId,
        chapterId,
        sense: payload.sense,
        word: payload.word,
      };
    }

    return null;
  };

  const saveWordsToChapter = async ({ packId, chapterId, chapter, wordsArray }) => {
    if (!packId || !chapterId) return false;
    const chapterLabel = chapter?.chapter || chapter?.title || chapterId;

    try {
      await upsertChapter(packId, chapterId, {
        chapter: chapterLabel,
        title: chapter?.title || chapterLabel,
        words: wordsArrayToObject(wordsArray),
      });

      const refreshed = await getChaptersByPack(packId);
      setChaptersByPack((prev) => ({ ...prev, [packId]: refreshed }));
      return true;
    } catch (error) {
      console.error(error);
      alert(STRINGS.packsPage.alerts.operationFailed);
      return false;
    }
  };

  const handleAddWord = () => {
    if (!selectedPackId || !selectedChapterId) return alert(STRINGS.packsPage.alerts.selectChapterFirst);

    const chapter = chapters.find((c) => c.chapterId === selectedChapterId);
    if (!chapter) return;

    const chapterLabel = chapter?.title || chapter?.chapter || selectedChapterId;

    setFormModalConfig({
      title: STRINGS.packsPage.forms.addWordTitle,
      description: STRINGS.packsPage.forms.addWordDescription(chapterLabel),
      submitLabel: STRINGS.packsPage.forms.addWordSubmit,
      fields: [
        {
          name: "word",
          label: STRINGS.packsPage.forms.wordLabel,
          placeholder: STRINGS.packsPage.forms.wordPlaceholder,
          required: true,
        },
        {
          name: "pos",
          label: STRINGS.packsPage.forms.posLabel,
          placeholder: STRINGS.packsPage.forms.posPlaceholder,
        },
        {
          name: "meaning",
          label: STRINGS.packsPage.forms.meaningLabel,
          placeholder: STRINGS.packsPage.forms.meaningPlaceholder,
          type: "textarea",
          rows: 3,
        },
        {
          name: "example",
          label: STRINGS.packsPage.forms.exampleLabel,
          placeholder: STRINGS.packsPage.forms.examplePlaceholder,
          type: "textarea",
          rows: 3,
        },
      ],
      initialValues: {
        word: "",
        pos: "",
        meaning: "",
        example: "",
      },
      onSubmit: async (values) => {
        const next = wordsObjectToArray(chapter?.words || []);
        const trimmedWord = values.word?.trim() || "";
        if (!trimmedWord) {
          alert(STRINGS.packsPage.forms.wordRequiredMessage);
          return false;
        }

        next.push({
          word: trimmedWord,
          pos: values.pos?.trim() || "",
          meaning: values.meaning?.trim() || "",
          example: values.example?.trim() || "",
        });

        return saveWordsToChapter({
          packId: selectedPackId,
          chapterId: selectedChapterId,
          chapter,
          wordsArray: next,
        });
      },
    });   
  };
  
  const handleEditWord = (payload) => {
    const context = resolveWordContext(payload);
    if (!context?.pack || !context?.chapter) return;

    const { index, packId, chapterId, chapter } = context;
    const arr = wordsObjectToArray(chapter?.words || []);
    const target = arr[index];
    if (!target) return;

    const chapterLabel = chapter?.title || chapter?.chapter || chapterId;
    const wordLabel = target.word || STRINGS.packsPage.forms.wordLabel;

    setFormModalConfig({
      title: STRINGS.packsPage.forms.editWordTitle,
      description: STRINGS.packsPage.forms.editWordDescription(wordLabel, chapterLabel),
      submitLabel: STRINGS.packsPage.forms.editWordSubmit,
      fields: [
        {
          name: "word",
          label: STRINGS.packsPage.forms.wordLabel,
          placeholder: STRINGS.packsPage.forms.wordPlaceholder,
          required: true,
        },
        {
          name: "pos",
          label: STRINGS.packsPage.forms.posLabel,
          placeholder: STRINGS.packsPage.forms.posPlaceholder,
        },
        {
          name: "meaning",
          label: STRINGS.packsPage.forms.meaningLabel,
          placeholder: STRINGS.packsPage.forms.meaningPlaceholder,
          type: "textarea",
          rows: 3,
        },
        {
          name: "example",
          label: STRINGS.packsPage.forms.exampleLabel,
          placeholder: STRINGS.packsPage.forms.examplePlaceholder,
          type: "textarea",
          rows: 3,
        },
      ],
      initialValues: {
        word: target.word || "",
        pos: target.pos || "",
        meaning: target.meaning || "",
        example: target.example || "",
      },
      onSubmit: async (values) => {
        const next = wordsObjectToArray(chapter?.words || []);
        const trimmedWord = values.word?.trim() || "";
        if (!trimmedWord) {
          alert(STRINGS.packsPage.forms.wordRequiredMessage);
          return false;
        }

        next[index] = {
          word: trimmedWord,
          pos: values.pos?.trim() || "",
          meaning: values.meaning?.trim() || "",
          example: values.example?.trim() || "",
        };

        return saveWordsToChapter({
          packId,
          chapterId,
          chapter,
          wordsArray: next,
        });
      },
    });  
  };
 
  const handleDeleteWord = (payload) => {
    const context = resolveWordContext(payload);
    if (!context?.pack || !context?.chapter) return;

    const { index, packId, chapterId, chapter } = context;
    const arr = wordsObjectToArray(chapter?.words || []);
    if (!arr[index]) return;

    const chapterLabel = chapter?.title || chapter?.chapter || chapterId;
    const wordLabel = arr[index].word || STRINGS.packsPage.forms.wordLabel;

    setConfirmModalConfig({
      title: STRINGS.packsPage.forms.deleteWordTitle,
      description: STRINGS.packsPage.forms.deleteWordDescription(wordLabel, chapterLabel),
      confirmLabel: STRINGS.common.buttons.delete,
      confirmTone: "danger",
      onConfirm: async () => {
        const next = wordsObjectToArray(chapter?.words || []);
        next.splice(index, 1);
        return saveWordsToChapter({
          packId,
          chapterId,
          chapter,
          wordsArray: next,
        });
      },
    });
  };

  /* ===== 언어팩 CSV: 모드 선택 모달 + 적용 ===== */
  const openPackCsv = () => packCsvRef.current?.click();

  const onPackCsvSelected = async (e) => {
    try {
      if (!selectedPack) return alert(STRINGS.packsPage.alerts.selectPackFirst);
      const file = e.target.files?.[0];
      if (!file) return;

      const text = await file.text();
      const rows = parseCSV(text);
      if (rows.length === 0) return alert(STRINGS.packsPage.csv.emptyFile);

      const [header, ...data] = rows;
      const required = ["chapter", "chaptertitle", "word", "pos", "meaning", "example"];
      if (!ensureHeaders(header, CSV_REQUIRED_HEADERS)) {
        return alert(`${STRINGS.packsPage.csv.headerError}\n${STRINGS.packsPage.csv.headerRequired}`);
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
      if (Object.keys(grouped).length === 0) return alert(STRINGS.packsPage.csv.invalidRows);
      
      const existingChapters = chaptersByPack[selectedPack.id] || [];
      const hasExistingChapters = existingChapters.length > 0;

      setPendingPackGrouped(grouped);
      
      if (hasExistingChapters) {
        setShowPackUploadMode(true);
      } else {
        await applyPackGrouped("overwrite", grouped);
      }
    } catch (err) {
      console.error(err);
      alert(STRINGS.packsPage.csv.processingError);
    } finally {
      e.target.value = "";
    }
  };

   const applyPackGrouped = async (mode, groupedOverride = null) => {
    if (!selectedPack) return;
    const grouped = groupedOverride || pendingPackGrouped;
    if (!grouped) return;

    setShowPackUploadMode(false);

    try {
      if (mode === "overwrite") {
        const existing = await getChaptersByPack(selectedPack.id);
        for (const c of existing) await deleteChapter(selectedPack.id, c.chapterId); // ✅ 2025-09-27
        let order = 0;
        for (const ch of Object.keys(grouped)) {
          const { title, wordsArr } = grouped[ch];
          const chapterLabel = ch || `chapter-${order + 1}`;
          await upsertChapter(selectedPack.id, null, {
            chapter: chapterLabel,
            title: title || chapterLabel,
            order: order + 1,
            words: wordsArrayToObject(wordsArr),
          });
          order += 1;
        }
      } else if (mode === "append") {
        const existing = await getChaptersByPack(selectedPack.id);
        let cursor = existing.length;
        for (const ch of Object.keys(grouped)) {
          cursor += 1;
          const { title, wordsArr } = grouped[ch];
          const chapterLabel = ch || `ch${cursor}`;
          await upsertChapter(selectedPack.id, null, {
            chapter: chapterLabel,
            title: title || chapterLabel,
            order: cursor,
            words: wordsArrayToObject(wordsArr),
          });
        }      
    }

    const refreshed = await getChaptersByPack(selectedPack.id);
      setChaptersByPack((prev) => ({ ...prev, [selectedPack.id]: refreshed }));
      setSelectedChapterId(refreshed[0]?.chapterId || "");
    } finally {
      setPendingPackGrouped(null);
    }
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
      if (!selectedPack) return alert(STRINGS.packsPage.alerts.selectPackFirst);
      const file = e.target.files?.[0];
      if (!file) return;

      const text = await file.text();
      const rows = parseCSV(text);
      if (rows.length === 0) return alert(STRINGS.packsPage.csv.emptyFile);

      const [header, ...data] = rows;
      if (!ensureHeaders(header, CSV_REQUIRED_HEADERS)) {
        return alert(`${STRINGS.packsPage.csv.headerError}\n${STRINGS.packsPage.csv.headerRequired}`);
      }
      const wIdx = idxOf(header, "word");
      const pIdx = idxOf(header, "pos");
      const mIdx = idxOf(header, "meaning");
      const eIdx = idxOf(header, "example");

      const current = await getChaptersByPack(selectedPack.id);
      if (current.length === 0) return alert(STRINGS.packsPage.csv.needChapter);
      const last = current[current.length - 1];
      const baseArr = wordsObjectToArray(last.words || []);
      const byWord = new Map(baseArr.map((w) => [(w.word || "").trim(), true]));

      const groupedNewEntries = new Map();
      const orderedWords = [];

      for (const r of data) {
        const word = (r[wIdx] || "").trim();
        if (!word) continue;
        const item = { word, pos: r[pIdx] || "", meaning: r[mIdx] || "", example: r[eIdx] || "" };

        if (!groupedNewEntries.has(word)) {
          groupedNewEntries.set(word, []);
          orderedWords.push(word);
        }

        groupedNewEntries.get(word).push(item);
      }

      for (const word of orderedWords) {
        const items = groupedNewEntries.get(word) || [];
        if (items.length === 0) continue;

        const hasExisting = byWord.has(word);
        let shouldAppend = true;

        if (hasExisting) {
          const { choice } = await askDuplicate(word);
          if (choice === "ignore") {
            shouldAppend = false;
          } else if (choice === "overwrite") {
            for (let i = baseArr.length - 1; i >= 0; i -= 1) {
              if ((baseArr[i].word || "").trim() === word) {
                baseArr.splice(i, 1);
              }
            }
            } else {
            shouldAppend = false;
          }
        }

        if (shouldAppend) {
          items.forEach((item) => {
            baseArr.push(item);
          });
          byWord.set(word, true);
        }
      }

      const chapterLabel = last.chapter || last.title || last.chapterId;
      await upsertChapter(selectedPack.id, last.chapterId, {
        chapter: chapterLabel,
        title: last.title || chapterLabel,
        words: wordsArrayToObject(baseArr),
      });

      const refreshed = await getChaptersByPack(selectedPack.id);
      setChaptersByPack((prev) => ({ ...prev, [selectedPack.id]: refreshed }));
      setSelectedChapterId(last.chapterId);
      alert(STRINGS.packsPage.csv.appendSuccess);
    } catch (err) {
      console.error(err);
      alert(STRINGS.packsPage.csv.processingError);
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
  const chapterItems = (chapters || []).map((c) => {
    const chapterLabel = c.chapter || c.title || c.chapterId;
    return {
      id: c.chapterId,
      label: c.chapter ? `${c.chapter}. ${c.title || c.chapter}` : chapterLabel,
    };
  });

  return (
    <div className="p-4">
      <LoadingBar show={loading} />

      {/* 언어 */}
      <LevelBar
        title={STRINGS.packsPage.levelBar.languagesTitle}
        color="bg-orange-500"
        actions={[
          { label: STRINGS.common.buttons.add, onClick: handleAddLanguage, className: "bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700" },
          { label: STRINGS.common.buttons.delete, onClick: handleDeleteLanguage, className: "bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700" },
          { label: STRINGS.common.buttons.edit, onClick: handleEditLanguage, className: "bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600" },
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
        title={STRINGS.packsPage.levelBar.packsTitle}
        color="bg-amber-300"
        actions={[
          { label: STRINGS.packsPage.levelBar.uploadCsv, onClick: openPackCsv, className: "bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700" },
          { label: STRINGS.common.buttons.add, onClick: handleAddPack, className: "bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700" },
          { label: STRINGS.common.buttons.delete, onClick: handleDeletePack, className: "bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700" },
          { label: STRINGS.common.buttons.edit, onClick: handleEditPack, className: "bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600" },
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
          <span className="text-gray-500 text-sm">{STRINGS.packsPage.alerts.selectLanguageFirst}</span>
        )}
        <input ref={packCsvRef} type="file" accept=".csv,text/csv" className="hidden" onChange={onPackCsvSelected} />
      </LevelBar>

      {/* 챕터 */}
      <LevelBar
        title={STRINGS.packsPage.levelBar.chaptersTitle}
        color="bg-amber-200"
        actions={[
          { label: STRINGS.packsPage.levelBar.uploadCsv, onClick: openChapterCsv, className: "bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700" },
          { label: STRINGS.common.buttons.add, onClick: handleAddChapter, className: "bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700" },
          { label: STRINGS.common.buttons.delete, onClick: handleDeleteChapter, className: "bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700" },
          { label: STRINGS.common.buttons.edit, onClick: handleEditChapter, className: "bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600" },
        ]}
      >
        <div className="mb-2 flex justify-end">
          <ChapterSampleCsvButton />
        </div>
        {selectedPack ? (
          <SelectChips
            items={chapterItems}
            value={selectedChapterId}
            onChange={onChangeChapter}
            getKey={(x) => x.id}
            getLabel={(x) => x.label}
            activeClass="bg-amber-50 border-amber-300 text-amber-900"
          />
        ) : (
          <span className="text-gray-500 text-sm">{STRINGS.packsPage.alerts.selectPackFirst}</span>
        )}
        <input ref={chapterCsvRef} type="file" accept=".csv,text/csv" className="hidden" onChange={onChapterCsvSelected} />
      </LevelBar>

      {/* 단어 리스트 */}
      <WordCollectionsPanel
        groups={wordGroups}
        activeGroupKey={activeGroupKey}
        onAdd={handleAddWord}
        onEdit={handleEditWord}
        onDelete={handleDeleteWord}
      />

      {/* 모달들 */}
      {/* 팩 업로드 모드 선택 */}
      {showPackUploadMode && (
        <CsvUploadModeModal
          onClose={() => setShowPackUploadMode(false)}
          onOverwrite={() => applyPackGrouped("overwrite")}
          onAppend={() => applyPackGrouped("append")}
        />
      )}

      {/* 챕터 중복 단어 모달 */}
      {dupWord && (
        <DuplicateWordModal
          word={dupWord}
          onChoose={handleDupChoose}
          onCancel={() => { handleDupChoose("ignore", true); }}
        />
      )}
      
      {/* 언어/언어팩/챕터 입력 모달 */}
      {formModalConfig && (
        <FormModal
          {...formModalConfig}
          onCancel={closeFormModal}
        />
      )}

      {/* 삭제 등 확인 모달 */}
      {confirmModalConfig && (
        <ConfirmModal
          {...confirmModalConfig}
          onCancel={closeConfirmModal}
        />
      )}
    </div>
  );
}
