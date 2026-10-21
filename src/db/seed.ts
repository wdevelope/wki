import type { Word } from '../lib/ngsl-csv.ts';
import { db } from './schema.ts';

/** 첫 실행 때 ngsl.json을 words 테이블에 넣는다. 이미 있으면 아무것도 하지 않는다. */
export async function seedWords(): Promise<void> {
  if ((await db.words.count()) > 0) return;
  const res = await fetch(`${import.meta.env.BASE_URL}ngsl.json`);
  if (!res.ok) throw new Error(`단어 데이터를 불러오지 못했습니다 (HTTP ${res.status})`);
  const words = (await res.json()) as Word[];
  await db.words.bulkPut(words);
}
