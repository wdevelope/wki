import { useEffect, useState } from 'react';
import { seedWords } from './db/seed.ts';
import { requestPersistentStorage } from './db/storage.ts';
import { HREF, useHashRoute } from './hooks/useHashRoute.ts';
import HomeScreen from './screens/HomeScreen.tsx';
import SettingsScreen from './screens/SettingsScreen.tsx';
import StudyScreen from './screens/StudyScreen.tsx';
import TabBar from './screens/TabBar.tsx';

export default function App() {
  const route = useHashRoute();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 승인되지 않아도 앱은 그대로 동작하므로 결과를 기다리지 않는다
    requestPersistentStorage().catch(() => {});
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
      {route === 'settings' ? <SettingsScreen /> : <HomeScreen />}
      <TabBar route={route} />
    </>
  );
}
