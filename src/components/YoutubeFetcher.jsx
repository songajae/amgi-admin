// ==============================
// File: src/components/YoutubeFetcher.jsx
// Role: 유튜브 영상ID 입력 → 제목/썸네일/자막 자동 불러오기, 저장 콜백(onSaved)
// ==============================

import { useState } from "react";

const API_KEY = "YOUR_YOUTUBE_API_KEY"; // YouTube Data API v3 키

export default function YoutubeFetcher({ onSaved, helperText }) {
  const [videoId, setVideoId] = useState("");
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  async function fetchInfo() {
    if (!videoId) return;
    setLoading(true);

    try {
      // 제목/썸네일
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${API_KEY}`
      );
      const data = await res.json();
      if (!data.items || data.items.length === 0) {
        alert("영상 정보를 불러올 수 없습니다.");
        return;
      }
      const s = data.items[0].snippet;
      const result = {
        videoId,
        title: s.title,
        thumbnail: s.thumbnails?.medium?.url || "",
        captions: [],
      };

      // 자막(ko가 없으면 시도만 하고 실패해도 무시)
      try {
        const subRes = await fetch(
          `https://video.google.com/timedtext?v=${videoId}&lang=ko`
        );
        const subText = await subRes.text();
        if (subText.includes("<transcript")) {
          const parser = new DOMParser();
          const xml = parser.parseFromString(subText, "text/xml");
          const texts = Array.from(xml.getElementsByTagName("text"));
          result.captions = texts.map((t) => {
            const start = parseFloat(t.getAttribute("start") || "0");
            const m = Math.floor(start / 60);
            const s = Math.floor(start % 60).toString().padStart(2, "0");
            return { time: `${m}:${s}`, text: t.textContent || "" };
          });
        }
      } catch (e) {
        // ignore
      }

      setInfo(result);
    } finally {
      setLoading(false);
    }
  }

  function handleSave() {
    if (!info) return;
    if (onSaved) onSaved(info);
    setVideoId("");
    setInfo(null);
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2 items-center">
        <input
          className="border px-3 py-2 rounded flex-1"
          placeholder="유튜브 영상 ID 입력"
          value={videoId}
          onChange={(e) => setVideoId(e.target.value)}
        />
        <button
          onClick={fetchInfo}
          disabled={loading}
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          {loading ? "불러오는 중..." : "불러오기"}
        </button>
        {info && (
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700"
          >
            저장
          </button>
        )}
      </div>
      {helperText && <div className="text-xs text-gray-500">{helperText}</div>}

      {info && (
        <div className="flex gap-4 items-start mt-2">
          <img
            src={info.thumbnail}
            alt="thumb"
            className="w-40 h-24 object-cover rounded border"
          />
          <div>
            <div className="font-semibold">{info.title}</div>
            <div className="text-xs text-gray-500">영상 ID: {info.videoId}</div>
            <div className="text-xs text-gray-500">
              자막 {info.captions?.length || 0}줄
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
