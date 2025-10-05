// ==============================
// File: src/components/users/UserRemovalModal.jsx
// Role: 유저 삭제 전 정보를 확인하는 모달 컴포넌트
// ==============================

import PropTypes from "prop-types";
import { STRINGS } from "../../constants/strings";
import { formatTimestamp, formatDateOnly } from "../../utils/date";
import { extractOwnedPackIds, makePackLabel, displayNameOf } from "../../utils/users";
import UserStatusBadge from "./UserStatusBadge";

export default function UserRemovalModal({
  user,
  packs,
  purchases,
  onClose,
  onConfirm,
  loading,
}) {
  if (!user) return null;

  const packMap = new Map(packs.map((pack) => [pack.id, pack]));
  const ownedPackIds = extractOwnedPackIds(user);

  return (
    <div className="fixed inset-0 z-40 bg-black/40 flex items-center justify-center" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6 space-y-4"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="space-y-1">
          <h2 className="text-xl font-semibold">{STRINGS.users.modals.deleteTitle}</h2>
          <p className="text-sm text-gray-500">{STRINGS.users.modals.deleteDescription}</p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div>
              <div className="text-xs text-gray-500">{STRINGS.users.modals.fields.name}</div>
              <div className="text-sm font-medium">{displayNameOf(user)}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">{STRINGS.users.modals.fields.email}</div>
              <div className="text-sm font-medium">{user.email || "-"}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">{STRINGS.users.modals.fields.status}</div>
              <UserStatusBadge status={user.accountStatus} />
            </div>
            <div>
              <div className="text-xs text-gray-500">{STRINGS.users.modals.fields.joinedAt}</div>
              <div className="text-sm">{formatDateOnly(user.createdAt)}</div>
            </div>
          </div>

          <div className="space-y-2">
            <div>
              <div className="text-xs text-gray-500">{STRINGS.users.modals.fields.lastUpdated}</div>
              <div className="text-sm">{formatTimestamp(user.accountStatus?.updatedAt)}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">{STRINGS.users.modals.fields.note}</div>
              <div className="text-sm text-gray-700 whitespace-pre-wrap min-h-[48px]">
                {user.accountStatus?.note || "-"}
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-semibold">{STRINGS.users.modals.ownedPacksLabel}</h3>
          {ownedPackIds.length === 0 ? (
            <p className="text-sm text-gray-500">{STRINGS.users.modals.noPacks}</p>
          ) : (
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
              {ownedPackIds.map((packId) => (
                <li key={packId}>{makePackLabel(packMap.get(packId)) || packId}</li>
              ))}
            </ul>
          )}
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-semibold">{STRINGS.users.modals.purchasesLabel}</h3>
          {purchases.length === 0 ? (
            <p className="text-sm text-gray-500">{STRINGS.users.modals.noPurchases}</p>
          ) : (
            <ul className="divide-y border rounded">
              {purchases.map((purchase) => (
                <li key={purchase.id} className="px-3 py-2 text-sm flex items-center justify-between">
                  <span>{makePackLabel(packMap.get(purchase.packId)) || purchase.packId}</span>
                  <span className="text-xs text-gray-500">{formatTimestamp(purchase.purchasedAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <footer className="flex justify-end gap-2">
          <button className="px-4 py-2 rounded border" onClick={onClose} disabled={loading}>
            {STRINGS.common.buttons.cancel}
          </button>
          <button
            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
            onClick={() => onConfirm(user)}
            disabled={loading}
          >
            {loading ? STRINGS.users.modals.deleting : STRINGS.users.modals.confirmDelete(displayNameOf(user))}
          </button>
        </footer>
      </div>
    </div>
  );
}

UserRemovalModal.propTypes = {
  user: PropTypes.object,
  packs: PropTypes.arrayOf(PropTypes.object),
  purchases: PropTypes.arrayOf(PropTypes.object),
  onClose: PropTypes.func,
  onConfirm: PropTypes.func,
  loading: PropTypes.bool,
};

UserRemovalModal.defaultProps = {
  user: null,
  packs: [],
  purchases: [],
  onClose: () => {},
  onConfirm: () => {},
  loading: false,
};
