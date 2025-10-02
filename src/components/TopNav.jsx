// 역할: 화면 상단에 항상 보이는 내비게이션 메뉴. 로그아웃 기능이 있습니다.
import { Link } from "react-router-dom";

export default function TopNav({ onLogout }) {
  return (
    <div className="w-full bg-white border-b border-gray-200 p-3 flex items-center justify-between shadow-sm sticky top-0 z-10">
      <div className="font-bold text-xl text-gray-800">암기 관리자</div>
      <nav className="flex items-center gap-4 text-sm">
        <Link className="text-gray-600 hover:text-blue-600 font-medium" to="/">대시보드</Link>
        <Link className="text-gray-600 hover:text-blue-600 font-medium" to="/users">유저 관리</Link>
        <Link className="text-gray-600 hover:text-blue-600 font-medium" to="/packs">언어팩 관리</Link>
        <Link className="text-gray-600 hover:text-blue-600 font-medium" to="/videos">영상 관리</Link>
        <Link className="text-gray-600 hover:text-blue-600 font-medium" to="/admins">계정 관리</Link>
        <button 
          onClick={onLogout} 
          className="bg-red-500 text-white px-3 py-1 rounded-md text-xs hover:bg-red-600 transition-colors"
        >
          로그아웃
        </button>
      </nav>
    </div>
  );
}