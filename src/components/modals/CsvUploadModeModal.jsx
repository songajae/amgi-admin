// ==============================
// File: src/components/modals/CsvUploadModeModal.jsx
// Role: 언어팩 CSV 업로드 시 덮어쓰기/추가 방식을 선택하는 전용 모달
// ==============================

import PropTypes from "prop-types";

import ModalShell from "./ModalShell";
import { STRINGS } from "../../constants/strings";

export default function CsvUploadModeModal({ onClose, onOverwrite, onAppend }) {
  return (
    <ModalShell
      title={STRINGS.packsPage.csv.uploadModeTitle}
      description={STRINGS.packsPage.csv.uploadModeDescription}
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-300"
          >
            {STRINGS.common.buttons.cancel}
          </button>
          <button
            type="button"
            onClick={onOverwrite}
            className="rounded-md bg-yellow-500 px-4 py-2 text-sm font-semibold text-white hover:bg-yellow-600"
          >
            {STRINGS.packsPage.csv.overwrite}
          </button>
          <button
            type="button"
            onClick={onAppend}
            className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
          >
            {STRINGS.packsPage.csv.append}
          </button>
        </>
      }
    >
      <div />
    </ModalShell>
  );
}

CsvUploadModeModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onOverwrite: PropTypes.func.isRequired,
  onAppend: PropTypes.func.isRequired,
};