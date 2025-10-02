// ==============================
// File: src/lib/db.js
// Role: 로컬 스토리지 기반의 초간단 KV 헬퍼 (관리자 인증/캐시)
// Date: 2025-09-27 (신규)
// ==============================

const NS = "amgi_admin:";

export function kvSet(key, value) {
  try {
    localStorage.setItem(NS + key, JSON.stringify(value));
  } catch {}
}

export function kvGet(key, fallback = null) {
  try {
    const s = localStorage.getItem(NS + key);
    return s ? JSON.parse(s) : fallback;
  } catch {
    return fallback;
  }
}

export function kvDel(key) {
  try {
    localStorage.removeItem(NS + key);
  } catch {}
}
