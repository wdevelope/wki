export interface Segment {
  text: string;
  hit: boolean;
}

const VOWELS = new Set(['a', 'e', 'i', 'o', 'u']);

/** 기본형과 규칙 변화형(-s/-es/-ed/-ing, e 탈락, y→ies/ied, 자음 중복) 목록 */
function inflections(word: string): Set<string> {
  const w = word.toLowerCase();
  // a·I에 붙이면 as·is처럼 다른 단어가 되므로 한 글자 단어는 그대로만 찾는다
  if (w.length === 1) return new Set([w]);
  const forms = new Set([w, `${w}s`, `${w}es`, `${w}ed`, `${w}d`, `${w}ing`]);
  const last = w.at(-1) ?? '';
  const beforeLast = w.at(-2) ?? '';
  if (last === 'e') forms.add(`${w.slice(0, -1)}ing`);
  if (last === 'y' && !VOWELS.has(beforeLast)) {
    const stem = w.slice(0, -1);
    forms.add(`${stem}ies`).add(`${stem}ied`);
  }
  if (!VOWELS.has(last) && VOWELS.has(beforeLast)) {
    forms.add(`${w}${last}ed`).add(`${w}${last}ing`);
  }
  return forms;
}

/** 예문을 조각으로 나누고 단어(와 규칙 변화형)에 해당하는 조각을 표시한다. */
export function highlightWord(sentence: string, word: string): Segment[] {
  const forms = inflections(word);
  return sentence
    .split(/([A-Za-z]+)/)
    .filter((text) => text !== '')
    .map((text) => ({ text, hit: forms.has(text.toLowerCase()) }));
}
