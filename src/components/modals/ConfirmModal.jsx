// ==============================
// File: src/components/modals/ConfirmModal.jsx
// Role: 확인/취소 액션을 제공하는 공용 확인 모달
// ==============================

import { useState } from "react";
import PropTypes from "prop-types";

import ModalShell from "./ModalShell";
import { STRINGS } from "../../constants/strings";

const BUTTON_TONES = {
  primary: "bg-blue-600 hover:bg-blue-700",
  danger: "bg-red-600 hover:bg-red-700",
};

export default function ConfirmModal({
  title,
  description,
  confirmLabel = STRINGS.common.buttons.confirm,
  cancelLabel = STRINGS.common.buttons.cancel,
  confirmTone = "primary",
  onConfirm,
  onCancel,
}) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (loading) return;
    try {
      setLoading(true);
      const result = await onConfirm?.();
      if (result !== false) {
        onCancel?.();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalShell
      title={title}
      description={description}
      onClose={onCancel}
      footer={
        <>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-300"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={`rounded-md px-4 py-2 text-sm font-semibold text-white ${BUTTON_TONES[confirmTone] || BUTTON_TONES.primary}`}
            disabled={loading}
          >
            {loading ? "..." : confirmLabel}
          </button>
        </>
      }
    >
      {/* 확인 모달은 본문 컨텐츠가 필요 없으므로 빈 div 반환 */}
      <div />
    </ModalShell>
  );
}

ConfirmModal.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  confirmLabel: PropTypes.string,
  cancelLabel: PropTypes.string,
  confirmTone: PropTypes.oneOf(["primary", "danger"]),
  onConfirm: PropTypes.func,
  onCancel: PropTypes.func,
};