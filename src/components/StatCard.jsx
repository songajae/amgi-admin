// 역할: 대시보드에 표시될 각 통계 항목을 보여주는 카드 UI 컴포넌트입니다.
export default function StatCard({ title, value }) {
  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      {/* 카드 제목 (예: "총 유저 수") */}
      <div className="text-sm text-gray-500">{title}</div>
      {/* 카드 값 (예: 100) */}
      <div className="text-3xl font-bold">{value}</div>
    </div>
  );
}