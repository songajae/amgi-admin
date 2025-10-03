// 역할: 화면 상단에 항상 보이는 내비게이션 메뉴. 로그아웃 기능이 있습니다.
import { NavLink } from "react-router-dom";

export default function TopNav({ onLogout }) {
  const menuItems = [
    { to: "/", label: "대시보드", end: true },
    { to: "/users", label: "유저 관리" },
    { to: "/packs", label: "언어팩 관리" },
    { to: "/videos", label: "영상 관리" },
    { to: "/admins", label: "계정 관리" },
  ];

  const getLinkClasses = ({ isActive }) =>
    `font-medium px-3 py-1 rounded-md transition-colors ${
      isActive
        ? "bg-blue-100 text-blue-600"
        : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
    }`;


  return (
    <div className="w-full bg-white border-b border-gray-200 p-3 flex items-center justify-between shadow-sm sticky top-0 z-10">
      <div className="font-bold text-xl text-gray-800">암기 관리자</div>
      <nav className="flex items-center gap-4 text-sm">
        {menuItems.map(({ to, label, end }) => (
          <NavLink key={to} to={to} end={end} className={getLinkClasses}>
            {label}
          </NavLink>
        ))}
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