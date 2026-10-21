const DAY_MS = 86_400_000;
// Asia/Seoul은 1988년 이후 서머타임이 없어 UTC+9 고정
const KST_OFFSET_MS = 9 * 3_600_000;

/** Asia/Seoul 기준 날짜 키 'YYYY-MM-DD' */
export function dayKey(ms: number): string {
  return new Date(ms + KST_OFFSET_MS).toISOString().slice(0, 10);
}

function prevDay(key: string): string {
  return new Date(Date.parse(`${key}T00:00:00Z`) - DAY_MS).toISOString().slice(0, 10);
}

/** 연속 학습 일수. 오늘 아직 학습하지 않았으면 어제까지의 연속을 센다. */
export function streak(studiedDays: ReadonlySet<string>, today: string): number {
  let day = studiedDays.has(today) ? today : prevDay(today);
  let count = 0;
  while (studiedDays.has(day)) {
    count++;
    day = prevDay(day);
  }
  return count;
}
