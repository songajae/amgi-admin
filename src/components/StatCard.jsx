// 역할: 대시보드에 표시될 각 통계 항목을 보여주는 카드 UI 컴포넌트입니다.
export default function StatCard({ title, value, onClick }) {
  const isClickable = typeof onClick === "function";
  const baseClass = "border rounded-lg p-4 bg-white shadow-sm";
  const clickableClass =
    "cursor-pointer transition hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white";

  const handleKeyDown = (event) => {
    if (!isClickable) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick();
    }
  };
  return (
    <div
      className={`${baseClass} ${isClickable ? clickableClass : ""}`.trim()}
      onClick={isClickable ? onClick : undefined}
      onKeyDown={handleKeyDown}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      aria-label={isClickable ? `${title} 바로가기` : undefined}
    >
      {/* 카드 제목 (예: "총 유저 수") */}
      <div className="text-sm text-gray-500">{title}</div>
      {/* 카드 값 (예: 100) */}
      <div className="text-3xl font-bold">{value}</div>
    </div>
  );
}