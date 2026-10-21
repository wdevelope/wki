import { useCallback, useEffect, useState } from 'react';
import { useSettings, useTodayQueue } from '../db/queries.ts';
import { useOnResume } from '../hooks/useOnResume.ts';
import { LEARN_AHEAD_MS } from '../lib/queue.ts';
import Flashcard from './Flashcard.tsx';

const timeFormat = new Intl.DateTimeFormat('ko-KR', {
  timeZone: 'Asia/Seoul',
  hour: 'numeric',
  minute: '2-digit',
});

export default function StudyScreen({ onExit }: { onExit: () => void }) {
  const [tick, setTick] = useState(0);
  const queue = useTodayQueue(tick);
  const settings = useSettings();

  // 할 카드가 없을 때 남은 학습 단계 카드가 미리 보기 범위에 들어오면 큐를 다시 계산한다
  const wakeAt =
    queue && !queue.current && queue.nextLaterDue !== null
      ? queue.nextLaterDue - LEARN_AHEAD_MS
      : null;
  useEffect(() => {
    if (wakeAt === null) return;
    const id = setTimeout(() => setTick((t) => t + 1), Math.max(0, wakeAt - Date.now()));
    return () => clearTimeout(id);
  }, [wakeAt]);

  // 완료 화면에서 앱으로 돌아오면(다음 날 등) 다시 계산한다.
  // 카드를 보는 중에는 다시 계산하지 않아 보던 카드가 바뀌지 않게 한다.
  const finished = queue !== undefined && queue.current === null;
  useOnResume(
    useCallback(() => setTick((t) => t + 1), []),
    finished,
  );

  if (!queue || !settings) return null;
  const { current, word } = queue;

  return (
    <div className="study">
      <header className="study-bar">
        <button type="button" className="icon-button" onClick={onExit} aria-label="학습 닫기">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        <p className="counts">
          <span className="count-due">복습 {queue.dueCount}</span>
          <span className="count-new">새 단어 {queue.newCount}</span>
          {queue.laterCount > 0 && <span className="count-later">대기 {queue.laterCount}</span>}
        </p>
      </header>

      {current && word ? (
        <Flashcard
          key={`${current.rank}-${current.card?.reps ?? 0}`}
          word={word}
          card={current.card}
          autoPlay={settings.autoPlay}
        />
      ) : (
        <section className="finished">
          <h1>오늘 학습을 마쳤어요</h1>
          {queue.nextLaterDue !== null ? (
            <p>
              {timeFormat.format(queue.nextLaterDue)}에 다시 볼 카드가 {queue.laterCount}장 있어요.
              이 화면을 열어 두면 자동으로 이어집니다.
            </p>
          ) : (
            <p>내일 다시 만나요.</p>
          )}
          <button type="button" className="button" onClick={onExit}>
            오늘 화면으로
          </button>
        </section>
      )}
    </div>
  );
}
