import Dexie, { type EntityTable } from 'dexie';
import type { Word } from '../lib/ngsl-csv.ts';
import type { CardState, ReviewLogEntry } from '../lib/scheduler.ts';

export interface Settings {
  id: 'app';
  newPerDay: number;
  startRank: number;
  autoPlay: boolean;
}

export const DEFAULT_SETTINGS: Settings = { id: 'app', newPerDay: 30, startRank: 1, autoPlay: true };

export const db = new Dexie('wki') as Dexie & {
  words: EntityTable<Word, 'rank'>;
  cards: EntityTable<CardState, 'rank'>;
  reviewLogs: EntityTable<ReviewLogEntry, 'id'>;
  settings: EntityTable<Settings, 'id'>;
};

db.version(1).stores({
  words: 'rank',
  cards: 'rank',
  reviewLogs: '++id, day',
  settings: 'id',
});
