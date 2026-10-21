import { useEffect, useState } from 'react';
import type { Grade } from 'ts-fsrs';
import { recordReview } from '../db/actions.ts';
import { highlightWord } from '../lib/highlight.ts';
import type { Word } from '../lib/ngsl-csv.ts';
import { previewOutcomes, type CardState, type Outcome } from '../lib/scheduler.ts';
import { speak } from '../lib/speech.ts';
import RatingBar from './RatingBar.tsx';

interface Props {
  word: Word;
  /** 없으면 새 카드 */
  card: CardState | undefined;
  autoPlay: boolean;
}

/** '[동] 설립하다 / [명] ...' 형식의 뜻을 품사 태그와 함께 줄 단위로 보여 준다. */
function Meaning({ text }: { text: string }) {
  return (
    <ul className="card-meaning">
      {text.split(' / ').map((line) => {
        const [, pos, rest] = /^\[(.+?)\]\s*(.*)$/.exec(line) ?? [];
        return (
          <li key={line}>
            {pos && <span className="pos">{pos}</span>}
            {rest ?? line}
          </li>
        );
      })}
    </ul>
  );
}

export default function Flashcard({ word, card, autoPlay }: Props) {
  // 뒤집는 순간의 시각으로 4개 결과를 계산해 버튼 표시와 저장에 함께 쓴다
  const [outcomes, setOutcomes] = useState<Record<Grade, Outcome> | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (autoPlay) speak(word.word);
  }, [autoPlay, word.word]);

  const reveal = () => setOutcomes(previewOutcomes(word.rank, card, Date.now()));

  const rate = async (grade: Grade) => {
    if (!outcomes || saving) return;
    setSaving(true);
    try {
      await recordReview(outcomes[grade]);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <article className={outcomes ? 'card is-back' : 'card'}>
        <div className="card-head">
          <span className="card-rank">빈도 {word.rank}위</span>
          <button
            type="button"
            className="speak"
            onClick={() => speak(word.word)}
            aria-label={`${word.word} 발음 듣기`}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 9v6h4l5 4V5L8 9H4z" />
              <path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" fill="none" />
            </svg>
          </button>
        </div>

        {outcomes ? (
          <div className="card-back">
            <h1 className="card-word" lang="en">
              {word.word}
            </h1>
            <Meaning text={word.meaning} />
            <p className="card-example" lang="en">
              {highlightWord(word.example, word.word).map((s, i) =>
                s.hit ? <mark key={i}>{s.text}</mark> : s.text,
              )}
            </p>
            <p className="card-example-ko">{word.exampleKo}</p>
          </div>
        ) : (
          <button type="button" className="card-front" onClick={reveal}>
            <span className="card-word" lang="en">
              {word.word}
            </span>
            <span className="card-hint">탭해서 뜻 보기</span>
          </button>
        )}
      </article>

      {outcomes && <RatingBar outcomes={outcomes} disabled={saving} onRate={rate} />}
    </>
  );
}
