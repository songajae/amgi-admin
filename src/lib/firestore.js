// ==============================
// File: src/lib/firestore.js
// Role: Firestore CRUD 유틸 (word_packs/{packId}/chapters 하위 컬렉션 사용)
// ==============================

import { db } from "./firebase";
import {
  collection,
  getDocs,
  getDoc,            // [2025-09-27 PATCH]
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

// 안전 래퍼
async function safeGetDocs(colRefOrQuery) {
  const snap = await getDocs(colRefOrQuery);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// Admins
export const getAdmins = async () => safeGetDocs(col("admins"));
export const addAdmin = (data) => addDoc(col("admins"), data);
export const updateAdmin = (id, data) => setDoc(byId("admins", id), data, { merge: true });
export const deleteAdmin = (id) => deleteDoc(byId("admins", id));

// Users
export const getUsers = async () => safeGetDocs(col("users"));
export const getUserById = async (id) => {               // [2025-09-27 PATCH]
  const snap = await getDoc(byId("users", id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};
export const addUser = (data) => addDoc(col("users"), data);
export const updateUser = (id, data) => setDoc(byId("users", id), data, { merge: true });
export const deleteUser = (id) => deleteDoc(byId("users", id));

// Word Packs
export const getWordPacks = async () => safeGetDocs(col("word_packs"));
export const addWordPack = (data) => addDoc(col("word_packs"), data);
export const updateWordPack = (id, data) => setDoc(byId("word_packs", id), data, { merge: true });
export const deleteWordPack = (id) => deleteDoc(byId("word_packs", id));

// Chapters (하위 컬렉션)
export const getChaptersByPack = async (packId) => {
  const chaptersCol = collection(db, `word_packs/${packId}/chapters`);
  const list = await safeGetDocs(query(chaptersCol));
  const normalized = list.map((item) => {
    const chapter = item.chapter ?? item.chapterId ?? item.id;
    return { ...item, id: chapter, chapter };
  });
  return normalized.sort((a, b) => {
    const ao = a.order ?? 9999;
    const bo = b.order ?? 9999;
    if (ao !== bo) return ao - bo;
    return (a.chapter || "").localeCompare(b.chapter || "");
  });
};
export const upsertChapter = async (packId, chapter, data) => {
  const chaptersCol = collection(db, `word_packs/${packId}/chapters`);
  if (!chapter) throw new Error("chapter is required");
  await setDoc(doc(chaptersCol, chapter), { ...data, chapter }, { merge: true });
  return chapter;
};
export const deleteChapter = async (packId, chapter) => {
  const chaptersCol = collection(db, `word_packs/${packId}/chapters`);
  await deleteDoc(doc(chaptersCol, chapter));
};

// Videos
export const getVideos = async () => safeGetDocs(col("packsYoutube"));
export const addVideo = (data) => addDoc(col("packsYoutube"), data);
export const updateVideo = (id, data) => setDoc(byId("packsYoutube", id), data, { merge: true });
export const deleteVideo = (id) => deleteDoc(byId("packsYoutube", id));

// Devices (user_devices)
export const getDevicesByUser = async (userId) => {
  const qy = query(col("user_devices"), where("userId", "==", userId));
  return safeGetDocs(qy);
};
export const deleteDevice = async (docId) => deleteDoc(byId("user_devices", docId));

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
  // A) users/{id}.ownedPacks 필드 업데이트
  await setDoc(byId("users", userId), { ownedPacks: packIds }, { merge: true });

  // B) user_purchases 동기화 (단순화: 기존 것을 지우고 다시 쓰기)
  //    규모가 커지면 서버 함수로 마이그레이션 권장
  const purchases = await safeGetDocs(query(col("user_purchases"), where("userId", "==", userId)));
  // 삭제
  await Promise.all(purchases.map((p) => deleteDoc(byId("user_purchases", p.id))));
  // 추가
  const now = Date.now();
  await Promise.all(
    (packIds || []).map((pid) =>
      addDoc(col("user_purchases"), {
        userId,
        packId: pid,
        purchasedAt: now,
        version: 1,
      })
    )
  );
}
