// ==============================
// File: src/components/users/UserRowActions.jsx
// Role: 유저 리스트 행에서 사용되는 액션 버튼 묶음
// ==============================

import PropTypes from "prop-types";
import { STRINGS } from "../../constants/strings";

export default function UserRowActions({
  onEdit,
  onWithdraw,
  onDelete,
}) {
  return (
    <div className="flex items-center gap-2 justify-center">
      <button className="px-2 py-1 border rounded hover:bg-gray-100" onClick={onEdit}>
        {STRINGS.common.buttons.edit}
      </button>
      <button className="px-2 py-1 border rounded text-yellow-700 border-yellow-300 hover:bg-yellow-50" onClick={onWithdraw}>
        {STRINGS.users.buttons.withdraw}
      </button>
      <button className="px-2 py-1 border rounded bg-red-600 text-white hover:bg-red-700" onClick={onDelete}>
        {STRINGS.users.buttons.delete}
      </button>
    </div>
  );
}

UserRowActions.propTypes = {
  onEdit: PropTypes.func,
  onWithdraw: PropTypes.func,
  onDelete: PropTypes.func,
};

UserRowActions.defaultProps = {
  onEdit: () => {},
  onWithdraw: () => {},
  onDelete: () => {},
};
