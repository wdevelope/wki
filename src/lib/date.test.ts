import { describe, expect, it } from 'vitest';
import { dayKey, streak } from './date.ts';

describe('dayKey', () => {
  it('Asia/Seoul 자정을 날짜 경계로 쓴다', () => {
    expect(dayKey(Date.parse('2026-10-20T14:59:59Z'))).toBe('2026-10-20');
    expect(dayKey(Date.parse('2026-10-20T15:00:00Z'))).toBe('2026-10-21');
  });

  it('연말과 윤일 경계', () => {
    expect(dayKey(Date.parse('2026-12-31T15:00:00Z'))).toBe('2027-01-01');
    expect(dayKey(Date.parse('2028-02-28T15:00:00Z'))).toBe('2028-02-29');
  });
});

describe('streak', () => {
  const days = (...keys: string[]) => new Set(keys);

  it('오늘 포함 연속 일수', () => {
    expect(streak(days('2026-10-19', '2026-10-20', '2026-10-21'), '2026-10-21')).toBe(3);
  });

  it('오늘 아직 안 했으면 어제까지 연속을 유지한다', () => {
    expect(streak(days('2026-10-19', '2026-10-20'), '2026-10-21')).toBe(2);
  });

  it('중간에 빠진 날이 있으면 끊긴다', () => {
    expect(streak(days('2026-10-17', '2026-10-19', '2026-10-21'), '2026-10-21')).toBe(1);
  });

  it('어제도 안 했으면 0', () => {
    expect(streak(days('2026-10-18'), '2026-10-21')).toBe(0);
    expect(streak(days(), '2026-10-21')).toBe(0);
  });

  it('월 경계를 넘어 센다', () => {
    expect(streak(days('2026-09-30', '2026-10-01'), '2026-10-01')).toBe(2);
  });
});
