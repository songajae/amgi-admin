// src/components/samples/ChapterSampleCsvButton.jsx
// 역할: 챕터 업로드용 샘플 CSV 데이터를 포함한 전용 다운로드 버튼

import React from "react";
import DownloadCsvButton from "../DownloadCsvButton";

const chapterSampleData = [
  { chapter: "ch1", chapterTitle: "동물", word: "cat",   pos: "n.", meaning: "고양이",   example: "I have a cat." },
  { chapter: "ch1", chapterTitle: "동물", word: "dog",   pos: "n.", meaning: "강아지",   example: "The dog is cute." },
  { chapter: "ch1", chapterTitle: "동물", word: "run",   pos: "v.", meaning: "달리다",   example: "I run every morning." },
  { chapter: "ch1", chapterTitle: "동물", word: "run",   pos: "n.", meaning: "달리기",   example: "He goes for a run." },
  { chapter: "ch2", chapterTitle: "음식", word: "apple", pos: "n.", meaning: "사과",     example: "I eat an apple." },
  { chapter: "ch2", chapterTitle: "음식", word: "apple", pos: "v.", meaning: "지원하다", example: "I will apple for a job." },
  { chapter: "ch2", chapterTitle: "음식", word: "rice",  pos: "n.", meaning: "쌀",       example: "Koreans eat rice." },
];

export default function ChapterSampleCsvButton({ className = "" }) {
  return (
    <DownloadCsvButton
      filename="sample_chapters.csv"
      data={chapterSampleData}
      label="샘플 CSV 다운로드"
      className={className}
    />
  );
}
