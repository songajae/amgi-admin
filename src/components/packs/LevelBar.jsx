// src/components/packs/LevelBar.jsx
import React from "react";

/**
 * actions: [{ label, onClick, variant?: 'solid'|'outline', className?: string }]
 * color  : Tailwind 배경색 클래스 (예: 'bg-orange-500', 'bg-amber-300')
 */
export default function LevelBar({
  title,
  color = "bg-gray-100",
  actions = [],
  children,
}) {
  const isDark =
    color.includes("500") ||
    color.includes("600") ||
    color.includes("700") ||
    color.includes("800") ||
    color.includes("900") ||
    color.includes("black");

  const titleColor = isDark ? "text-white" : "text-gray-900";

  return (
    <div className="rounded-md overflow-hidden shadow-sm mb-3 border">
      {/* 상단 바: 제목 + 액션 */}
      <div className={`flex items-center justify-between px-4 py-2 ${color}`}>
        {/* ✅ 한 줄 고정 + 넘치면 말줄임 */}
        <div
          className={`font-bold ${titleColor} whitespace-nowrap truncate`}
          title={title}
        >
          {title}
        </div>

        <div className="flex items-center gap-1">
          {actions.map((a, i) =>
            a.variant === "solid" ? (
              <button
                key={i}
                type="button"
                onClick={a.onClick}
                className={`px-3 py-1 rounded-md text-[12px] font-semibold text-white shadow-sm hover:opacity-95 ${a.className || "bg-blue-600"}`}
              >
                {a.label}
              </button>
            ) : (
              <button
                key={i}
                type="button"
                onClick={a.onClick}
                className={`px-3 py-1 rounded-md text-[12px] font-semibold border hover:bg-white/10 ${
                  a.className ||
                  (isDark ? "border-white text-white" : "border-gray-300 text-gray-800")
                }`}
              >
                {a.label}
              </button>
            )
          )}
        </div>
      </div>

      {/* 하단: 자유 컨텐츠 */}
      <div className="bg-white px-4 py-2">{children}</div>
    </div>
  );
}
