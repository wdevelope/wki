import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseNgslCsv } from './ngsl-csv.ts';

const HEADER = '순위,단어,뜻,예문,예문 해석';

describe('parseNgslCsv', () => {
  it('BOM·CRLF를 처리하고 따옴표 안의 쉼표를 유지한다', () => {
    const csv =
      `﻿${HEADER}\r\n` +
      `2,be,"[동] ~이다, (~에) 있다",My office is on the third floor.,제 사무실은 3층에 있어요.\r\n`;
    expect(parseNgslCsv(csv)).toEqual([
      {
        rank: 2,
        word: 'be',
        meaning: '[동] ~이다, (~에) 있다',
        example: 'My office is on the third floor.',
        exampleKo: '제 사무실은 3층에 있어요.',
      },
    ]);
  });

  it('이스케이프된 큰따옴표와 앞뒤 공백을 처리한다', () => {
    const csv = `${HEADER}\n1, say ,[동] 말하다,"He said, ""Hi.""",그가 "안녕"이라고 말했다.\n`;
    const [w] = parseNgslCsv(csv);
    expect(w?.word).toBe('say');
    expect(w?.example).toBe('He said, "Hi."');
  });

  it('빈 줄은 건너뛴다', () => {
    const csv = `${HEADER}\n1,a,[관] 하나의,A cat.,고양이 한 마리.\n\n`;
    expect(parseNgslCsv(csv)).toHaveLength(1);
  });

  it('헤더가 다르면 오류', () => {
    expect(() => parseNgslCsv('rank,word,meaning,example,exampleKo\n')).toThrow('헤더');
  });

  it('열 개수가 다르면 행 번호와 함께 오류', () => {
    const csv = `${HEADER}\n1,a,[관] 하나의,A cat.,고양이.\n2,b,뜻만\n`;
    expect(() => parseNgslCsv(csv)).toThrow('3행');
  });

  it('순위가 숫자가 아니거나 중복이면 오류', () => {
    expect(() => parseNgslCsv(`${HEADER}\nx,a,뜻,ex,해석\n`)).toThrow('순위');
    expect(() => parseNgslCsv(`${HEADER}\n1,a,뜻,ex,해석\n1,b,뜻,ex,해석\n`)).toThrow('중복');
  });

  it('단어나 뜻이 비어 있으면 오류', () => {
    expect(() => parseNgslCsv(`${HEADER}\n1,,뜻,ex,해석\n`)).toThrow('비어');
  });

  it('실제 data/ngsl.csv는 1~2809 순위의 2,809개 단어', () => {
    const csv = readFileSync(new URL('../../data/ngsl.csv', import.meta.url), 'utf8');
    const words = parseNgslCsv(csv);
    expect(words).toHaveLength(2809);
    expect(words.map((w) => w.rank)).toEqual(Array.from({ length: 2809 }, (_, i) => i + 1));
    expect(words[0]?.word).toBe('the');
    expect(words.at(-1)?.word).toBe('thirst');
  });
});
