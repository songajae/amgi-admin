// ==============================
// File: src/components/videos/VideoEditorModal.jsx
// Role: 유튜브 영상 추가/수정 모달 (ID → 제목/썸네일/자막 자동 수집; YouTube Data API 미사용)
// ==============================

import { useEffect, useMemo, useState } from "react";

/** mm:ss -> seconds */
function parseTimeToSec(t) {
  const parts = t.trim().split(":").map(Number);
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  return Number(t) || 0;
}

/** seconds -> m:ss */
function secToStamp(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** 자막 편집 텍스트를 [{time,text}] 배열로 변환 */
function parseSubtitleText(raw) {
  // 기대 형식:
  // 0:04
  // 안녕하세요
  // 0:07
  // 다음 줄...
  const lines = (raw || "").split(/\r?\n/);
  const result = [];
  let current = null;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    // 타임스탬프 라인?
    if (/^\d+:\d{2}(:\d{2})?$/.test(trimmed)) {
      current = { time: parseTimeToSec(trimmed), text: "" };
      result.push(current);
    } else if (current) {
      current.text = current.text ? current.text + " " + trimmed : trimmed;
    }
  }
  return result;
}

/** [{time,text}] → 편집 텍스트 */
function packSubtitleText(arr) {
  return (arr || [])
    .map((x) => `${secToStamp(x.time)}\n${x.text || ""}`)
    .join("\n");
}

/** 공개 썸네일 */
function ytThumbUrl(id) {
  if (!id) return "";
  return `https://img.youtube.com/vi/${id}/default.jpg`;
}

/** oEmbed(공식 Data API 아님)로 제목 가져오기 → 실패시 noembed도 시도 */
async function fetchTitleByOEmbed(videoId) {
  const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
  try {
    const r = await fetch(url);
    if (r.ok) {
      const j = await r.json();
      return j.title || "";
    }
  } catch (_) {}
  // noembed fallback
  try {
    const r = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`);
    if (r.ok) {
      const j = await r.json();
      return j.title || "";
    }
  } catch (_) {}
  return "";
}

/** YouTube timedtext(공식 API 아님) 시도: ko → en → 자동 */
async function fetchTimedText(videoId) {
  const tryLangs = ["ko", "ko-KR", "en", "en-US", "a.en", "a.ko"];
  for (const lang of tryLangs) {
    try {
      const u = `https://www.youtube.com/api/timedtext?lang=${encodeURIComponent(lang)}&v=${encodeURIComponent(
        videoId
      )}`;
      const r = await fetch(u);
      if (r.ok) {
        const xml = await r.text();
        if (xml && xml.includes("<text")) {
          // 단순 XML 파서
          const texts = Array.from(xml.matchAll(/<text(?:[^>]*)start="([^"]+)"(?:[^>]*)>([\s\S]*?)<\/text>/g)).map(
            (m) => {
              // HTML 엔티티 제거
              const raw = m[2]
                .replace(/&amp;/g, "&")
                .replace(/&#39;/g, "'")
                .replace(/&quot;/g, '"')
                .replace(/&lt;/g, "<")
                .replace(/&gt;/g, ">")
                .replace(/<br\s*\/?>/g, " ")
                .replace(/\s+/g, " ")
                .trim();
              return {
                time: Math.floor(parseFloat(m[1] || "0")),
                text: raw,
              };
            }
          );
          if (texts.length) return texts;
        }
      }
    } catch (_) {}
  }
  return [];
}

export default function VideoEditorModal({ open, row, video, onSave, onDelete, onClose }) {
  const [videoId, setVideoId] = useState(video?.videoId || "");
  const [title, setTitle] = useState(video?.title || "");
  const [subEdit, setSubEdit] = useState(packSubtitleText(video?.subtitles || []));
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!open) return;
    setVideoId(video?.videoId || "");
    setTitle(video?.title || "");
    setSubEdit(packSubtitleText(video?.subtitles || []));
    setMsg("");
  }, [open, video]);

  const headerLabel = useMemo(() => {
    if (!row) return "영상 편집";
    return `${row.packName} - ${row.chapterTitle}`;
  }, [row]);

  if (!open) return null;

  const doFetchFromId = async () => {
    if (!videoId) return alert("유튜브 영상 ID를 입력하세요.");
    setBusy(true);
    setMsg("제목/자막 불러오는 중… (몇 초 걸릴 수 있어요)");
    try {
      // 제목(oEmbed)
      const t = await fetchTitleByOEmbed(videoId);
      if (t) setTitle(t);

      // 자막(timedtext)
      const arr = await fetchTimedText(videoId);
      if (arr.length > 0) {
        setSubEdit(packSubtitleText(arr));
        setMsg(`제목${t ? "·" : " "}자막 로드 완료`);
      } else {
        setMsg("자막을 찾지 못했습니다. 수동으로 붙여넣기 해 주세요.");
      }
    } finally {
      setBusy(false);
    }
  };

  const doSave = async () => {
    if (!videoId) return alert("유튜브 영상 ID를 입력하세요.");
    const arr = parseSubtitleText(subEdit);
    await onSave({ title: title || "(제목 없음)", videoId, subtitlesArray: arr });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-[820px] max-w-[95%] rounded-lg bg-white shadow-lg">
        <div className="px-5 py-3 border-b flex items-center justify-between">
          <div className="font-bold">
            {headerLabel}
          </div>
          <button className="px-2 py-1 text-gray-600 hover:text-black" onClick={onClose}>
            닫기
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* ===== [CHANGED] 유튜브 ID → 자동 로드 버튼 추가 ===== */}
          <div className="flex gap-2 items-center">
            <input
              className="border rounded px-3 py-2 flex-1"
              placeholder="유튜브 영상 ID (예: I5OjtZJsGB4)"
              value={videoId}
              onChange={(e) => setVideoId(e.target.value.trim())}
            />
            <button
              type="button"
              onClick={doFetchFromId}
              disabled={busy}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded disabled:opacity-60"
            >
              ID로 불러오기
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-24 h-[72px] border rounded overflow-hidden bg-gray-100 flex items-center justify-center">
              {videoId ? (
                <img src={ytThumbUrl(videoId)} alt="" className="w-full h-auto" />
              ) : (
                <span className="text-[11px] text-gray-500">썸네일</span>
              )}
            </div>
            <input
              className="border rounded px-3 py-2 flex-1"
              placeholder="영상 제목"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {msg && <div className="text-sm text-gray-600">{msg}</div>}

          <div>
            <div className="text-sm text-gray-600 mb-1">
              자막 (형식: <code>m:ss</code> 줄 + 다음 줄 텍스트)
            </div>
            <textarea
              rows={10}
              className="w-full border rounded px-3 py-2 font-mono text-[13px]"
              placeholder={`0:04
하이 가이...

0:07
다음 줄...`}
              value={subEdit}
              onChange={(e) => setSubEdit(e.target.value)}
            />
          </div>
        </div>

        <div className="px-5 py-3 border-t flex justify-between">
          <div className="text-sm text-gray-500">
            저장 시: 자막은 타임스탬프 + 텍스트로 파싱되어 DB에 객체 배열로 저장됩니다.
          </div>
          <div className="flex gap-2">
            {video && (
              <button
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded"
                onClick={onDelete}
              >
                삭제
              </button>
            )}
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded" onClick={doSave}>
              저장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
