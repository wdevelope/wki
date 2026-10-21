/**
 * 저장 공간이 부족해도 브라우저가 학습 기록을 지우지 않도록 영구 저장을 요청한다.
 * 승인은 브라우저가 정한다 (Safari는 홈 화면 앱 여부, Chrome은 설치·사용 빈도 등으로 판단).
 */
export async function requestPersistentStorage(): Promise<boolean> {
  if (!navigator.storage?.persist) return false;
  return (await navigator.storage.persisted()) || navigator.storage.persist();
}
