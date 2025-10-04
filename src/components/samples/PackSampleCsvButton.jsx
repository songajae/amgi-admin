// src/components/samples/PackSampleCsvButton.jsx
// 역할: 언어팩 업로드용 샘플 CSV 데이터를 포함한 전용 다운로드 버튼

import React from "react";
import DownloadCsvButton from "../DownloadCsvButton";
import { STRINGS } from "../../constants/strings";

// ✅ 실제 업로드 스키마(chapter, chapterTitle, word, pos, meaning, example)에 맞게 샘플 데이터를 정리
const packSampleData = [
  // ch1: 동물 - 동음이의어와 다른 품사를 모두 포함해 실제 데이터 수가 늘어나는 상황을 반영
  { chapter: "ch1", chapterTitle: "동물", word: "lion", pos: "n.", meaning: "사자", example: "The lion roars loudly." },
  { chapter: "ch1", chapterTitle: "동물", word: "tiger", pos: "n.", meaning: "호랑이", example: "A tiger prowls in the jungle." },
  { chapter: "ch1", chapterTitle: "동물", word: "duck", pos: "n.", meaning: "오리", example: "The duck swims across the pond." },
  { chapter: "ch1", chapterTitle: "동물", word: "duck", pos: "v.", meaning: "몸을 숙이다", example: "Duck when the ball comes your way." },
  { chapter: "ch1", chapterTitle: "동물", word: "seal", pos: "n.", meaning: "바다표범", example: "A seal claps its flippers." },
  { chapter: "ch1", chapterTitle: "동물", word: "seal", pos: "v.", meaning: "봉인하다", example: "Please seal the box tightly." },
  { chapter: "ch1", chapterTitle: "동물", word: "fly", pos: "n.", meaning: "파리", example: "A fly buzzes around the fruit." },
  { chapter: "ch1", chapterTitle: "동물", word: "fly", pos: "v.", meaning: "날다", example: "Birds fly high in the sky." },

  // ch2: 음식 - 동일 단어를 여러 품사로 제공해 실제 업로드 시 레코드가 증가함을 표현
  { chapter: "ch2", chapterTitle: "음식", word: "toast", pos: "n.", meaning: "토스트", example: "She ate toast with butter." },
  { chapter: "ch2", chapterTitle: "음식", word: "toast", pos: "v.", meaning: "건배하다", example: "We toast to the new project." },
  { chapter: "ch2", chapterTitle: "음식", word: "pickle", pos: "n.", meaning: "피클", example: "The sandwich comes with a pickle." },
  { chapter: "ch2", chapterTitle: "음식", word: "pickle", pos: "v.", meaning: "절이다", example: "They pickle radishes at home." },
  { chapter: "ch2", chapterTitle: "음식", word: "pepper", pos: "n.", meaning: "후추", example: "Add pepper to the soup." },
  { chapter: "ch2", chapterTitle: "음식", word: "pepper", pos: "v.", meaning: "후추를 뿌리다", example: "Pepper the steak before grilling." },
  { chapter: "ch2", chapterTitle: "음식", word: "orange", pos: "n.", meaning: "오렌지", example: "I peeled an orange for dessert." },
  { chapter: "ch2", chapterTitle: "음식", word: "orange", pos: "adj.", meaning: "주황색의", example: "The sky turns orange at sunset." },
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
