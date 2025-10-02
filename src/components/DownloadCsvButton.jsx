// src/components/DownloadCsvButton.jsx
// 역할: 전달받은 데이터(JSON 배열)를 CSV 파일로 변환해 다운로드하는 공통 버튼 컴포넌트

import React from "react";
import { utils, writeFile } from "xlsx";

export default function DownloadCsvButton({ filename, data, label = "CSV 다운로드", className = "" }) {
  const handleDownload = () => {
    try {
      const ws = utils.json_to_sheet(data);
      const wb = utils.book_new();
      utils.book_append_sheet(wb, ws, "Sheet1");
      writeFile(wb, filename, { bookType: "csv" });
    } catch (err) {
      console.error("CSV 다운로드 실패:", err);
      alert("CSV 파일 다운로드 중 오류가 발생했습니다.");
    }
  };

  return (
    <button
      onClick={handleDownload}
      className={`bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 ${className}`}
      type="button"
    >
      {label}
    </button>
  );
}
