import { useLiveQuery } from 'dexie-react-hooks';
import { State } from 'ts-fsrs';
import { dayKey, streak } from '../lib/date.ts';
import type { Word } from '../lib/ngsl-csv.ts';
import { buildQueue, type TodayQueue } from '../lib/queue.ts';
import { db, DEFAULT_SETTINGS, type Settings } from './schema.ts';

/** 저장된 설정 (없으면 기본값). 불러오는 중에는 undefined */
export function useSettings(): Settings | undefined {
  return useLiveQuery(async () => (await db.settings.get('app')) ?? DEFAULT_SETTINGS);
}

export interface TodayQueueWithWord extends TodayQueue {
  /** current 카드의 단어 */
  word: Word | undefined;
}

/** 오늘의 학습 큐. DB가 바뀌거나 tick이 바뀔 때마다 그 시각 기준으로 다시 계산한다. */
export function useTodayQueue(tick = 0): TodayQueueWithWord | undefined {
  return useLiveQuery(async () => {
    const now = Date.now();
    const [settings, cards, wordRanks, todayLogs] = await Promise.all([
      db.settings.get('app'),
      db.cards.toArray(),
      db.words.toCollection().primaryKeys(),
      db.reviewLogs.where('day').equals(dayKey(now)).toArray(),
    ]);
    const { startRank, newPerDay } = settings ?? DEFAULT_SETTINGS;
    const queue = buildQueue({
      cards,
      wordRanks,
      startRank,
      newPerDay,
      newStudiedToday: todayLogs.filter((log) => log.state === State.New).length,
      now,
    });
    const word = queue.current ? await db.words.get(queue.current.rank) : undefined;
    return { ...queue, word };
  }, [tick]);
}

export interface Progress {
  /** 오늘 평가한 횟수 */
  reviewsToday: number;
  /** 그중 처음 본 새 단어 수 */
  newToday: number;
  /** 한 번이라도 학습한 단어 수 */
  studiedWords: number;
  totalWords: number;
  streak: number;
}

/** 진행 현황. DB가 바뀌거나 tick이 바뀔 때마다 그 시각 기준으로 다시 계산한다. */
export function useProgress(tick = 0): Progress | undefined {
  return useLiveQuery(async () => {
    const today = dayKey(Date.now());
    const [todayLogs, studiedWords, totalWords, days] = await Promise.all([
      db.reviewLogs.where('day').equals(today).toArray(),
      db.cards.count(),
      db.words.count(),
      db.reviewLogs.orderBy('day').uniqueKeys(),
    ]);
    return {
      reviewsToday: todayLogs.length,
      newToday: todayLogs.filter((log) => log.state === State.New).length,
      studiedWords,
      totalWords,
      streak: streak(new Set(days as string[]), today),
    };
  }, [tick]);
}
