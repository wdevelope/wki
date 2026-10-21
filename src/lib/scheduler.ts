import { createEmptyCard, fsrs, Rating, type Card, type Grade, type ReviewLog, type State } from 'ts-fsrs';
import { dayKey } from './date.ts';

/** cards 테이블 행. ts-fsrs Card와 필드 이름이 같고 Date만 epoch ms로 저장한다. */
export interface CardState {
  rank: number;
  state: State;
  due: number;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  learning_steps: number;
  reps: number;
  lapses: number;
  last_review: number | null;
}

/** reviewLogs 테이블 행. ts-fsrs ReviewLog(평가 직전 상태 기록)에 rank와 KST 날짜를 더한 것. */
export interface ReviewLogEntry {
  id?: number;
  rank: number;
  rating: Grade;
  state: State;
  due: number;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  last_elapsed_days: number;
  scheduled_days: number;
  learning_steps: number;
  review: number;
  day: string;
}

export interface Outcome {
  card: CardState;
  log: ReviewLogEntry;
}

export const GRADES = [Rating.Again, Rating.Hard, Rating.Good, Rating.Easy] as const;

const scheduler = fsrs({ enable_fuzz: true });

function toFsrsCard(card: CardState | undefined, now: number): Card {
  if (!card) return createEmptyCard(new Date(now));
  const { rank: _rank, due, last_review, ...rest } = card;
  return {
    ...rest,
    due: new Date(due),
    last_review: last_review === null ? undefined : new Date(last_review),
  };
}

function fromFsrs(rank: number, card: Card, log: ReviewLog): Outcome {
  return {
    card: {
      rank,
      state: card.state,
      due: card.due.getTime(),
      stability: card.stability,
      difficulty: card.difficulty,
      elapsed_days: card.elapsed_days,
      scheduled_days: card.scheduled_days,
      learning_steps: card.learning_steps,
      reps: card.reps,
      lapses: card.lapses,
      last_review: card.last_review?.getTime() ?? null,
    },
    log: {
      rank,
      rating: log.rating as Grade,
      state: log.state,
      due: log.due.getTime(),
      stability: log.stability,
      difficulty: log.difficulty,
      elapsed_days: log.elapsed_days,
      last_elapsed_days: log.last_elapsed_days,
      scheduled_days: log.scheduled_days,
      learning_steps: log.learning_steps,
      review: log.review.getTime(),
      day: dayKey(log.review.getTime()),
    },
  };
}

/**
 * 현재 카드(없으면 새 카드)에 대해 4개 평가 결과를 미리 계산한다.
 * 버튼의 간격 표시와 실제 저장에 같은 결과를 써서 둘이 어긋나지 않게 한다.
 */
export function previewOutcomes(
  rank: number,
  current: CardState | undefined,
  now: number,
): Record<Grade, Outcome> {
  const preview = scheduler.repeat(toFsrsCard(current, now), new Date(now));
  const outcome = (grade: Grade) => fromFsrs(rank, preview[grade].card, preview[grade].log);
  return {
    [Rating.Again]: outcome(Rating.Again),
    [Rating.Hard]: outcome(Rating.Hard),
    [Rating.Good]: outcome(Rating.Good),
    [Rating.Easy]: outcome(Rating.Easy),
  };
}

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const round1 = (n: number) => Math.round(n * 10) / 10;

/** 다음 복습까지 남은 시간을 짧게 표시한다 (1분, 3시간, 4일, 2.5개월, 1.2년). */
export function formatInterval(ms: number): string {
  const minutes = Math.round(ms / MINUTE);
  if (minutes < 60) return `${Math.max(1, minutes)}분`;
  const hours = Math.round(ms / HOUR);
  if (hours < 24) return `${hours}시간`;
  const days = Math.round(ms / DAY);
  if (days < 30) return `${days}일`;
  const months = round1(ms / DAY / 30);
  if (months < 12) return `${months}개월`;
  return `${round1(ms / DAY / 365)}년`;
}
