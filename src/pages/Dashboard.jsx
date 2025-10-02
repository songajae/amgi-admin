// 역할: 로그인 후 가장 먼저 보이는 메인 화면으로, 전체 데이터 현황을 보여줍니다. (Firestore 연동 완료)
import { useEffect, useState } from 'react';
import StatCard from "../components/StatCard";
import { getUsers, getWordPacks, getVideos } from '../lib/firestore';
import LoadingBar from '../components/LoadingBar';

export default function Dashboard() {
  const [stats, setStats] = useState({ userCount: 0, packCount: 0, videoCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 비동기 함수를 만들어서 데이터 현황을 가져옵니다.
    const fetchStats = async () => {
      try {
        const users = await getUsers();
        const packs = await getWordPacks();
        const videos = await getVideos();
        setStats({
          userCount: users.length,
          packCount: packs.length,
          videoCount: videos.length,
        });
      } catch (error) {
        console.error("데이터 현황 로딩 실패:", error);
        alert("대시보드 정보를 불러오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []); // []는 컴포넌트가 처음 마운트될 때 한 번만 실행하라는 의미입니다.

  if(loading) return <LoadingBar show={true} />;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">대시보드</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="총 유저 수" value={stats.userCount} />
        <StatCard title="총 언어팩 수" value={stats.packCount} />
        <StatCard title="총 영상 수" value={stats.videoCount} />
      </div>
    </div>
  );
}