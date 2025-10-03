// ==============================
// File: src/lib/firestore.js
// Role: Firestore CRUD 유틸 (word_packs/{packId}/chapters 하위 컬렉션 사용)
// ==============================

import { db } from "./firebase";
import {
  collection,
  getDocs,
  getDoc, // [2025-09-27 PATCH]
  doc,
  setDoc,
  addDoc,
  deleteDoc,
  query,
  where,

} from "firebase/firestore";

// 공용
const col = (name) => collection(db, name);
const byId = (name, id) => doc(db, name, id);
export const uid = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

// Firestore 호출이 너무 오래 걸릴 때를 대비한 안전장치
const FIRESTORE_TIMEOUT_MS = 8000;
const withTimeout = (promise, ms = FIRESTORE_TIMEOUT_MS, message = "Firestore request timed out") =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(message)), ms)
    ),
  ]);

// 안전 래퍼
async function safeGetDocs(colRefOrQuery) {
  const snap = await withTimeout(getDocs(colRefOrQuery));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// Admins
export const getAdmins = async () => safeGetDocs(col("admins"));
export const addAdmin = (data) => addDoc(col("admins"), data);
export const updateAdmin = (id, data) => setDoc(byId("admins", id), data, { merge: true });
export const deleteAdmin = (id) => deleteDoc(byId("admins", id));

// Users
export const getUsers = async () => safeGetDocs(col("users"));
export const getUserById = async (id) => {
  const snap = await withTimeout(getDoc(byId("users", id))); // [2025-09-27 PATCH]
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};
export const addUser = (data) => addDoc(col("users"), data);
export const updateUser = (id, data) => setDoc(byId("users", id), data, { merge: true });
export const deleteUser = (id) => deleteDoc(byId("users", id));

// Word Packs
export const getWordPacks = async () => {
  const list = await safeGetDocs(col("word_packs"));
  return list.map((item) => {
    const wordPackId = item.wordPackId ?? item.id;
    return { ...item, wordPackId, id: item.id };
  });
};
export const addWordPack = async (data) => {
  const wordPackId = uid("wordPack");
  const docRef = byId("word_packs", wordPackId);
  await setDoc(docRef, { ...data, wordPackId });
  return { id: wordPackId, wordPackId };
};
export const updateWordPack = (id, data) =>
  setDoc(byId("word_packs", id), { ...data, wordPackId: id }, { merge: true });
export const deleteWordPack = (id) => deleteDoc(byId("word_packs", id));

// Chapters (하위 컬렉션)
export const getChaptersByPack = async (packId) => {
  const chaptersCol = collection(db, `word_packs/${packId}/chapters`);
  const list = await safeGetDocs(query(chaptersCol));
  const normalized = list.map((item) => {
    const chapterId = item.chapterId ?? item.id;
    const chapter = item.chapter ?? item.chapterKey ?? item.id;
    return { ...item, id: chapterId, chapter, chapterId };
  });
  return normalized.sort((a, b) => {
    const ao = a.order ?? 9999;
    const bo = b.order ?? 9999;
    if (ao !== bo) return ao - bo;
    return (a.chapter || "").localeCompare(b.chapter || "");
  });
};
export const upsertChapter = async (packId, chapterId, data = {}) => {
  const chaptersCol = collection(db, `word_packs/${packId}/chapters`);
  const resolvedId = chapterId || uid("chapter");
  await setDoc(doc(chaptersCol, resolvedId), { ...data, chapterId: resolvedId }, { merge: true });
  return resolvedId;
};
export const deleteChapter = async (packId, chapterId) => {
  const chaptersCol = collection(db, `word_packs/${packId}/chapters`);
  await deleteDoc(doc(chaptersCol, chapterId));
};

// Videos
export const getVideos = async () => safeGetDocs(col("packsYoutube"));
export const addVideo = (data) => addDoc(col("packsYoutube"), data);
export const updateVideo = (id, data) => setDoc(byId("packsYoutube", id), data, { merge: true });
export const deleteVideo = (id) => deleteDoc(byId("packsYoutube", id));

// Devices (user_devices)
export const getDevicesByUser = async (userId) => {
  const qy = query(col("device_registry"), where("userId", "==", userId));  // user_devices → device_registry
  return safeGetDocs(qy);
};
export const deleteDevice = async (docId) => deleteDoc(byId("device_registry", docId));

/* ============================================
   [2025-09-27 PATCH]
   유저 보유 팩 저장(setUserOwnedPacks)
   - 저장 위치 1: user_purchases 컬렉션 (flat)
       docId 규칙 예: `${userId}_${packId}`
   - 저장 위치 2: users/{id}.ownedPacks 필드
   프로젝트 정책에 맞게 한쪽만 써도 되고, 둘 다 써도 됨.
   아래 함수는 둘 다 동기화하도록 구현.
   ============================================ */
export async function setUserOwnedPacks(userId, packIds = []) {
  const normalized = Array.isArray(packIds) ? packIds.filter(Boolean) : [];
  const hasPacks = normalized.length > 0;

  // A) users/{id}.ownedPacks 필드 업데이트 (없으면 null 저장)
  await setDoc(
    byId("users", userId),
    { ownedPacks: hasPacks ? normalized : null },
    { merge: true }
  );

  // B) user_purchases 동기화 (단순화: 기존 것을 지우고 다시 쓰기)
  //    규모가 커지면 서버 함수로 마이그레이션 권장
  const purchases = await safeGetDocs(query(col("user_purchases"), where("userId", "==", userId)));
  // 삭제
  await Promise.all(purchases.map((p) => deleteDoc(byId("user_purchases", p.id))));
   if (!hasPacks) {
    return;
  }

  // 추가
  const now = Date.now();
  await Promise.all(
    normalized.map((pid) =>
      addDoc(col("user_purchases"), {
        userId,
        packId: pid,
        purchasedAt: now,
        version: 1,
      })
    )
  );
}
