import { Rating, type Grade } from 'ts-fsrs';
import { formatInterval, GRADES, type Outcome } from '../lib/scheduler.ts';

const LABELS: Record<Grade, string> = {
  [Rating.Again]: 'Again',
  [Rating.Hard]: 'Hard',
  [Rating.Good]: 'Good',
  [Rating.Easy]: 'Easy',
};

interface Props {
  outcomes: Record<Grade, Outcome>;
  disabled: boolean;
  onRate: (grade: Grade) => void;
}

export default function RatingBar({ outcomes, disabled, onRate }: Props) {
  return (
    <div className="rating-bar">
      {GRADES.map((grade) => {
        const { card, log } = outcomes[grade];
        return (
          <button
            key={grade}
            type="button"
            className={`rate rate-${LABELS[grade].toLowerCase()}`}
            disabled={disabled}
            onClick={() => onRate(grade)}
          >
            <span className="rate-interval">{formatInterval(card.due - log.review)}</span>
            <span className="rate-label">{LABELS[grade]}</span>
          </button>
        );
      })}
    </div>
  );
}
