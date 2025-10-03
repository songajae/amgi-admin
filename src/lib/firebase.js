// 역할: Firebase 프로젝트와 우리 리액트 앱을 연결하는 설정 파일입니다.
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// 환경 변수에서 Firebase 설정 정보를 가져옵니다.
// .env 파일에 저장된 값들을 process.env를 통해 참조합니다.
const firebaseConfig = {
  apiKey: "AIzaSyBzHX_vERtP6jFrHmw5b6TDS4-z4Sb8HkI",
  authDomain: "amgi-admin-79734.firebaseapp.com",
  projectId: "amgi-admin-79734",
  storageBucket: "amgi-admin-79734.firebasestorage.app",
  messagingSenderId: "623762990339",
  appId: "1:623762990339:web:a7aedd437f069535bd7536"
};

// Firebase 앱을 초기화합니다.
const app = initializeApp(firebaseConfig);

// Firestore 데이터베이스 인스턴스를 가져와서 다른 파일에서 쓸 수 있도록 export 합니다.
export const db = getFirestore(app);
