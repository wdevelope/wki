/** 영어 발음을 재생한다 (Web Speech API). 지원하지 않는 브라우저에서는 아무것도 하지 않는다. */
export function speak(text: string): void {
  if (!('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = 0.9;
  speechSynthesis.speak(utterance);
}
