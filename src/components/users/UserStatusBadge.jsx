// ==============================
// File: src/components/users/UserStatusBadge.jsx
// Role: 유저 상태(활성/탈퇴/삭제 예정)를 시각적으로 표시하는 배지 컴포넌트
// ==============================

import PropTypes from "prop-types";
import { STRINGS } from "../../constants/strings";
import { formatDateOnly } from "../../utils/date";

// [수정] 상태값에 따라 배지 색상을 매핑한다.
const toneByState = {
  active: "bg-green-100 text-green-700 border-green-200",
  withdrawn: "bg-yellow-100 text-yellow-700 border-yellow-200",
  deleted: "bg-red-100 text-red-700 border-red-200",
};

export default function UserStatusBadge({ status }) {
  const state = status?.state || "active";
  const label = STRINGS.users.statuses[state] || STRINGS.users.statuses.active;
  const scheduledLabel = status?.scheduledDeletionAt
    ? STRINGS.users.statusBadges.scheduledDeletion(formatDateOnly(status.scheduledDeletionAt))
    : null;

  return (
    <div className="flex flex-col items-start gap-1">
      <span
        className={`inline-flex items-center gap-2 px-2 py-1 border rounded text-xs font-medium ${
          toneByState[state] || toneByState.active
        }`}
      >
        {label}
      </span>
      {scheduledLabel && <span className="text-[11px] text-gray-500">{scheduledLabel}</span>}
    </div>
  );
}

UserStatusBadge.propTypes = {
  status: PropTypes.shape({
    state: PropTypes.string,
    updatedAt: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    note: PropTypes.string,
    scheduledDeletionAt: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  }),
};

UserStatusBadge.defaultProps = {
  status: { state: "active" },
};
