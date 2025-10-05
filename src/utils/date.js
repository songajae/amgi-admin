// ==============================
// File: src/utils/date.js
// Role: 날짜/시간 포맷 유틸리티 모음
// Note: 모든 export에는 주석을 남겨 유지보수성을 높인다.
// ==============================

// [수정] Firestore timestamp(ms)나 Date/number 값을 YYYY-MM-DD HH:mm 형식으로 변환한다.
export const formatTimestamp = (value) => {
  if (!value) return "-";
  const date = value instanceof Date ? value : new Date(Number(value));
  if (Number.isNaN(date.getTime())) return "-";
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mi = String(date.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
};

// [수정] 날짜만 필요한 경우 YYYY-MM-DD 문자열만 반환한다.
export const formatDateOnly = (value) => {
  if (!value) return "-";
  const date = value instanceof Date ? value : new Date(Number(value));
  if (Number.isNaN(date.getTime())) return "-";
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};
