// src/components/samples/PackSampleCsvButton.jsx
// 역할: 언어팩 업로드용 샘플 CSV 데이터를 포함한 전용 다운로드 버튼

import React from "react";
import DownloadCsvButton from "../DownloadCsvButton";
import { STRINGS } from "../../constants/strings";

// ✅ 실제 업로드 스키마(chapter, chapterTitle, word, pos, meaning, example)에 맞게 샘플 데이터를 정리
const packSampleData = [
  { chapter: "ch1", chapterTitle: "동물", word: "cat", pos: "n.", meaning: "고양이", example: "I have a cat." },
  { chapter: "ch1", chapterTitle: "동물", word: "dog", pos: "n.", meaning: "강아지", example: "The dog is cute." },
  { chapter: "ch1", chapterTitle: "동물", word: "run", pos: "v.", meaning: "달리다", example: "I run every morning." },
  { chapter: "ch2", chapterTitle: "음식", word: "apple", pos: "n.", meaning: "사과", example: "I eat an apple." },
  { chapter: "ch2", chapterTitle: "음식", word: "rice", pos: "n.", meaning: "쌀", example: "Koreans eat rice." },
];

export default function PackSampleCsvButton({ className = "" }) {
  return (
    <DownloadCsvButton
      filename="sample_word_pack.csv"
      data={packSampleData}
      label={STRINGS.samples.downloadLabel}
      className={className}
    />
  );
}
