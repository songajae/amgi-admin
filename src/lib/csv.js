// 역할: CSV 문자열을 따옴표와 줄바꿈까지 고려하여 안전하게 파싱하는 유틸
//       (요구사항) 기존 수동 파서를 교체하며, 어떤 규칙으로 안전하게 처리하는지를
//       추후 유지보수자가 바로 이해할 수 있도록 주요 분기마다 주석을 남긴다.
// 반환값: 각 행을 배열로 구성한 2차원 배열
export function parseCsvRows(text = "", { skipEmptyLines = true } = {}) {
  if (typeof text !== "string" || text.length === 0) return [];

  const rows = [];
  let currentValue = "";
  let currentRow = [];
  let inQuotes = false;

  // 👇 셀 종료/행 종료 로직을 함수로 분리하여 중복을 줄이고, 어디서 호출되는지 명확히 한다.
  const flushValue = () => {
    currentRow.push(currentValue.trim());
    currentValue = "";
  };

  const flushRow = () => {
    flushValue();
    const isEmptyRow = currentRow.every((cell) => cell === "");
    if (!(skipEmptyLines && isEmptyRow)) {
      rows.push(currentRow);
    }
    currentRow = [];
  };

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];

    if (char === "\"") {
      const nextChar = text[i + 1];
      if (inQuotes && nextChar === "\"") {
        currentValue += "\"";
        i += 1; // 따옴표 이스케이프 처리 ("" -> ")
      } else {
        inQuotes = !inQuotes; // 따옴표 여닫이를 토글
      }
      continue;
    }

    if (!inQuotes && (char === "\n" || char === "\r")) {
      if (char === "\r" && text[i + 1] === "\n") {
        i += 1; // 윈도우 개행(\r\n) 대응
      }
      flushRow(); // 따옴표 밖에서 개행을 만나면 행 확정
      continue;
    }

    if (!inQuotes && char === ",") {
      flushValue(); // 따옴표 밖의 콤마는 셀 경계로 인식
      continue;
    }

    currentValue += char;
  }

  // 마지막 값/행 처리
  if (currentValue.length > 0 || currentRow.length > 0) {
    flushRow();
  }

  if (rows.length > 0 && rows[0].length > 0) {
    rows[0][0] = rows[0][0].replace(/^\ufeff/, ""); // BOM 제거
  }

  return rows;
}

// 역할: CSV 문자열을 객체 배열로 변환합니다. (header -> value 매핑)
//       parseCsvRows 결과를 기반으로 하며, 기존 normalize/ensureHeaders 로직과 호환을 유지.
export function parseCSV(text) {
  try {
    const rows = parseCsvRows(text);
    if (rows.length < 2) return [];

    const [header, ...dataRows] = rows;
    return dataRows.map((cols) => {
      const obj = {};
      // 제목을 기준으로 각 열의 데이터를 객체에 담습니다. (예: { word: 'apple', meaning: '사과' })
      header.forEach((h, idx) => {
        obj[h] = cols[idx] || "";
      });
  } catch (error) {
    console.error("CSV 파싱 실패:", error);
    return []; // 에러 발생 시 빈 배열을 반환합니다.
  }
}