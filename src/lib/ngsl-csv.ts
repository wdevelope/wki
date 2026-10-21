import Papa from 'papaparse';

export interface Word {
  rank: number;
  word: string;
  meaning: string;
  example: string;
  exampleKo: string;
}

const HEADER = ['순위', '단어', '뜻', '예문', '예문 해석'];

/** NGSL CSV 텍스트를 Word 배열로 변환한다. 형식이 어긋나면 CSV 행 번호와 함께 throw. */
export function parseNgslCsv(text: string): Word[] {
  const { data, errors } = Papa.parse<string[]>(text.replace(/^﻿/, ''), {
    skipEmptyLines: true,
  });
  if (errors[0]) {
    throw new Error(`CSV 파싱 오류: ${errors[0].message}`);
  }

  const [header, ...rows] = data;
  if (header?.map((h) => h.trim()).join(',') !== HEADER.join(',')) {
    throw new Error(`헤더가 다릅니다: ${header?.join(',')}`);
  }

  const seen = new Set<number>();
  return rows.map((cols, i) => {
    const line = i + 2;
    if (cols.length !== HEADER.length) {
      throw new Error(`${line}행: 열이 ${cols.length}개입니다 (${HEADER.length}개 필요)`);
    }
    const [rankText, word, meaning, example, exampleKo] = cols.map((c) => c.trim()) as [
      string,
      string,
      string,
      string,
      string,
    ];
    const rank = Number(rankText);
    if (!Number.isInteger(rank) || rank < 1) {
      throw new Error(`${line}행: 순위가 올바르지 않습니다 (${rankText})`);
    }
    if (seen.has(rank)) {
      throw new Error(`${line}행: 순위 ${rank}가 중복됩니다`);
    }
    seen.add(rank);
    if (!word || !meaning) {
      throw new Error(`${line}행: 단어 또는 뜻이 비어 있습니다`);
    }
    return { rank, word, meaning, example, exampleKo };
  });
}
