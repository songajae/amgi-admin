// 역할: 엑셀에서 저장한 CSV 파일 내용을 파싱하여 자바스크립트 객체 배열로 변환합니다.
export function parseCSV(text) {
  try {
    // 1. 전체 텍스트를 줄바꿈 기준으로 나눕니다.
    const lines = text.trim().split(/\r?\n/);
    if (lines.length < 2) return []; // 제목 줄과 데이터 줄, 최소 2줄이 필요합니다.

    // 2. 첫 번째 줄을 제목(header)으로 사용합니다.
    const header = lines[0].split(",").map((s) => s.trim());

    // 3. 두 번째 줄부터 마지막 줄까지 각 줄을 객체로 변환합니다.
    return lines.slice(1).map((line) => {
      const cols = line.split(",");
      const obj = {};
      // 제목을 기준으로 각 열의 데이터를 객체에 담습니다. (예: { word: 'apple', meaning: '사과' })
      header.forEach((h, i) => (obj[h] = (cols[i] || "").trim()));
      return obj;
    });
  } catch (error) {
    console.error("CSV 파싱 실패:", error);
    return []; // 에러 발생 시 빈 배열을 반환합니다.
  }
}