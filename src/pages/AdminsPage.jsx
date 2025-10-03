// 역할: 관리자 계정을 추가, 수정, 삭제하는 페이지입니다. (Firestore 연동 완료)
import { useEffect, useState } from "react";
import LoadingBar from "../components/LoadingBar";
import { getAdmins, addAdmin, updateAdmin, deleteAdmin } from "../lib/firestore";

export default function AdminsPage() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  // Firestore에서 데이터를 다시 불러오는 함수
  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const adminList = await getAdmins();
      setAdmins(adminList);
    } catch (error) {
      console.error("관리자 목록을 불러오지 못했습니다.", error);
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  };

  // 페이지가 처음 로드될 때 관리자 목록을 불러옵니다.
  useEffect(() => {
    fetchAdmins();
  }, []);

  // 관리자 추가 버튼 클릭 시
  const handleAddAdmin = async () => {
    const username = prompt("새 관리자 아이디");
    if (!username) return;
    const password = prompt("비밀번호", "0000");
    if (!password) return;
    
    await addAdmin({ username, password });
    fetchAdmins(); // 목록 새로고침
  };

  // 변경 버튼 클릭 시
  const handleChangeAdmin = async (admin) => {
    const username = prompt("아이디 변경", admin.username) || admin.username;
    const password = prompt("비밀번호 변경", admin.password) || admin.password;
    
    await updateAdmin(admin.id, { username, password });
    fetchAdmins(); // 목록 새로고침
  };

  // 삭제 버튼 클릭 시
  const handleDeleteAdmin = async (admin) => {
    if (!window.confirm(`'${admin.username}' 관리자를 삭제하시겠습니까?`)) return;
    
    await deleteAdmin(admin.id);
    fetchAdmins(); // 목록 새로고침
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">관리자 계정 관리</h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" onClick={handleAddAdmin}>
          관리자 추가
        </button>
      </div>
      <LoadingBar show={loading} />
      <div className="space-y-2">
        {admins.map((a) => (
          <div key={a.id} className="border rounded p-3 flex items-center justify-between bg-white shadow-sm">
            <div>
              <div className="font-medium">{a.username}</div>
              <div className="text-sm text-gray-500">PW: {a.password}</div>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1 border rounded text-sm hover:bg-gray-50" onClick={() => handleChangeAdmin(a)}>
                변경
              </button>
              <button className="px-3 py-1 border rounded text-sm bg-red-500 text-white hover:bg-red-600" onClick={() => handleDeleteAdmin(a)}>
                삭제
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}