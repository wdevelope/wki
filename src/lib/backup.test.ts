import { describe, expect, it } from 'vitest';
import { Rating } from 'ts-fsrs';
import { parseBackup } from './backup.ts';
import { previewOutcomes } from './scheduler.ts';

const NOW = Date.parse('2026-10-21T12:00:00Z');
const { card, log } = previewOutcomes(1, undefined, NOW)[Rating.Good];

const valid = {
  app: 'wki',
  version: 1,
  exportedAt: '2026-10-21T12:00:00.000Z',
  settings: { id: 'app', newPerDay: 30, startRank: 501, autoPlay: false },
  cards: [card],
  reviewLogs: [{ ...log, id: 1 }],
};

describe('parseBackup', () => {
  it('JSON 직렬화를 거친 백업을 그대로 복원한다', () => {
    const parsed = parseBackup(JSON.parse(JSON.stringify(valid)));
    expect(parsed).toEqual(valid);
  });

  it('학습 전 카드의 last_review null을 허용한다', () => {
    const cards = [{ ...card, last_review: null }];
    expect(parseBackup({ ...valid, cards }).cards).toEqual(cards);
  });

  it('다른 앱의 파일이면 오류', () => {
    expect(() => parseBackup({ ...valid, app: 'anki' })).toThrow('WKI 백업 파일이 아닙니다');
    expect(() => parseBackup([])).toThrow('WKI 백업 파일이 아닙니다');
  });

  it('버전이 다르면 오류', () => {
    expect(() => parseBackup({ ...valid, version: 2 })).toThrow('버전');
  });

  it('설정·카드·로그 형식이 어긋나면 오류', () => {
    expect(() => parseBackup({ ...valid, settings: { newPerDay: '30' } })).toThrow('설정');
    expect(() => parseBackup({ ...valid, cards: [{ ...card, due: '2026-10-21' }] })).toThrow('카드');
    expect(() => parseBackup({ ...valid, reviewLogs: [{ ...log, day: undefined }] })).toThrow('복습');
  });
});
