// 역할: 데이터 로딩 중에 "Loading..." 메시지를 보여주는 간단한 UI 컴포넌트입니다.
export default function LoadingBar({ show }) {
  // show 프롭스가 false이면 아무것도 보여주지 않습니다.
  if (!show) return null;
  
  // show 프롭스가 true이면 로딩 메시지를 보여줍니다.
  return <div className="w-full text-center py-4 text-sm text-gray-600">Loading...</div>;
}