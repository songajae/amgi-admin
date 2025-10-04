// ==============================
// File: src/components/modals/ModalShell.jsx
// Role: 공통 모달 레이아웃 (헤더/본문/푸터) 래퍼 컴포넌트
// ==============================

import PropTypes from "prop-types";

export default function ModalShell({ title, description, onClose, children, footer }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            {description && (
              <p className="mt-1 text-sm text-slate-500 whitespace-pre-line">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
            aria-label="close"
          >
            ×
          </button>
        </div>

        <div className="text-sm text-slate-700">{children}</div>

        {footer && <div className="mt-6 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}

ModalShell.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  footer: PropTypes.node,
};