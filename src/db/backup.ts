import type { Backup } from '../lib/backup.ts';
import { db, DEFAULT_SETTINGS } from './schema.ts';

/** 설정과 학습 기록 전체 (단어 데이터는 ngsl.json에서 다시 만들 수 있어 제외) */
export async function exportBackup(): Promise<Backup> {
  return db.transaction('r', db.settings, db.cards, db.reviewLogs, async () => {
    const [settings, cards, reviewLogs] = await Promise.all([
      db.settings.get('app'),
      db.cards.toArray(),
      db.reviewLogs.toArray(),
    ]);
    return {
      app: 'wki',
      version: 1,
      exportedAt: new Date().toISOString(),
      settings: settings ?? DEFAULT_SETTINGS,
      cards,
      reviewLogs,
    };
  });
}

/** 현재 설정과 학습 기록을 백업 내용으로 통째로 바꾼다. */
export async function importBackup(backup: Backup): Promise<void> {
  await db.transaction('rw', db.settings, db.cards, db.reviewLogs, async () => {
    await Promise.all([db.cards.clear(), db.reviewLogs.clear()]);
    await db.settings.put(backup.settings);
    await db.cards.bulkAdd(backup.cards);
    await db.reviewLogs.bulkAdd(backup.reviewLogs);
  });
}
