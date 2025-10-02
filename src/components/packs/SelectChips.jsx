// src/components/packs/SelectChips.jsx
export default function SelectChips({
  items = [],               // 문자열 배열 or {id,label,sub}[]
  value,                    // 선택값(문자열)
  onChange,                 // (val)=>void
  getKey = (x) => x.id ?? x,
  getLabel = (x) => x.label ?? x,
  getSub = (x) => x.sub,    // 보조 라벨(예: (free/paid))
  activeClass = "bg-amber-100 border-amber-300 text-amber-900",
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.length === 0 ? (
        <span className="text-gray-500 text-sm">항목이 없습니다.</span>
      ) : (
        items.map((item) => {
          const key = getKey(item);
          const label = getLabel(item);
          const sub = getSub(item);
          const active = value === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange?.(key)}
              className={`px-3 py-1 rounded-md text-sm border font-semibold ${
                active ? activeClass : "bg-white hover:bg-gray-50"
              }`}
            >
              {label}
              {sub ? <span className="ml-2 text-xs text-gray-500">({sub})</span> : null}
            </button>
          );
        })
      )}
    </div>
  );
}
