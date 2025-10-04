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
  { chapter: "ch1", chapterTitle: "동물", word: "duck", pos: "n.", meaning: "오리, 물새", example: "The duck swims across the pond." },
  // 👆 품사에 따라 뜻이 여러 개인 단어는 쉼표로 의미를 나열해 다의어 예시를 강조
  { chapter: "ch1", chapterTitle: "동물", word: "duck", pos: "v.", meaning: "몸을 숙이다, 피하다", example: "Duck when the ball comes your way." },
  { chapter: "ch1", chapterTitle: "동물", word: "seal", pos: "n.", meaning: "바다표범", example: "A seal claps its flippers." },
  { chapter: "ch1", chapterTitle: "동물", word: "seal", pos: "v.", meaning: "봉인하다, 밀봉하다", example: "Please seal the box tightly." },
  { chapter: "ch1", chapterTitle: "동물", word: "fly", pos: "n.", meaning: "파리, 날벌레", example: "A fly buzzes around the fruit." },
  { chapter: "ch1", chapterTitle: "동물", word: "fly", pos: "v.", meaning: "날다, 비행하다", example: "Birds fly high in the sky." },

  // ch2: 음식 - 동일 단어를 여러 품사로 제공해 실제 업로드 시 레코드가 증가함을 표현
  { chapter: "ch2", chapterTitle: "음식", word: "toast", pos: "n.", meaning: "토스트, 구운 빵", example: "She ate toast with butter." },
  { chapter: "ch2", chapterTitle: "음식", word: "toast", pos: "v.", meaning: "건배하다, 축하하다", example: "We toast to the new project." },
  { chapter: "ch2", chapterTitle: "음식", word: "pickle", pos: "n.", meaning: "피클, 절임", example: "The sandwich comes with a pickle." },
  { chapter: "ch2", chapterTitle: "음식", word: "pickle", pos: "v.", meaning: "절이다, 곤란하게 하다", example: "They pickle radishes at home." },
  { chapter: "ch2", chapterTitle: "음식", word: "pepper", pos: "n.", meaning: "후추, 고추", example: "Add pepper to the soup." },
  { chapter: "ch2", chapterTitle: "음식", word: "pepper", pos: "v.", meaning: "후추를 뿌리다, 퍼붓다", example: "Pepper the steak before grilling." },
  // 👇 따옴표 안 콤마가 포함된 한국어 단어도 CSV 파서가 올바르게 처리되는지 확인하기 위한 레코드
  { chapter: "ch2", chapterTitle: "음식", word: "엄마,아빠", pos: "n.", meaning: "부모님, 엄마와 아빠", example: 'The children shouted "엄마,아빠" together.' },
  { chapter: "ch2", chapterTitle: "음식", word: "orange", pos: "n.", meaning: "오렌지, 오렌지색", example: "I peeled an orange for dessert." },
  { chapter: "ch2", chapterTitle: "음식", word: "orange", pos: "adj.", meaning: "주황색의, 오렌지색의", example: "The sky turns orange at sunset." },
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
