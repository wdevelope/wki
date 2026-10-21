import type { Settings } from '../db/schema.ts';
import type { CardState, ReviewLogEntry } from './scheduler.ts';

export interface Backup {
  app: 'wki';
  version: 1;
  exportedAt: string;
  settings: Settings;
  cards: CardState[];
  reviewLogs: ReviewLogEntry[];
}

const CARD_NUMBERS = [
  'rank',
  'state',
  'due',
  'stability',
  'difficulty',
  'elapsed_days',
  'scheduled_days',
  'learning_steps',
  'reps',
  'lapses',
];
const LOG_NUMBERS = [
  'rank',
  'rating',
  'state',
  'due',
  'stability',
  'difficulty',
  'elapsed_days',
  'last_elapsed_days',
  'scheduled_days',
  'learning_steps',
  'review',
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasNumbers(record: Record<string, unknown>, fields: readonly string[]): boolean {
  return fields.every((f) => Number.isFinite(record[f]));
}

const isCard = (v: unknown) =>
  isRecord(v) &&
  hasNumbers(v, CARD_NUMBERS) &&
  (v.last_review === null || Number.isFinite(v.last_review));

const isLog = (v: unknown) =>
  isRecord(v) && hasNumbers(v, LOG_NUMBERS) && typeof v.day === 'string';

/** JSON.parse 결과가 WKI 백업 형식인지 검증한다. 아니면 이유와 함께 throw. */
export function parseBackup(data: unknown): Backup {
  if (!isRecord(data) || data.app !== 'wki') throw new Error('WKI 백업 파일이 아닙니다.');
  if (data.version !== 1) throw new Error(`지원하지 않는 백업 버전입니다 (${String(data.version)}).`);

  const { settings, cards, reviewLogs } = data;
  if (
    !isRecord(settings) ||
    !hasNumbers(settings, ['newPerDay', 'startRank']) ||
    typeof settings.autoPlay !== 'boolean'
  ) {
    throw new Error('설정 형식이 올바르지 않습니다.');
  }
  if (!Array.isArray(cards) || !cards.every(isCard)) {
    throw new Error('카드 기록 형식이 올바르지 않습니다.');
  }
  if (!Array.isArray(reviewLogs) || !reviewLogs.every(isLog)) {
    throw new Error('복습 기록 형식이 올바르지 않습니다.');
  }

  return {
    app: 'wki',
    version: 1,
    exportedAt: String(data.exportedAt ?? ''),
    settings: {
      id: 'app',
      newPerDay: settings.newPerDay as number,
      startRank: settings.startRank as number,
      autoPlay: settings.autoPlay,
    },
    cards: cards as CardState[],
    reviewLogs: reviewLogs as ReviewLogEntry[],
  };
}
