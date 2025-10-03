// 역할: Firebase 프로젝트와 우리 리액트 앱을 연결하는 설정 파일입니다.
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// 환경 변수에서 Firebase 설정 정보를 가져옵니다.
// .env 파일에 저장된 값들을 process.env를 통해 참조합니다.
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Firebase 앱을 초기화합니다.
const app = initializeApp(firebaseConfig);

// Firestore 데이터베이스 인스턴스를 가져와서 다른 파일에서 쓸 수 있도록 export 합니다.
export const db = getFirestore(app);
