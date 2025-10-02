// ==============================
// File: src/components/YoutubeFetchModal.jsx
// Role: 유튜브 ID 입력 → 제목/썸네일/자막 자동 가져오기 & 저장(추가/수정)
//       자막 텍스트는 "m:ss\n문장" 반복 형식으로 편집/저장
// ==============================

import { useEffect, useMemo, useState } from "react";

// 🔁 RESTORED + 🆕 NEW: 유튜브 API키 (권장: .env로 관리)
// CRA 기준 .env에 REACT_APP_YT_KEY=AIza... 형태로 넣어두고 아래처럼 읽어옵니다.
const YT_KEY = process.env.REACT_APP_YT_KEY || "YOUR_YOUTUBE_API_KEY";

export default function YoutubeFetchModal({
  open,
  onClose,
  chapterId,            // 기본 연결 챕터(doc id)
  setChapterId,         // 외부 상태 업데이트
  packs,                // 보이는 팩 목록
  chaptersByPack,       // { packId: Chapter[] }
  selectedPackId,       // 현재 선택된 팩(있을수도/없을수도)
  onSave,               // (payload, editingDocId) => void
  initial,              // 수정인 경우 기존 video 문서(없으면 추가)
}) {
  const [videoId, setVideoId] = useState(initial?.videoId || "");
  const [title, setTitle] = useState(initial?.title || "");
  const [thumbnail, setThumbnail] = useState(initial?.thumbnail || "");
  const [captionsText, setCaptionsText] = useState("");
  const [loading, setLoading] = useState(false);

  // 기본 챕터 연결
  useEffect(() => {
    if (!chapterId && selectedPackId) {
      const first = (chaptersByPack[selectedPackId] || [])[0];
      if (first) setChapterId(first.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPackId]);

  // 수정모드일 때 자막 텍스트 복원
  useEffect(() => {
    setVideoId(initial?.videoId || "");
    setTitle(initial?.title || "");
    setThumbnail(initial?.thumbnail || "");
    setCaptionsText(
      initial?.captions?.length
        ? initial.captions.map((c) => `${c.time}\n${c.text}`).join("\n")
        : ""
    );
  }, [initial]);

  const parsedCaptions = useMemo(() => {
    const lines = captionsText.split(/\r?\n/);
    const out = [];
    for (let i = 0; i < lines.length; ) {
      const t = (lines[i] || "").trim();
      const txt = (lines[i + 1] || "").trim();
      if (/^\d+:\d{2}$/.test(t) && txt) {
        out.push({ time: t, text: txt });
        i += 2;
      } else {
        i += 1;
      }
    }
    return out;
  }, [captionsText]);

  const fetchFromYoutube = async () => {
    if (!videoId) return;
    setLoading(true);
    try {
      // 제목/썸네일
      const meta = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${YT_KEY}`
      ).then((r) => r.json());

      const item = meta.items?.[0];
      if (!item) {
        alert("영상 정보를 불러올 수 없습니다.");
        return;
      }
      const s = item.snippet;
      setTitle(s.title || "");
      setThumbnail(s.thumbnails?.medium?.url || "");

      // 자막(ko 시도, 없으면 0줄)
      try {
        const sub = await fetch(
          `https://video.google.com/timedtext?v=${videoId}&lang=ko`
        ).then((r) => r.text());

        if (sub.includes("<transcript")) {
          const xml = new DOMParser().parseFromString(sub, "text/xml");
          const nodes = Array.from(xml.getElementsByTagName("text"));
          const lines = nodes
            .map((n) => {
              const start = parseFloat(n.getAttribute("start") || "0");
              const m = Math.floor(start / 60);
              const ss = Math.floor(start % 60).toString().padStart(2, "0");
              const time = `${m}:${ss}`;
              const text = n.textContent || "";
              return `${time}\n${text}`;
            })
            .join("\n");
          setCaptionsText(lines);
        } else {
          setCaptionsText("");
        }
      } catch (e) {
        // 무시
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!chapterId) {
      alert("연결할 챕터를 선택해주세요.");
      return;
    }
    const payload = {
      videoId,
      title,
      thumbnail,
      captions: parsedCaptions,
    };
    onSave?.(payload, initial?.id);
  };

  if (!open) return null;

  // 팩/챕터 선택 UI
  const packOptions = packs;
  const currentPackId =
    packOptions.find((p) =>
      (chaptersByPack[p.id] || []).some((ch) => ch.id === chapterId)
    )?.id || selectedPackId || packOptions[0]?.id;

  const currentChapters = currentPackId ? chaptersByPack[currentPackId] || [] : [];

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white w-full max-w-4xl rounded shadow">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <div className="font-semibold">{initial ? "영상 수정" : "영상 등록"}</div>
          <button onClick={onClose} className="text-gray-500 hover:text-black">✕</button>
        </div>

        <div className="p-4 space-y-4">
          {/* 연결 챕터 선택 (팩 → 챕터)  */}
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="text-sm text-gray-600">언어팩 선택</label>
              <select
                className="border px-3 py-2 rounded w-full"
                value={currentPackId || ""}
                onChange={(e) => {
                  const pid = e.target.value;
                  const first = (chaptersByPack[pid] || [])[0];
                  setChapterId(first?.id || "");
                }}
              >
                {packOptions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.language})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="text-sm text-gray-600">챕터 선택</label>
              <select
                className="border px-3 py-2 rounded w-full"
                value={chapterId || ""}
                onChange={(e) => setChapterId(e.target.value)}
              >
                {currentChapters.map((ch) => (
                  <option key={ch.id} value={ch.id}>
                    {(ch.chapterId ? `${ch.chapterId}. ` : "") + (ch.title || "")}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 유튜브 ID 불러오기 */}
          <div className="flex gap-2 items-center">
            <input
              className="border px-3 py-2 rounded flex-1"
              placeholder="유튜브 영상 ID 입력"
              value={videoId}
              onChange={(e) => setVideoId(e.target.value)}
            />
            <button
              onClick={fetchFromYoutube}
              disabled={loading}
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              {loading ? "불러오는 중..." : "불러오기"}
            </button>
          </div>

          {/* 제목/썸네일 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-600">제목</label>
              <input
                className="border px-3 py-2 rounded w-full"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="영상 제목"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">썸네일 URL</label>
              <input
                className="border px-3 py-2 rounded w-full"
                value={thumbnail}
                onChange={(e) => setThumbnail(e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div className="md:col-span-2">
              {thumbnail ? (
                <img
                  src={thumbnail}
                  alt="thumb"
                  className="w-64 h-36 object-cover rounded border"
                />
              ) : (
                <div className="w-64 h-36 border rounded text-gray-400 flex items-center justify-center">
                  썸네일 미리보기
                </div>
              )}
            </div>
          </div>

          {/* 자막 텍스트 */}
          <div>
            <label className="text-sm text-gray-600">
              자막 (형식: <code>m:ss</code> 줄 + 자막 줄, 반복)
            </label>
            <textarea
              className="border px-3 py-2 rounded w-full h-56 font-mono text-sm"
              value={captionsText}
              onChange={(e) => setCaptionsText(e.target.value)}
              placeholder={`0:04
하이 가이 코나고입니다. 원래 이럴
0:07
생각이 전혀 없었는데 ...`}
            />
            <div className="text-xs text-gray-500 mt-1">
              파싱된 자막 라인: {parsedCaptions.length}개
            </div>
          </div>
        </div>

        <div className="px-4 py-3 border-t flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded border">취소</button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
