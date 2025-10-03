// ==============================
// File: src/pages/VideosPage.jsx
// Role: 유튜브 영상 관리(필터/검색/페이지네이션, 썸네일, 제목 60자 생략, 편집 모달 호출)
// ==============================

import { useEffect, useMemo, useRef, useState } from "react";
import LoadingBar from "../components/LoadingBar";
import LevelBar from "../components/packs/LevelBar";
import SelectChips from "../components/packs/SelectChips";
import VideoEditorModal from "../components/videos/VideoEditorModal";
import TruncateText from "../components/common/TruncateText";
import {
  getWordPacks,
  getChaptersByPack,
  getVideos,
  addVideo,
  updateVideo,
  deleteVideo,
} from "../lib/firestore";

const normalize = (s) => (s || "").toString().trim();
const contains = (hay, needle) => normalize(hay).toLowerCase().includes(needle);
const ytThumbUrl = (id) => (id ? `https://img.youtube.com/vi/${id}/default.jpg` : "");

const withChapterName = (chapter) => ({
  ...chapter,
  chapterName: chapter.chapterName || chapter.chapterId || chapter.title || chapter.id || "",
});

const withVideoChapterName = (video) => ({
  ...video,
  chapterName: video.chapterName || video.chapterId || "",
});

function VideosPage() {
  const [loading, setLoading] = useState(true);
  const [packs, setPacks] = useState([]);
  const [chaptersByPack, setChaptersByPack] = useState({});
  const [videos, setVideos] = useState([]);

  const [lang, setLang] = useState("");
  const [packId, setPackId] = useState("");
  const [chapterId, setChapterId] = useState("");

  const [q, setQ] = useState("");
  const [perPage, setPerPage] = useState(20);
  const [page, setPage] = useState(1);
  const [onlyUnlinked, setOnlyUnlinked] = useState(false);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editorRow, setEditorRow] = useState(null);
  const [editorVideo, setEditorVideo] = useState(null);

  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    (async () => {
      setLoading(true);
      const [packList, videoList] = await Promise.all([getWordPacks(), getVideos()]);
      setPacks(packList);
      setVideos(videoList.map(withVideoChapterName));
      const init = {};
      for (const p of packList) {
        const chapters = await getChaptersByPack(p.id);
        init[p.id] = chapters.map(withChapterName);
      }
      setChaptersByPack(init);
      setLoading(false);
    })();
  }, []);

  const languageItems = useMemo(() => {
    const by = {};
    for (const p of packs) by[p.language] = (by[p.language] || 0) + 1;
    return Object.keys(by).map((lng) => ({ id: lng, label: `${lng} (${by[lng]})` }));
  }, [packs]);

  const packsOfLang = useMemo(() => packs.filter((p) => (lang ? p.language === lang : true)), [packs, lang]);

  const toggleLang = (id) => setLang((prev) => (prev === id ? "" : id));
  const togglePack = (id) => setPackId((prev) => (prev === id ? "" : id));
  const toggleChapter = (id) => setChapterId((prev) => (prev === id ? "" : id));

  useEffect(() => {
    if (!lang) return setPackId(""), setChapterId("");
    const first = packsOfLang[0];
    setPackId(first?.id || "");
  }, [lang, packsOfLang]);

  const chapterItems = useMemo(() => {
    if (!packId) return [];
    return (chaptersByPack[packId] || []).map((c) => {
      const name = c.chapterName || c.id || "";
      const title = c.title || name;
      const prefix = name ? `${name}. ` : "";
      return {
        id: c.id,
        label: `${prefix}${title}`,
      };
    });
  }, [packId, chaptersByPack]);

  useEffect(() => {
    if (!packId) return setChapterId("");
    const first = (chaptersByPack[packId] || [])[0];
     setChapterId(first?.id || "");
  }, [packId, chaptersByPack]);

  const allChapterRows = useMemo(() => {
    const rows = [];
    for (const p of packs) {
      const chs = chaptersByPack[p.id] || [];
      for (const c of chs) {
        rows.push({
          language: p.language,
          packId: p.id,
          packName: p.name,
          packType: p.type || "free",
          chapterId: c.id,
          chapterName: c.chapterName || c.id,
          chapterTitle: c.title || c.chapterName || c.id,
        });
      }
    }
    return rows;
  }, [packs, chaptersByPack]);

  const filteredRows = useMemo(() => {
    let r = allChapterRows;
    if (lang) r = r.filter((x) => x.language === lang);
    if (packId) r = r.filter((x) => x.packId === packId);
    if (chapterId) r = r.filter((x) => x.chapterId === chapterId);
    const qx = q.trim().toLowerCase();
    if (qx) {
      r = r.filter(
        (x) =>
          contains(x.packName, qx) ||
          contains(x.chapterTitle, qx) ||
          contains(x.chapterName, qx) ||
          contains(x.language, qx)
      );
    }
    if (onlyUnlinked) r = r.filter((x) => !videos.find((v) => v.chapterId === x.chapterId));
    r = r.sort((a, b) => {
      const L = a.language.localeCompare(b.language);
      if (L) return L;
      const P = a.packName.localeCompare(b.packName);
      if (P) return P;
      return a.chapterId.localeCompare(b.chapterId);
    });
    return r;
  }, [allChapterRows, lang, packId, chapterId, q, onlyUnlinked, videos]);

  const total = filteredRows.length;
  const lastPage = Math.max(1, Math.ceil(total / perPage));
  const safePage = Math.min(page, lastPage);
  const pageSlice = filteredRows.slice((safePage - 1) * perPage, safePage * perPage);
  const goto = (p) => setPage(Math.min(Math.max(1, p), lastPage));
  useEffect(() => setPage(1), [q, lang, packId, chapterId, perPage, onlyUnlinked]);

  const getVideoByChapter = (cid) => videos.find((v) => v.chapterId === cid);

  const openEditor = (row) => {
    const v = getVideoByChapter(row.chapterId) || null;
    setEditorRow(row);
    setEditorVideo(v);
    setEditorOpen(true);
  };
  const closeEditor = () => (setEditorOpen(false), setEditorRow(null), setEditorVideo(null));

  const saveEditor = async ({ title, videoId, subtitlesArray }) => {
    if (!editorRow) return;
    const exist = editorVideo;
    if (exist) {
      await updateVideo(exist.id, {
        ...exist,
        title,
        videoId,
        subtitles: subtitlesArray,
        subtitleCount: subtitlesArray.length,
        hasSubtitles: subtitlesArray.length > 0,
        chapterName: editorRow.chapterName,
      });
    } else {
      await addVideo({
        title,
        videoId,
        chapterId: editorRow.chapterId,
        chapterName: editorRow.chapterName,
        subtitles: subtitlesArray,
        subtitleCount: subtitlesArray.length,
        hasSubtitles: subtitlesArray.length > 0,
      });
    }
    const list = await getVideos();
    setVideos(list.map(withVideoChapterName));
    closeEditor();
  };

  const deleteEditor = async () => {
    if (!editorVideo) return;
    if (!window.confirm(`'${editorVideo.title}' 영상을 삭제할까요?`)) return;
    await deleteVideo(editorVideo.id);
    const list = await getVideos();
    setVideos(list.map(withVideoChapterName));
    closeEditor();
  };

  const languageChips = languageItems;
  const packChips = packsOfLang.map((p) => {
    const chCount = (chaptersByPack[p.id] || []).length;
    return { id: p.id, label: `${p.name} (${chCount}) ${p.type || "free"}` };
  });

  return (
    <div className="p-4">
      <LoadingBar show={loading} />

      {/* 필터 바 */}
      <div className="grid grid-cols-1 gap-3">
        <LevelBar title="언어 종류" color="bg-orange-500">
          <SelectChips items={languageChips} value={lang} onChange={toggleLang} getKey={(x) => x.id} getLabel={(x) => x.label} />
        </LevelBar>

        <LevelBar title="언어팩 종류" color="bg-amber-300">
          {lang ? (
            <SelectChips items={packChips} value={packId} onChange={togglePack} getKey={(x) => x.id} getLabel={(x) => x.label} />
          ) : (
            <span className="text-sm text-gray-500">먼저 언어를 선택하세요.</span>
          )}
        </LevelBar>

        <LevelBar title="챕터" color="bg-amber-200">
          {packId ? (
            <SelectChips
              items={chapterItems}
              value={chapterId}
              onChange={toggleChapter}
              getKey={(x) => x.id}
              getLabel={(x) => x.label}
            />
          ) : (
            <span className="text-sm text-gray-500">먼저 언어팩을 선택하세요.</span>
          )}
        </LevelBar>
      </div>

      {/* 리스트 */}
      <div className="mt-4 border rounded-md bg-white">
        <div className="px-4 py-3 border-b flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <h2 className="text-xl font-bold">영상 리스트</h2>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="팩/챕터/언어/제목 검색" className="flex-1 md:w-72 border rounded-md px-3 py-1" />
            <select value={perPage} onChange={(e) => setPerPage(Number(e.target.value))} className="border rounded-md px-3 py-1">
              <option value={10}>10개씩 보기</option>
              <option value={20}>20개씩 보기</option>
              <option value={50}>50개씩 보기</option>
              <option value={100}>100개씩 보기</option>
            </select>
            <button onClick={() => setOnlyUnlinked((v) => !v)} className={`px-3 py-1 rounded text-white ${onlyUnlinked ? "bg-green-700 hover:bg-green-800" : "bg-green-600 hover:bg-green-700"}`}>
              {onlyUnlinked ? "전체 보기" : "영상 미연결만"}
            </button>
            <button
              onClick={() => {
                if (!chapterId) return alert("먼저 챕터를 선택하거나, 행의 '수정' 버튼을 사용하세요.");
                const row = filteredRows.find((r) => r.chapterId === chapterId);
                if (!row) return alert("선택한 챕터를 찾을 수 없습니다.");
                openEditor(row);
              }}
              className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
            >
              추가
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm table-fixed">
            <thead className="bg-gray-50 text-gray-600">
              <tr className="text-left">
                <th className="px-4 py-3 w-[22%]">언어팩-챕터</th>
                <th className="px-2 py-3 w-[72px]">썸네일</th>
                <th className="px-3 py-3 w-[48%]">제목</th>
                <th className="px-3 py-3 w-[90px]">자막</th>
                <th className="px-3 py-3 w-[140px] text-center">액션</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {pageSlice.length === 0 ? (
                <tr>
                  <td className="px-4 py-10 text-gray-500 text-center" colSpan={5}>결과가 없습니다.</td>
                </tr>
              ) : (
                pageSlice.map((row) => {
                  const v = videos.find((vv) => vv.chapterId === row.chapterId) || null;
                  const title = v?.title || "—";
                  const hasSubs = v && (v.subtitles?.length > 0 || v.hasSubtitles || (v.subtitleCount || 0) > 0) ? "삽입" : "미삽입";
                  const thumb = ytThumbUrl(v?.videoId);

                  return (
                    <tr key={`${row.packId}:${row.chapterId}`} className="hover:bg-gray-50">
                      <td className="pl-4 pr-2 py-3"><div className="font-semibold">{row.packName} - {row.chapterTitle}</div></td>
                      <td className="pl-2 pr-3 py-3">
                        <div className="w-14 h-9 border rounded overflow-hidden bg-gray-100 flex items-center justify-center">
                          {thumb ? <img src={thumb} alt="" className="w-full h-auto" /> : <span className="text-[11px] text-gray-500">미연결</span>}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <TruncateText
                          text={title}
                          maxChars={60}
                          className={v?.videoId ? "text-blue-600 hover:underline" : "text-gray-600"}
                          href={v?.videoId ? `https://www.youtube.com/watch?v=${v.videoId}` : undefined}
                        />
                      </td>
                      <td className="px-3 py-3"><span className={hasSubs === "삽입" ? "text-emerald-700 font-medium" : "text-gray-500"}>{hasSubs}</span></td>
                      <td className="px-3 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600" onClick={() => openEditor(row)}>{v ? "수정" : "추가"}</button>
                          <button
                            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 disabled:opacity-50"
                            onClick={async () => {
                              if (!v) return alert("연결된 영상이 없습니다.");
                              if (!window.confirm(`'${v.title}' 영상을 삭제할까요?`)) return;
                              await deleteVideo(v.id);
                              const list = await getVideos();
                              setVideos(list.map(withVideoChapterName));
                            }}
                            disabled={!v}
                          >
                            삭제
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-2 border-t text-sm text-gray-600 flex items-center justify-end gap-3">
          <span>{(safePage - 1) * perPage + (total ? 1 : 0)}-{Math.min(safePage * perPage, total)} / 총 {total}</span>
          <div className="flex items-center gap-2">
            <button className="px-2 py-1 border rounded hover:bg-gray-50 disabled:opacity-40" onClick={() => goto(safePage - 1)} disabled={safePage === 1}>이전</button>
            <span>페이지 {safePage} / {lastPage}</span>
            <button className="px-2 py-1 border rounded hover:bg-gray-50 disabled:opacity-40" onClick={() => goto(safePage + 1)} disabled={safePage === lastPage}>다음</button>
          </div>
        </div>
      </div>

      <VideoEditorModal open={editorOpen} row={editorRow} video={editorVideo} onSave={saveEditor} onDelete={deleteEditor} onClose={closeEditor} />
    </div>
  );
}

export default VideosPage; // ✅ default export (App.js 에러 해결)
