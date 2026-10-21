import { useEffect, useState } from 'react';
import { seedWords } from './db/seed.ts';

export default function App() {
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
  return <main>WKI 단어장</main>;
}
