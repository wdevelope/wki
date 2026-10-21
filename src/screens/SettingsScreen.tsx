import { useState, type ChangeEvent } from 'react';
import { saveSettings } from '../db/actions.ts';
import { exportBackup, importBackup } from '../db/backup.ts';
import { useSettings } from '../db/queries.ts';
import { parseBackup } from '../lib/backup.ts';
import { dayKey } from '../lib/date.ts';

interface NumberFieldProps {
  label: string;
  hint?: string;
  value: number;
  min: number;
  max: number;
  onSave: (value: number) => void;
}

/** 입력을 마칠 때(포커스 해제·Enter) 범위 안으로 맞춰 저장하는 숫자 입력 */
function NumberField({ label, hint, value, min, max, onSave }: NumberFieldProps) {
  const [draft, setDraft] = useState(String(value));

  const commit = () => {
    const n = Math.round(Number(draft));
    if (draft.trim() === '' || !Number.isFinite(n)) {
      setDraft(String(value));
      return;
    }
    const clamped = Math.min(max, Math.max(min, n));
    setDraft(String(clamped));
    if (clamped !== value) onSave(clamped);
  };

  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <input
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
      />
      {hint && <span className="field-hint">{hint}</span>}
    </label>
  );
}

async function saveFile(json: string, fileName: string) {
  const file = new File([json], fileName, { type: 'application/json' });
  // 모바일(특히 iOS 홈 화면 앱)은 다운로드 대신 공유 시트로 '파일에 저장'
  if (matchMedia('(pointer: coarse)').matches && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file] });
    } catch (e) {
      if (!(e instanceof DOMException && e.name === 'AbortError')) throw e;
    }
    return;
  }
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function SettingsScreen() {
  const settings = useSettings();
  const [message, setMessage] = useState<string | null>(null);

  if (!settings) return null;

  const onExport = async () => {
    try {
      const backup = await exportBackup();
      await saveFile(JSON.stringify(backup), `wki-backup-${dayKey(Date.now())}.json`);
      setMessage(`카드 ${backup.cards.length}개, 복습 기록 ${backup.reviewLogs.length}개를 내보냈어요.`);
    } catch (e) {
      setMessage(`내보내지 못했어요: ${e instanceof Error ? e.message : String(e)}`);
    }
  };

  const onImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    try {
      const backup = parseBackup(JSON.parse(await file.text()));
      const ok = window.confirm(
        `현재 학습 기록을 지우고 백업(카드 ${backup.cards.length}개, 복습 기록 ${backup.reviewLogs.length}개)으로 바꿉니다. 계속할까요?`,
      );
      if (!ok) return;
      await importBackup(backup);
      setMessage('백업을 가져왔어요.');
    } catch (e) {
      const reason = e instanceof SyntaxError ? 'JSON 파일이 아닙니다.' : e instanceof Error ? e.message : String(e);
      setMessage(`가져오지 못했어요: ${reason}`);
    }
  };

  return (
    <main className="settings">
      <h1 className="page-title">설정</h1>

      <section className="group">
        <h2>학습</h2>
        <NumberField
          key={`new-${settings.newPerDay}`}
          label="하루 새 단어 수"
          value={settings.newPerDay}
          min={0}
          max={200}
          onSave={(newPerDay) => saveSettings({ newPerDay })}
        />
        <NumberField
          key={`start-${settings.startRank}`}
          label="시작 순위"
          hint="이 빈도 순위부터 새 단어를 꺼냅니다. 이미 학습한 단어의 복습에는 영향이 없어요."
          value={settings.startRank}
          min={1}
          max={2809}
          onSave={(startRank) => saveSettings({ startRank })}
        />
        <label className="field field-switch">
          <span className="field-label">발음 자동 재생</span>
          <input
            type="checkbox"
            role="switch"
            checked={settings.autoPlay}
            onChange={(e) => saveSettings({ autoPlay: e.target.checked })}
          />
        </label>
      </section>

      <section className="group">
        <h2>백업</h2>
        <p className="group-note">설정과 학습 기록 전체를 JSON 파일로 내보내거나, 내보낸 파일로 되돌립니다.</p>
        <div className="backup-actions">
          <button type="button" className="button" onClick={onExport}>
            내보내기
          </button>
          <label className="button button-secondary">
            가져오기
            <input type="file" accept="application/json,.json" onChange={onImport} hidden />
          </label>
        </div>
        {message && (
          <p className="backup-message" role="status">
            {message}
          </p>
        )}
      </section>

      <section className="group credits">
        <h2>단어 목록 출처</h2>
        <p>
          <a href="https://www.newgeneralservicelist.com/new-general-service-list" target="_blank" rel="noreferrer">
            New General Service List (NGSL) 1.2
          </a>
          , Browne, C., Culligan, B., &amp; Phillips, J.
        </p>
        <p>
          원본 목록은{' '}
          <a href="https://creativecommons.org/licenses/by-sa/4.0/deed.ko" target="_blank" rel="noreferrer">
            CC BY-SA 4.0
          </a>{' '}
          라이선스를 따릅니다. 이 앱은 원본에 한국어 뜻, 예문, 예문 해석을 더했으며, 이 단어 데이터도 같은
          라이선스로 배포합니다.
        </p>
      </section>
    </main>
  );
}
