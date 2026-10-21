import { describe, expect, it } from 'vitest';
import { highlightWord } from './highlight.ts';

const hits = (sentence: string, word: string) =>
  highlightWord(sentence, word)
    .filter((s) => s.hit)
    .map((s) => s.text);

describe('highlightWord', () => {
  it('대소문자 구분 없이 기본형을 찾는다', () => {
    expect(hits('He works as a nurse.', 'he')).toEqual(['He']);
  });

  it.each([
    ['ask', 'I asked my boss.', 'asked'],
    ['kid', 'The kids are playing.', 'kids'],
    ['make', 'She is making dinner.', 'making'],
    ['try', 'I tried to fix it.', 'tried'],
    ['study', 'He studies at night.', 'studies'],
    ['pop', 'A message popped up.', 'popped'],
    ['ban', 'The city banned smoking.', 'banned'],
  ])('%s → %s의 %s', (word, sentence, expected) => {
    expect(hits(sentence, word)).toEqual([expected]);
  });

  it('다른 단어의 일부는 강조하지 않는다', () => {
    expect(hits('Good food is good for you.', 'go')).toEqual([]);
  });

  it('한 글자 단어는 그대로만 찾는다', () => {
    expect(hits('I think it is a good idea, as I said.', 'a')).toEqual(['a']);
    expect(hits('I think it is good.', 'I')).toEqual(['I']);
  });

  it('조각을 이으면 원문과 같다', () => {
    const sentence = "Let's meet at the station at six.";
    expect(
      highlightWord(sentence, 'at')
        .map((s) => s.text)
        .join(''),
    ).toBe(sentence);
  });

  it('불규칙 변화형은 찾지 못한다 (알려진 제약)', () => {
    expect(hits('I saw a great movie.', 'see')).toEqual([]);
  });
});
