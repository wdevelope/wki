import type { Outcome } from '../lib/scheduler.ts';
import { db, DEFAULT_SETTINGS, type Settings } from './schema.ts';

/** 평가 결과를 카드 상태와 복습 로그에 함께 저장한다. */
export async function recordReview({ card, log }: Outcome): Promise<void> {
  await db.transaction('rw', db.cards, db.reviewLogs, async () => {
    await db.cards.put(card);
    await db.reviewLogs.add(log);
  });
}

export async function saveSettings(patch: Partial<Omit<Settings, 'id'>>): Promise<void> {
  await db.transaction('rw', db.settings, async () => {
    const current = (await db.settings.get('app')) ?? DEFAULT_SETTINGS;
    await db.settings.put({ ...current, ...patch });
  });
}
