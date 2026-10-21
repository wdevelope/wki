import { describe, expect, it } from 'vitest';
import { State } from 'ts-fsrs';
import { buildQueue, isDue, type QueueInput } from './queue.ts';
import type { CardState } from './scheduler.ts';

const MIN = 60_000;
const DAY = 86_400_000;
const NOW = Date.parse('2026-10-21T03:00:00Z'); // KST 12:00

function card(rank: number, due: number, scheduled_days: number): CardState {
  return {
    rank,
    state: scheduled_days >= 1 ? State.Review : State.Learning,
    due,
    stability: 1,
    difficulty: 5,
    elapsed_days: 0,
    scheduled_days,
    learning_steps: 0,
    reps: 1,
    lapses: 0,
    last_review: due - Math.max(scheduled_days * DAY, 10 * MIN),
  };
}

const ranks = (n: number) => Array.from({ length: n }, (_, i) => i + 1);

function queue(overrides: Partial<QueueInput>) {
  return buildQueue({
    cards: [],
    wordRanks: ranks(100),
    startRank: 1,
    newPerDay: 30,
    newStudiedToday: 0,
    now: NOW,
    ...overrides,
  });
}

describe('isDue', () => {
  it('장기 복습은 오늘(KST) 날짜면 시각이 지나지 않아도 기한', () => {
    const laterToday = NOW + 6 * 60 * MIN; // KST 18:00
    const tomorrow = NOW + 12 * 60 * MIN; // KST 다음 날 00:00
    expect(isDue(card(1, laterToday, 3), NOW)).toBe(true);
    expect(isDue(card(1, tomorrow, 3), NOW)).toBe(false);
  });

  it('학습 단계는 시각 단위', () => {
    expect(isDue(card(1, NOW, 0), NOW)).toBe(true);
    expect(isDue(card(1, NOW + MIN, 0), NOW)).toBe(false);
  });
});

describe('buildQueue', () => {
  it('아무것도 없으면 시작 순위부터 새 카드', () => {
    const q = queue({ startRank: 51 });
    expect(q.current).toEqual({ rank: 51, card: undefined });
    expect(q.newCount).toBe(30);
  });

  it('새 카드는 이미 학습한 단어를 건너뛰고 순위 순', () => {
    const studied = [card(1, NOW + 3 * DAY, 3), card(2, NOW + 3 * DAY, 3)];
    expect(queue({ cards: studied }).current?.rank).toBe(3);
  });

  it('하루 새 카드 한도에서 오늘 학습한 수를 뺀다', () => {
    expect(queue({ newPerDay: 30, newStudiedToday: 25 }).newCount).toBe(5);
    expect(queue({ newPerDay: 30, newStudiedToday: 40 }).newCount).toBe(0);
  });

  it('남은 단어가 한도보다 적으면 남은 만큼만', () => {
    expect(queue({ startRank: 95 }).newCount).toBe(6);
  });

  it('기한이 된 복습 카드가 새 카드보다 먼저, 기한 순', () => {
    const cards = [card(10, NOW - 1 * DAY, 3), card(20, NOW - 2 * DAY, 3)];
    const q = queue({ cards });
    expect(q.current?.rank).toBe(20);
    expect(q.dueCount).toBe(2);
  });

  it('기한이 된 학습 단계 카드가 장기 복습보다 먼저', () => {
    const cards = [card(10, NOW - 2 * DAY, 3), card(20, NOW - MIN, 0)];
    expect(queue({ cards }).current?.rank).toBe(20);
  });

  it('기한 전 학습 단계 카드는 대기로 센다', () => {
    const q = queue({ cards: [card(5, NOW + 5 * MIN, 0)] });
    expect(q.current?.rank).toBe(1);
    expect(q.laterCount).toBe(1);
    expect(q.nextLaterDue).toBe(NOW + 5 * MIN);
  });

  it('할 카드가 없으면 20분 안에 돌아올 학습 카드를 미리 보여 준다', () => {
    const q = queue({ cards: [card(5, NOW + 15 * MIN, 0)], newPerDay: 0 });
    expect(q.current?.rank).toBe(5);
  });

  it('20분 넘게 남았으면 오늘은 끝', () => {
    const q = queue({ cards: [card(5, NOW + 30 * MIN, 0)], newPerDay: 0 });
    expect(q.current).toBeNull();
    expect(q.laterCount).toBe(1);
  });

  it('모두 끝나면 null', () => {
    const q = queue({ newPerDay: 0 });
    expect(q).toEqual({ current: null, dueCount: 0, newCount: 0, laterCount: 0, nextLaterDue: null });
  });
});
