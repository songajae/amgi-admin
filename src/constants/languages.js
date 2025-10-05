export const BASE_LANGUAGES = ["영어", "일본어"];

const NORMALIZED_BASE_LANGUAGES = new Set(
  BASE_LANGUAGES.map((name) => (name || "").trim().toLowerCase())
);

export const isBaseLanguage = (language = "") =>
  NORMALIZED_BASE_LANGUAGES.has((language || "").trim().toLowerCase());

export const ensureBaseLanguageCounts = (counts = {}) => {
  const aggregated = {};
  for (const [name, value] of Object.entries(counts || {})) {
    const trimmed = (name || "").trim();
    if (!trimmed) continue;
    aggregated[trimmed] = (aggregated[trimmed] || 0) + (Number(value) || 0);
  }
  for (const base of BASE_LANGUAGES) {
    if (!Object.prototype.hasOwnProperty.call(aggregated, base)) {
      aggregated[base] = 0;
    }
  }
  return aggregated;
};