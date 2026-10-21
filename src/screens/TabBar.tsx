import { HREF, type Route } from '../hooks/useHashRoute.ts';

export default function TabBar({ route }: { route: Route }) {
  return (
    <nav className="tab-bar">
      <a href={HREF.today} aria-current={route === 'today' ? 'page' : undefined}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="4" y="5" width="16" height="15" rx="2" fill="none" />
          <path d="M4 10h16M9 3v4M15 3v4" />
        </svg>
        오늘
      </a>
      <a href={HREF.settings} aria-current={route === 'settings' ? 'page' : undefined}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 7h10M18 7h2M4 17h2M10 17h10" />
          <circle cx="16" cy="7" r="2" fill="none" />
          <circle cx="8" cy="17" r="2" fill="none" />
        </svg>
        설정
      </a>
    </nav>
  );
}
