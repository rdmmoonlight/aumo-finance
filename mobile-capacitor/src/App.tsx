import { useCallback, useState } from 'react';
import { IconCalendar, IconPlus, IconTrash } from '@tabler/icons-react';
import {
  Button,
  Card,
  ConfirmDialog,
  Input,
  List,
  ListItem,
  Skeleton,
  Snackbar,
  TopBar,
} from './components/ui';
import { authService, logger } from './services';
import { CrashLogScreen } from './screens/CrashLogScreen';
import { LoginTestSection } from './screens/LoginTestSection';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-lg">
      <h2 className="text-h3 font-bold">{title}</h2>
      {children}
    </section>
  );
}

const typeScale = [
  ['text-display', 'Display 32'],
  ['text-h1', 'H1 28'],
  ['text-h2', 'H2 24'],
  ['text-h3', 'H3 20'],
  ['text-h4', 'H4 18'],
  ['text-body', 'Body 16'],
  ['text-secondary', 'Secondary 14'],
  ['text-caption', 'Caption 13'],
  ['text-label', 'Label 12'],
  ['text-label-sm', 'Label kecil 11'],
] as const;

/** Katalog komponen internal (Fase 3). Diganti router pada Fase 5. */
function Catalog({ onOpenCrashLog }: { onOpenCrashLog: () => void }) {
  const [message, setMessage] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const clearMessage = useCallback(() => {
    setMessage(null);
  }, []);

  return (
    <>
      <TopBar
        title="Katalog Komponen"
        onBack={() => {
          setMessage('Tombol kembali ditekan');
        }}
      />
      <main className="flex flex-col gap-lg p-screen pb-24">
        <Section title="Tombol">
          <Button fullWidth>
            <IconPlus size={20} />
            Tambah
          </Button>
          <Button variant="outline" fullWidth>
            Batal
          </Button>
          <Button
            variant="danger"
            fullWidth
            onClick={() => {
              setConfirmOpen(true);
            }}
          >
            <IconTrash size={20} />
            Hapus
          </Button>
          <Button fullWidth disabled>
            Nonaktif
          </Button>
        </Section>

        <Section title="Input">
          <Input label="Nama akun" placeholder="Kas" />
          <Input label="Tanggal" placeholder="2026-10-12" error="Format tanggal tidak valid" />
        </Section>

        <Section title="Card">
          <Card>
            <p className="text-caption text-content-muted">Saldo kas</p>
            <p className="text-h2 font-bold">Rp35.000</p>
          </Card>
          <Card elevated>
            <p className="text-secondary text-content-secondary">Kartu terangkat</p>
          </Card>
        </Section>

        <Section title="List">
          <List>
            <ListItem
              title="Periode Oktober 2026"
              supporting="Terbuka"
              leading={<IconCalendar size={24} />}
              onClick={() => {
                setMessage('Periode dipilih');
              }}
            />
            <ListItem
              title="Periode September 2026"
              supporting="Ditutup"
              leading={<IconCalendar size={24} />}
            />
          </List>
        </Section>

        <Section title="Skeleton">
          <Card className="flex flex-col gap-sm">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-8 w-2/3" />
          </Card>
        </Section>

        <Section title="Snackbar dan Dialog">
          <Button
            variant="outline"
            fullWidth
            onClick={() => {
              setMessage('Data berhasil disimpan');
            }}
          >
            Tampilkan Snackbar
          </Button>
        </Section>

        <Section title="Log">
          <Button variant="outline" fullWidth onClick={onOpenCrashLog}>
            Buka Log
          </Button>
        </Section>

        <Section title="Uji Login API (Fase 4)">
          <LoginTestSection signIn={(params) => authService.signIn(params)} />
        </Section>

        <Section title="Tipografi">
          {typeScale.map(([cls, label]) => (
            <p key={cls} className={cls}>
              {label}
            </p>
          ))}
        </Section>

        <Section title="Warna">
          <div className="grid grid-cols-3 gap-sm text-label">
            {[
              ['bg-primary', 'Primary'],
              ['bg-background border border-outline', 'Background'],
              ['bg-surface', 'Surface'],
              ['bg-surface-elevated', 'Elevated'],
              ['bg-good', 'Good'],
              ['bg-bad', 'Bad'],
            ].map(([cls, label]) => (
              <div
                key={label}
                className={`${cls} flex h-button items-center justify-center rounded-lg`}
              >
                {label}
              </div>
            ))}
          </div>
        </Section>
      </main>

      <ConfirmDialog
        open={confirmOpen}
        title="Hapus entri?"
        message="Tindakan ini tidak dapat dibatalkan."
        confirmText="Hapus"
        dismissText="Batal"
        destructive
        onConfirm={() => {
          setConfirmOpen(false);
          setMessage('Entri dihapus');
        }}
        onDismiss={() => {
          setConfirmOpen(false);
        }}
      />
      <Snackbar message={message} onConsumed={clearMessage} duration="short" />
    </>
  );
}

function App() {
  const [view, setView] = useState<'catalog' | 'crashlog'>('catalog');
  const readLog = useCallback(() => logger.read(), []);
  const clearLog = useCallback(() => logger.clear(), []);

  if (view === 'crashlog') {
    return (
      <CrashLogScreen
        readLog={readLog}
        clearLog={clearLog}
        onBack={() => {
          setView('catalog');
        }}
      />
    );
  }
  return (
    <Catalog
      onOpenCrashLog={() => {
        setView('crashlog');
      }}
    />
  );
}

export default App;
