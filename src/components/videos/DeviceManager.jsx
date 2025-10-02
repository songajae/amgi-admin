// ==============================
// File: src/components/videos/DeviceManager.jsx
// Role: 사용자별 등록 기기 조회/슬롯 삭제 (user_devices)
// Note:
//   - 상위에서 selectedUser 객체를 전달하면 자동으로 목록을 조회하여 표시
//   - 제목: "{이름} 님 기기관리 (n/5대)"
//   - 번호(#) 컬럼 포함
//   - userId 입력/조회 버튼 없음 (행 선택만으로 동작)
// ------------------------------
// Changelog:
//   [2025-09-27 PATCH] 입력/조회 UI 제거, selectedUser 연동/자동조회, 제목 표기
// ==============================

import { useEffect, useMemo, useState } from "react";
import LoadingBar from "../LoadingBar";
import { getDevicesByUser, deleteDevice } from "../../lib/firestore";

const MAX_DEVICES = 5;

export default function DeviceManager({ selectedUser = null }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const userName = useMemo(() => {
    if (!selectedUser) return "";
    return selectedUser.displayName || selectedUser.name || selectedUser.email || selectedUser.id || "";
  }, [selectedUser]);

  // 유저 변경 시 자동 조회
  useEffect(() => {
    (async () => {
      if (!selectedUser?.id) {
        setRows([]);
        return;
      }
      setLoading(true);
      try {
        const list = await getDevicesByUser(selectedUser.id);
        setRows(list);
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedUser]);

  const onDelete = async (docId) => {
    if (!window.confirm("해당 기기를 삭제(슬롯 확보)하시겠습니까?")) return;
    await deleteDevice(docId);
    if (selectedUser?.id) {
      setLoading(true);
      try {
        const list = await getDevicesByUser(selectedUser.id);
        setRows(list);
      } finally {
        setLoading(false);
      }
    }
  };

  if (!selectedUser) {
    return (
      <div className="border rounded bg-white p-4 text-sm text-gray-600">
        목록에서 사용자를 선택하면 기기 목록이 표시됩니다.
      </div>
    );
  }

  const count = rows.length;
  return (
    <div className="border rounded bg-white p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">
          {userName} 님 기기관리 ({count}/{MAX_DEVICES}대)
        </h3>
      </div>

      <LoadingBar show={loading} />

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr className="text-left">
              <th className="px-3 py-2">#</th>
              <th className="px-3 py-2">docId</th>
              <th className="px-3 py-2">userId</th>
              <th className="px-3 py-2">deviceId</th>
              <th className="px-3 py-2">model</th>
              <th className="px-3 py-2">registeredAt</th>
              <th className="px-3 py-2 text-center">액션</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.length === 0 ? (
              <tr>
                <td className="px-3 py-10 text-center text-gray-500" colSpan={7}>
                  결과가 없습니다.
                </td>
              </tr>
            ) : (
              rows.map((r, idx) => (
                <tr key={r.id}>
                  <td className="px-3 py-2">{idx + 1}</td>
                  <td className="px-3 py-2">{r.id}</td>
                  <td className="px-3 py-2">{r.userId}</td>
                  <td className="px-3 py-2">{r.deviceId}</td>
                  <td className="px-3 py-2">{r.model}</td>
                  <td className="px-3 py-2">{r.registeredAt}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center justify-center">
                      <button
                        className="px-2 py-1 rounded bg-red-600 text-white text-xs hover:bg-red-700"
                        onClick={() => onDelete(r.id)}
                      >
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
