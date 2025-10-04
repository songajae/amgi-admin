// src/components/samples/PackSampleCsvButton.jsx
// 역할: 언어팩 업로드용 샘플 CSV 데이터를 포함한 전용 다운로드 버튼

import React from "react";
import DownloadCsvButton from "../DownloadCsvButton";
import { STRINGS } from "../../constants/strings";

// ✅ 실제 업로드 스키마(chapter, chapterTitle, word, pos, meaning, example)에 맞게 샘플 데이터를 정리
// ✅ 예문 해석(exampleMeaning) 컬럼을 포함한 샘플 데이터
const packSampleData = [
  // ch1: 동물 - 동음이의어와 다른 품사를 모두 포함해 실제 데이터 수가 늘어나는 상황을 반영
  {
    chapter: "ch1",
    chapterTitle: "동물",
    word: "lion",
    pos: "n.",
    meaning: "사자",
    example: "The lion roars loudly.",
    exampleMeaning: "그 사자는 크게 포효한다.",
  },
  {
    chapter: "ch1",
    chapterTitle: "동물",
    word: "tiger",
    pos: "n.",
    meaning: "호랑이",
    example: "A tiger prowls in the jungle.",
    exampleMeaning: "한 마리 호랑이가 정글을 살금살금 거닌다.",
  },
  {
    chapter: "ch1",
    chapterTitle: "동물",
    word: "duck",
    pos: "n.",
    meaning: "오리, 물새",
    example: "The duck swims across the pond.",
    exampleMeaning: "그 오리는 연못을 가로질러 헤엄친다.",
  },
  // 👆 품사에 따라 뜻이 여러 개인 단어는 쉼표로 의미를 나열해 다의어 예시를 강조
  {
    chapter: "ch1",
    chapterTitle: "동물",
    word: "duck",
    pos: "v.",
    meaning: "몸을 숙이다, 피하다",
    example: "Duck when the ball comes your way.",
    exampleMeaning: "공이 날아오면 몸을 숙여 피하세요.",
  },
  {
    chapter: "ch1",
    chapterTitle: "동물",
    word: "seal",
    pos: "n.",
    meaning: "바다표범",
    example: "A seal claps its flippers.",
    exampleMeaning: "바다표범이 지느러미를 쾅쾅 친다.",
  },
  {
    chapter: "ch1",
    chapterTitle: "동물",
    word: "seal",
    pos: "v.",
    meaning: "봉인하다, 밀봉하다",
    example: "Please seal the box tightly.",
    exampleMeaning: "상자를 단단히 봉인해 주세요.",
  },
  {
    chapter: "ch1",
    chapterTitle: "동물",
    word: "fly",
    pos: "n.",
    meaning: "파리, 날벌레",
    example: "A fly buzzes around the fruit.",
    exampleMeaning: "파리 한 마리가 과일 주위를 붕붕거린다.",
  },
  {
    chapter: "ch1",
    chapterTitle: "동물",
    word: "fly",
    pos: "v.",
    meaning: "날다, 비행하다",
    example: "Birds fly high in the sky.",
    exampleMeaning: "새들이 하늘 높이 난다.",
  },
  // ch2: 음식 - 동일 단어를 여러 품사로 제공해 실제 업로드 시 레코드가 증가함을 표현
  {
    chapter: "ch2",
    chapterTitle: "음식",
    word: "toast",
    pos: "n.",
    meaning: "토스트, 구운 빵",
    example: "She ate toast with butter.",
    exampleMeaning: "그녀는 버터를 바른 토스트를 먹었다.",
  },
  {
    chapter: "ch2",
    chapterTitle: "음식",
    word: "toast",
    pos: "v.",
    meaning: "건배하다, 축하하다",
    example: "We toast to the new project.",
    exampleMeaning: "우리는 새 프로젝트를 위해 건배한다.",
  },
  {
    chapter: "ch2",
    chapterTitle: "음식",
    word: "pickle",
    pos: "n.",
    meaning: "피클, 절임",
    example: "The sandwich comes with a pickle.",
    exampleMeaning: "그 샌드위치에는 피클이 함께 나온다.",
  },
  {
    chapter: "ch2",
    chapterTitle: "음식",
    word: "pickle",
    pos: "v.",
    meaning: "절이다, 곤란하게 하다",
    example: "They pickle radishes at home.",
    exampleMeaning: "그들은 집에서 무를 절인다.",
  },
  {
    chapter: "ch2",
    chapterTitle: "음식",
    word: "pepper",
    pos: "n.",
    meaning: "후추, 고추",
    example: "Add pepper to the soup.",
    exampleMeaning: "수프에 후추를 넣어라.",
  },
  {
    chapter: "ch2",
    chapterTitle: "음식",
    word: "pepper",
    pos: "v.",
    meaning: "후추를 뿌리다, 퍼붓다",
    example: "Pepper the steak before grilling.",
    exampleMeaning: "스테이크를 굽기 전에 후추를 뿌려라.",
  },
  // 👇 따옴표 안 콤마가 포함된 한국어 단어도 CSV 파서가 올바르게 처리되는지 확인하기 위한 레코드
  {
    chapter: "ch2",
    chapterTitle: "음식",
    word: "엄마,아빠",
    pos: "n.",
    meaning: "부모님, 엄마와 아빠",
    example: 'The children shouted "엄마,아빠" together.',
    exampleMeaning: "아이들이 함께 \"엄마, 아빠\"라고 외쳤다.",
  },
  {
    chapter: "ch2",
    chapterTitle: "음식",
    word: "orange",
    pos: "n.",
    meaning: "오렌지, 오렌지색",
    example: "I peeled an orange for dessert.",
    exampleMeaning: "나는 디저트로 먹으려고 오렌지 껍질을 벗겼다.",
  },
  {
    chapter: "ch2",
    chapterTitle: "음식",
    word: "orange",
    pos: "adj.",
    meaning: "주황색의, 오렌지색의",
    example: "The sky turns orange at sunset.",
    exampleMeaning: "해질 녘이 되면 하늘이 주황색으로 변한다.",
  },
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
