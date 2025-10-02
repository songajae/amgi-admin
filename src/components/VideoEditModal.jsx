// ==============================
// File: src/components/VideoEditModal.jsx
// Role: 영상 추가/수정 모달. 제목/ID/썸네일/자막 텍스트를 편집 후 저장.
//       자막 텍스트는 “m:ss\n문장” 반복 형식을 파싱/출력.
// ==============================

import { useEffect, useMemo, useState } from "react";

export default function VideoEditModal({
  open,
  onClose,
  chapterId, // 연결 대상 챕터(doc id)
  initial,   // 기존 영상 문서 (없으면 추가)
  onSave,    // (data, videoDocId) => void
}) {
  const [videoId, setVideoId] = useState(initial?.videoId || "");
  const [title, setTitle] = useState(initial?.title || "");
  const [thumbnail, setThumbnail] = useState(initial?.thumbnail || "");
  const [captionsText, setCaptionsText] = useState("");

  useEffect(() => {
    setVideoId(initial?.videoId || "");
    setTitle(initial?.title || "");
    setThumbnail(initial?.thumbnail || "");
    // captions -> text
    if (initial?.captions?.length) {
      const lines = initial.captions
        .map((c) => `${c.time}\n${c.text}`)
        .join("\n");
      setCaptionsText(lines);
    } else {
      setCaptionsText("");
    }
  }, [initial]);

  const isEdit = !!initial?.id;

  const parsedCaptions = useMemo(() => {
    // "m:ss\n문장" 반복 구조 파싱
    // 빈 줄은 무시
    const lines = captionsText.split(/\r?\n/);
    const result = [];
    for (let i = 0; i < lines.length; ) {
      const time = (lines[i] || "").trim();
      const text = (lines[i + 1] || "").trim();
      if (/^\d+:\d{2}$/.test(time) && text) {
        result.push({ time, text });
        i += 2;
      } else {
        i += 1;
      }
    }
    return result;
  }, [captionsText]);

  if (!open) return null;

  const handleSave = () => {
    const data = {
      title,
      videoId,
      thumbnail,
      captions: parsedCaptions,
      chapterId, // 연결
    };
    onSave?.(data, initial?.id);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-3xl rounded shadow-lg">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <div className="font-semibold">{isEdit ? "영상 수정" : "영상 추가"}</div>
          <button onClick={onClose} className="text-gray-500 hover:text-black">
            ✕
          </button>
        </div>

        <div className="p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-600">영상 ID</label>
              <input
                className="border px-3 py-2 rounded w-full"
                value={videoId}
                onChange={(e) => setVideoId(e.target.value)}
                placeholder="예: dQw4w9WgXcQ"
              />
            </div>
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
            <div className="flex items-end">
              {thumbnail ? (
                <img
                  src={thumbnail}
                  alt="thumb"
                  className="w-40 h-24 object-cover rounded border"
                />
              ) : (
                <div className="w-40 h-24 border rounded text-gray-400 flex items-center justify-center">
                  미리보기
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-600">
              자막 (형식: <code>m:ss</code> 줄 + 자막 줄, 반복)
            </label>
            <textarea
              className="border px-3 py-2 rounded w-full h-48 font-mono text-sm"
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
          <button onClick={onClose} className="px-4 py-2 rounded border">
            취소
          </button>
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
