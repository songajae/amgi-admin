// src/components/packs/Buttons.jsx
export function SolidBtn({ children, onClick, className = "", type = "button" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`px-3 py-1 rounded-md text-[12px] font-semibold text-white shadow-sm hover:opacity-95 ${className}`}
    >
      {children}
    </button>
  );
}

export function OutlineBtn({ children, onClick, className = "", type = "button" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`px-3 py-1 rounded-md text-[12px] font-semibold border hover:bg-gray-50 ${className}`}
    >
      {children}
    </button>
  );
}
