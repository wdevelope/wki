import { useCallback, useState } from 'react';
import { useProgress, useTodayQueue } from '../db/queries.ts';
import { HREF } from '../hooks/useHashRoute.ts';
import { useOnResume } from '../hooks/useOnResume.ts';

const dateFormat = new Intl.DateTimeFormat('ko-KR', {
  timeZone: 'Asia/Seoul',
  month: 'long',
  day: 'numeric',
  weekday: 'long',
});

function summary(dueCount: number, newCount: number): string {
  if (dueCount > 0 && newCount > 0) return `복습 ${dueCount}장과 새 단어 ${newCount}개가 남았어요.`;
  if (dueCount > 0) return `복습 ${dueCount}장이 남았어요.`;
  if (newCount > 0) return `새 단어 ${newCount}개가 남았어요.`;
  return '곧 다시 볼 카드가 있어요.';
}

export default function HomeScreen() {
  // 앱으로 돌아올 때마다 그 시각 기준으로 날짜·남은 카드·통계를 다시 계산
  const [tick, setTick] = useState(0);
  useOnResume(useCallback(() => setTick((t) => t + 1), []));
  const queue = useTodayQueue(tick);
  const progress = useProgress(tick);
  if (!queue || !progress) return null;

  const { dueCount, newCount } = queue;
  const coverage = progress.totalWords ? progress.studiedWords / progress.totalWords : 0;

  return (
    <main className="home">
      <h1 className="home-date">{dateFormat.format(Date.now())}</h1>

      <section className="today">
        {queue.current ? (
          <>
            <p className="today-summary">{summary(dueCount, newCount)}</p>
            <a className="button today-start" href={HREF.study}>
              학습 시작
            </a>
          </>
        ) : (
          <p className="today-summary">오늘 할 카드를 모두 마쳤어요.</p>
        )}
      </section>

      <dl className="stats">
        <div>
          <dt>오늘 학습</dt>
          <dd>
            {progress.reviewsToday}회
            {progress.newToday > 0 && <span className="stats-sub">새 단어 {progress.newToday}개</span>}
          </dd>
        </div>
        <div>
          <dt>연속 학습</dt>
          <dd>{progress.streak}일</dd>
        </div>
        <div>
          <dt>누적 단어</dt>
          <dd>
            {progress.studiedWords.toLocaleString()}
            <span className="stats-sub">/ {progress.totalWords.toLocaleString()}</span>
          </dd>
          <div
            className="coverage"
            role="progressbar"
            aria-label="NGSL 단어 중 학습한 비율"
            aria-valuenow={Math.round(coverage * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div style={{ width: `${coverage * 100}%` }} />
          </div>
        </div>
      </dl>
    </main>
  );
}
