import { dayKey } from './date.ts';
import type { CardState } from './scheduler.ts';

/** 분 단위 학습 단계(learning/relearning)인지. 1일 이상 간격이면 장기 복습이다. */
const isShortTerm = (card: CardState) => card.scheduled_days < 1;

/** 장기 복습은 날짜 단위로, 학습 단계는 시각 단위로 기한을 본다. */
export function isDue(card: CardState, now: number): boolean {
  return isShortTerm(card) ? card.due <= now : dayKey(card.due) <= dayKey(now);
}

export interface QueueInput {
  cards: readonly CardState[];
  /** 전체 단어 순위 (오름차순) */
  wordRanks: readonly number[];
  startRank: number;
  newPerDay: number;
  /** 오늘 이미 처음 학습한 새 카드 수 */
  newStudiedToday: number;
  now: number;
}

export interface TodayQueue {
  /** 지금 보여 줄 카드. card가 없으면 새 카드 */
  current: { rank: number; card: CardState | undefined } | null;
  /** 지금 기한이 된 카드 수 (복습 + 학습 단계) */
  dueCount: number;
  /** 오늘 남은 새 카드 수 */
  newCount: number;
  /** 아직 기한 전인 학습 단계 카드 */
  laterCount: number;
  nextLaterDue: number | null;
}

/**
 * 오늘의 학습 큐: 기한이 된 카드(학습 단계 우선, 기한 순) → 새 카드(순위 순)
 * 기한 전인 학습 단계 카드는 미리 보여 주지 않아 평가 버튼에 표시한 간격(1분, 6분 등)을 그대로 지킨다
 */
export function buildQueue(input: QueueInput): TodayQueue {
  const { cards, now } = input;

  const due = cards
    .filter((c) => isDue(c, now))
    .sort((a, b) => Number(isShortTerm(b)) - Number(isShortTerm(a)) || a.due - b.due);
  const later = cards
    .filter((c) => isShortTerm(c) && !isDue(c, now))
    .sort((a, b) => a.due - b.due);

  const quota = Math.max(0, input.newPerDay - input.newStudiedToday);
  const studied = new Set(cards.map((c) => c.rank));
  const newRanks: number[] = [];
  for (const rank of input.wordRanks) {
    if (newRanks.length >= quota) break;
    if (rank >= input.startRank && !studied.has(rank)) newRanks.push(rank);
  }

  const current = due[0]
    ? { rank: due[0].rank, card: due[0] }
    : newRanks[0] !== undefined
      ? { rank: newRanks[0], card: undefined }
      : null;

  return {
    current,
    dueCount: due.length,
    newCount: newRanks.length,
    laterCount: later.length,
    nextLaterDue: later[0]?.due ?? null,
  };
}
