// ==============================
// Common Strings (Buttons, Messages, Pagination)
// ==============================
export const STRINGS = {
  // 공통
  common: {
    buttons: {
      add: "추가",
      edit: "수정",
      delete: "삭제",
      cancel: "취소",
      confirm: "확인",
      prev: "이전",
      next: "다음",
    },
    messages: {
      noResults: "결과가 없습니다.",
    },
    pagination: {
      range: (start, end, total) => `${start}-${end} / 총 ${total}`,
      pageLabel: (current, last) => `페이지 ${current} / ${last}`,
    },
  },

  // 대시보드 메뉴
  dashboard: {
    title: "대시보드",
    stats: {
      totalUsers: "총 유저 수",
      totalPacks: "총 언어팩 수",
      totalVideos: "총 영상 수",
    },
    errors: {
      loadFailed: "대시보드 정보를 불러오는 데 실패했습니다.",
    },
  },

  // 유저 관리 메뉴
  users: {
    title: "유저 관리",
    searchPlaceholder: "검색 (이메일 / 이름)",
    perPageOptions: [
      { value: 10, label: "10개" },
      { value: 20, label: "20개" },
      { value: 50, label: "50개" },
      { value: 100, label: "100개" },
    ],
    addButton: "유저 추가",
    table: {
      name: "이름",
      email: "이메일",
      packs: "보유 팩",
      actions: "액션",
    },
    confirmDelete: "해당 유저를 삭제하시겠습니까?",
    deviceManagerTitle: "사용자 기기 관리",
  },

  // 영상 관리 메뉴
  videos: {
    filters: {
      language: "언어 종류",
      pack: "언어팩 종류",
      chapter: "챕터",
      selectLanguageFirst: "먼저 언어를 선택하세요.",
      selectPackFirst: "먼저 언어팩을 선택하세요.",
    },
    list: {
      title: "영상 리스트",
      searchPlaceholder: "팩/챕터/언어/제목 검색",
      perPageOptions: [
        { value: 10, label: "10개씩 보기" },
        { value: 20, label: "20개씩 보기" },
        { value: 50, label: "50개씩 보기" },
        { value: 100, label: "100개씩 보기" },
      ],
      onlyUnlinked: "영상 미연결만",
      showAll: "전체 보기",
      addButton: "추가",
      columns: {
        packChapter: "언어팩-챕터",
        thumbnail: "썸네일",
        title: "제목",
        subtitles: "자막",
        actions: "액션",
      },
      subtitleStatus: {
        exists: "삽입",
        missing: "미삽입",
        thumbnailPlaceholder: "미연결",
      },
      alerts: {
        selectChapterFirst: (editLabel) => `먼저 챕터를 선택하거나, 행의 '${editLabel}' 버튼을 사용하세요.`,
        chapterNotFound: "선택한 챕터를 찾을 수 없습니다.",
        videoMissing: "연결된 영상이 없습니다.",
      },
      deleteConfirm: (title) => `'${title}' 영상을 삭제할까요?`,
    },
  },

  // 언어팩 관리 메뉴
  packs: {
    wordsPanel: {
      title: "단어 리스트",
      searchPlaceholder: "단어/품사/뜻/예문 검색",
      totalLabel: (count) => `총 ${count}개의 단어`,
      labels: {
        language: "언어",
        pack: "언어팩",
        chapter: "챕터",
        unknown: "미정",
        example: "예문",
      },
      emptyMessage: "등록된 단어가 없습니다.",
    },
  },
  
  // PacksPage (src/pages/PacksPage.jsx)
  packsPage: {
    levelBar: {
      languagesTitle: "언어",
      packsTitle: "언어팩",
      chaptersTitle: "챕터",
      uploadCsv: "CSV 업로드",
    },
    csv: {
      headerError: "CSV 헤더가 올바르지 않습니다.",
      headerRequired: "필수: chapter,chapterTitle,word,pos,meaning,example",
      emptyFile: "CSV 파일이 비어있습니다.",
      invalidRows: "업로드할 유효한 행이 없습니다.",
      processingError: "CSV 처리 중 오류가 발생했습니다.",
      uploadModeTitle: "업로드 모드 선택",
      uploadModeDescription: "덮어쓰기와 뒤에 추가 중 원하는 방식을 선택하세요.",
      overwrite: "덮어쓰기",
      append: "뒤에 추가",
      needChapter: "먼저 최소 1개의 챕터를 만들어 주세요.",
      appendSuccess: "CSV를 마지막 챕터에 추가했습니다.",
    },
    alerts: {
      selectLanguageFirst: "먼저 언어를 선택하세요.",
      selectPackFirst: "먼저 언어팩을 선택하세요.",
      selectChapterFirst: "챕터를 선택하세요.",
      confirmDeleteLanguage: (language, count) => `"${language}" 언어의 언어팩 ${count}개를 모두 삭제할까요?`,
      confirmDeletePack: (packName) => `"${packName}" 언어팩을 삭제할까요?`,
      confirmDeleteChapter: (chapterLabel) => `챕터 "${chapterLabel}" 를 삭제할까요?`,
      confirmDeleteWord: "이 단어를 삭제할까요?",
      operationFailed: "작업 중 오류가 발생했습니다.",
    },
    forms: {
      // 언어 관리 모달 (src/pages/PacksPage.jsx)
      addLanguageTitle: "언어 추가",
      addLanguageDescription: "새로운 언어와 기본 언어팩 정보를 입력하세요.",
      editLanguageTitle: "언어 수정",
      editLanguageDescription: "선택한 언어의 이름을 수정합니다.",
      deleteLanguageTitle: "언어 삭제",
      deleteLanguageDescription: (language) => `선택한 언어(${language})에 속한 모든 언어팩이 삭제됩니다.`,
      languageNameLabel: "언어 이름",
      initialPackNameLabel: "기본 언어팩 이름",
      packTypeLabel: "언어팩 타입",
      packTypePlaceholder: "예: free, paid",
      addLanguageSubmit: "언어 생성",
      editLanguageSubmit: "언어 수정",

      // 언어팩 관리 모달 (src/pages/PacksPage.jsx)
      addPackTitle: "언어팩 추가",
      addPackDescription: "선택한 언어에 새 언어팩을 추가합니다.",
      editPackTitle: "언어팩 수정",
      editPackDescription: "선택한 언어팩 정보를 수정합니다.",
      deletePackTitle: "언어팩 삭제",
      deletePackDescription: (packName) => `언어팩(${packName})과 해당 챕터가 삭제됩니다.`,
      packNameLabel: "언어팩 이름",
      addPackSubmit: "언어팩 생성",
      editPackSubmit: "언어팩 수정",

      // 챕터 관리 모달 (src/pages/PacksPage.jsx)
      addChapterTitle: "챕터 추가",
      addChapterDescription: "새로운 챕터 ID와 제목을 입력하세요.",
      editChapterTitle: "챕터 수정",
      editChapterDescription: "선택한 챕터의 제목을 수정합니다.",
      deleteChapterTitle: "챕터 삭제",
      deleteChapterDescription: (chapterLabel) => `챕터(${chapterLabel})에 포함된 모든 단어가 삭제됩니다.`,
      chapterIdLabel: "챕터 ID",
      chapterTitleLabel: "챕터 제목",
      addChapterSubmit: "챕터 생성",
      editChapterSubmit: "챕터 수정",
    },
  },

  // Sample CSV Buttons (src/components/samples/*.jsx)
  samples: {
    downloadLabel: "샘플 CSV 다운로드",
  },
};

export default STRINGS;