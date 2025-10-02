// ==============================
// File: src/components/utils/cryptoUtils.js
// Role: 브라우저 WebCrypto 기반 해시/암복호화 유틸 (에셋 무결성/테스트 목적)
// Date: 2025-09-27 (신규)
// ==============================

/**
 * 파일 SHA-256 해시(Base16)
 */
export async function sha256File(file) {
  const buf = await file.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", buf);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * AES-GCM 문자열 암호화/복호화 (테스트용)
 */
const enc = new TextEncoder();
const dec = new TextDecoder();

async function importKey(secret) {
  return crypto.subtle.importKey("raw", enc.encode(secret), "AES-GCM", false, ["encrypt", "decrypt"]);
}

export async function encryptText(text, secret) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await importKey(secret);
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(text));
  const packed = new Uint8Array(iv.byteLength + ct.byteLength);
  packed.set(iv, 0);
  packed.set(new Uint8Array(ct), iv.byteLength);
  return btoa(String.fromCharCode(...packed));
}

export async function decryptText(b64, secret) {
  const raw = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  const iv = raw.slice(0, 12);
  const data = raw.slice(12);
  const key = await importKey(secret);
  const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data);
  return dec.decode(pt);
}
