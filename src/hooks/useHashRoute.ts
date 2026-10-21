import { useSyncExternalStore } from 'react';

export type Route = 'today' | 'study' | 'settings';

export const HREF: Record<Route, string> = {
  today: '#/',
  study: '#/study',
  settings: '#/settings',
};

function subscribe(onChange: () => void) {
  window.addEventListener('hashchange', onChange);
  return () => window.removeEventListener('hashchange', onChange);
}

/** 현재 해시 라우트. 알 수 없는 해시는 오늘 화면으로 본다. */
export function useHashRoute(): Route {
  const hash = useSyncExternalStore(subscribe, () => window.location.hash);
  return (Object.keys(HREF) as Route[]).find((route) => HREF[route] === hash) ?? 'today';
}
