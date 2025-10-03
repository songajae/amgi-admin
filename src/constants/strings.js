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
      },
      emptyMessage: "등록된 단어가 없습니다.",
    },
  },
};

export default STRINGS;