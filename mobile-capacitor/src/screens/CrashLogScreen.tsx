import { useCallback, useEffect, useState } from 'react';
import { Button, Snackbar, TopBar } from '../components/ui';

interface CrashLogScreenProps {
  readLog: () => Promise<string>;
  clearLog: () => Promise<void>;
  onBack: () => void;
}

/** Layar untuk melihat, menyalin, dan menghapus log tersimpan (padanan CrashLogScreen.kt). */
export function CrashLogScreen({ readLog, clearLog, onBack }: CrashLogScreenProps) {
  const [content, setContent] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const clearMessage = useCallback(() => {
    setMessage(null);
  }, []);

  useEffect(() => {
    let active = true;
    void readLog().then((text) => {
      if (active) setContent(text);
    });
    return () => {
      active = false;
    };
  }, [readLog]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setMessage('Log disalin');
    } catch {
      setMessage('Gagal menyalin log');
    }
  };

  const clear = async () => {
    await clearLog();
    setContent(await readLog());
    setMessage('Log dihapus');
  };

  return (
    <>
      <TopBar title="Log" onBack={onBack} />
      <main className="flex flex-col gap-lg p-screen">
        <div className="flex gap-sm">
          <Button className="flex-1" onClick={() => void copy()}>
            Copy Log
          </Button>
          <Button variant="danger" className="flex-1" onClick={() => void clear()}>
            Clear Log
          </Button>
        </div>
        <pre className="text-label wrap-break-word whitespace-pre-wrap font-mono">{content}</pre>
      </main>
      <Snackbar message={message} onConsumed={clearMessage} duration="short" />
    </>
  );
}
