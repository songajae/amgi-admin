import React from "react";
import { STRINGS } from "../../constants/strings";

const baseClassName = "flex items-center justify-end gap-3 text-sm text-gray-600";
const defaultButtonClassName = "px-2 py-1 border rounded hover:bg-gray-50 disabled:opacity-40";

export default function PaginationFooter({
  page,
  perPage,
  total,
  onPageChange,
  className = "",
  buttonClassName = defaultButtonClassName,
}) {
  const lastPage = Math.max(1, Math.ceil((total || 0) / (perPage || 1)));
  const safePage = Math.min(Math.max(1, page || 1), lastPage);
  const hasItems = total > 0;
  const start = hasItems ? (safePage - 1) * perPage + 1 : 0;
  const end = hasItems ? Math.min(safePage * perPage, total) : 0;

  const containerClassName = className ? `${baseClassName} ${className}` : baseClassName;

  const changePage = (next) => {
    if (!onPageChange) return;
    const target = Math.min(Math.max(1, next), lastPage);
    if (target !== safePage) onPageChange(target);
  };

  return (
    <div className={containerClassName}>
      <span>{STRINGS.common.pagination.range(start, end, total)}</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className={buttonClassName}
          onClick={() => changePage(safePage - 1)}
          disabled={safePage === 1}
        >
          {STRINGS.common.buttons.prev}
        </button>
        <span>{STRINGS.common.pagination.pageLabel(safePage, lastPage)}</span>
        <button
          type="button"
          className={buttonClassName}
          onClick={() => changePage(safePage + 1)}
          disabled={safePage === lastPage}
        >
          {STRINGS.common.buttons.next}
        </button>
      </div>
    </div>
  );
}