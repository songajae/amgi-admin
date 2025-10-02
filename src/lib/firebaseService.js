// ==============================
// File: src/lib/firebaseService.js
// Role: Firestore 외부의 상위 서비스 계층 (예: Callable Functions 연동 지점)
// Date: 2025-09-27 (신규)
// ==============================

// NOTE: 추후 필요시 getFunctions/httpsCallable 사용
// import { getFunctions, httpsCallable } from "firebase/functions";
// const functions = getFunctions();

/**
 * 예시: 관리자 권한 부여 (Callable)
 */
// export async function setAdminClaim(uid) {
//   const fn = httpsCallable(functions, "setAdminClaim");
//   const res = await fn({ uid });
//   return res.data;
// }

/**
 * 예시: 기기 강제 삭제 (서버 권한으로)
 */
// export async function forceDeleteDevice(docId) {
//   const fn = httpsCallable(functions, "forceDeleteDevice");
//   const res = await fn({ docId });
//   return res.data;
// }
