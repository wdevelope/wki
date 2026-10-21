import { useEffect } from 'react';

/**
 * 앱이 다시 화면에 보일 때(백그라운드에서 돌아올 때) onResume을 부른다.
 * 자정을 넘겨 돌아온 경우처럼 시간만 흘러 DB 변경 없이 다시 계산해야 할 때 쓴다.
 * onResume은 렌더마다 같은 함수여야 한다 (useCallback 등).
 */
export function useOnResume(onResume: () => void, enabled = true): void {
  useEffect(() => {
    if (!enabled) return;
    const onChange = () => {
      if (document.visibilityState === 'visible') onResume();
    };
    document.addEventListener('visibilitychange', onChange);
    return () => document.removeEventListener('visibilitychange', onChange);
  }, [onResume, enabled]);
}
