// ==============================
// File: src/utils/users.js
// Role: 유저 관련 공용 유틸리티 함수 모음
// ==============================

// [수정] 유저 객체에서 보유한 언어팩 ID 배열을 추출한다.
export const extractOwnedPackIds = (user) => {
  if (!user) return [];
  const candidates =
    user.ownedPacks ||
    user.ownedPackIds ||
    user.packs ||
    user.purchased_packs ||
    [];
  return Array.isArray(candidates) ? candidates.filter(Boolean) : [];
};

// [수정] 언어팩 정보로 사용자에게 보여줄 라벨을 구성한다.
export const makePackLabel = (pack) => {
  if (!pack) return "";
  const name = pack.name || "(no-name)";
  const lang = pack.language ? ` / ${pack.language}` : "";
  const type = pack.type ? ` (${pack.type})` : "";
  return `${name}${lang}${type}`;
};

// [수정] 유저 표시명을 일관되게 생성한다.
export const displayNameOf = (user) => {
  if (!user) return "-";
  return user.displayName || user.name || user.email || "-";
};