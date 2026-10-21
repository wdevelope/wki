import { useEffect, useState } from 'react';
import { seedWords } from './db/seed.ts';
import { HREF, useHashRoute } from './hooks/useHashRoute.ts';
import HomeScreen from './screens/HomeScreen.tsx';
import StudyScreen from './screens/StudyScreen.tsx';
import TabBar from './screens/TabBar.tsx';

export default function App() {
  const route = useHashRoute();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    seedWords().then(
      () => setReady(true),
      (e: unknown) => setError(e instanceof Error ? e.message : String(e)),
    );
  }, []);

  if (error) return <p className="status">{error}</p>;
  if (!ready) return <p className="status">단어 데이터를 준비하는 중…</p>;

  if (route === 'study') {
    return <StudyScreen onExit={() => (window.location.hash = HREF.today)} />;
  }
  return (
    <>
      {route === 'settings' ? <main className="settings">설정</main> : <HomeScreen />}
      <TabBar route={route} />
    </>
  );
}
