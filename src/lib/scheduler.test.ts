import { describe, expect, it } from 'vitest';
import { Rating, State } from 'ts-fsrs';
import { formatInterval, GRADES, previewOutcomes } from './scheduler.ts';

const MIN = 60_000;
const DAY = 86_400_000;
const NOW = Date.parse('2026-10-21T12:00:00Z'); // KST 21:00

describe('previewOutcomes', () => {
  it('새 카드: Again 1분, Hard 6분, Good 10분 학습 단계, Easy는 바로 장기 복습', () => {
    const o = previewOutcomes(7, undefined, NOW);
    expect(o[Rating.Again].card.due - NOW).toBe(1 * MIN);
    expect(o[Rating.Hard].card.due - NOW).toBe(6 * MIN);
    expect(o[Rating.Good].card.due - NOW).toBe(10 * MIN);
    expect(o[Rating.Good].card.state).toBe(State.Learning);
    expect(o[Rating.Easy].card.state).toBe(State.Review);
    expect(o[Rating.Easy].card.scheduled_days).toBeGreaterThanOrEqual(1);
  });

  it('간격은 Again ≤ Hard ≤ Good ≤ Easy 순서', () => {
    const o = previewOutcomes(1, undefined, NOW);
    const dues = GRADES.map((g) => o[g].card.due);
    expect(dues).toEqual([...dues].sort((a, b) => a - b));
  });

  it('로그에는 평가 직전 상태와 rank·KST 날짜가 남는다', () => {
    const { card, log } = previewOutcomes(7, undefined, NOW)[Rating.Good];
    expect(card.rank).toBe(7);
    expect(card.reps).toBe(1);
    expect(card.last_review).toBe(NOW);
    expect(log).toMatchObject({ rank: 7, rating: Rating.Good, state: State.New, review: NOW, day: '2026-10-21' });
  });

  it('저장한 상태로 다시 계산해도 이어진다: Good 두 번이면 장기 복습으로 졸업', () => {
    const first = previewOutcomes(7, undefined, NOW)[Rating.Good].card;
    const later = NOW + 10 * MIN;
    const second = previewOutcomes(7, first, later)[Rating.Good].card;
    expect(second.state).toBe(State.Review);
    expect(second.scheduled_days).toBeGreaterThanOrEqual(1);
    expect(second.due - later).toBe(second.scheduled_days * DAY);
    expect(second.reps).toBe(2);
  });

  it('복습 중 Again이면 재학습으로 가고 lapses가 늘어난다', () => {
    let card = previewOutcomes(7, undefined, NOW)[Rating.Easy].card;
    const reviewAt = card.due;
    card = previewOutcomes(7, card, reviewAt)[Rating.Again].card;
    expect(card.state).toBe(State.Relearning);
    expect(card.lapses).toBe(1);
    expect(card.due - reviewAt).toBe(10 * MIN);
  });

  it('같은 입력이면 같은 결과 (미리보기와 저장이 일치)', () => {
    const card = previewOutcomes(7, undefined, NOW)[Rating.Easy].card;
    const at = card.due + DAY;
    expect(previewOutcomes(7, card, at)).toEqual(previewOutcomes(7, card, at));
  });
});

describe('formatInterval', () => {
  it.each([
    [0, '1분'],
    [1 * MIN, '1분'],
    [10 * MIN, '10분'],
    [59 * MIN, '59분'],
    [59.6 * MIN, '1시간'],
    [3 * 60 * MIN, '3시간'],
    [23.6 * 60 * MIN, '1일'],
    [4 * DAY, '4일'],
    [29 * DAY, '29일'],
    [45 * DAY, '1.5개월'],
    [359 * DAY, '1년'],
    [400 * DAY, '1.1년'],
  ])('%d ms → %s', (ms, label) => {
    expect(formatInterval(ms)).toBe(label);
  });
});
