import { useState } from 'react';
import { Button, Card, Input } from '../components/ui';
import type { SignInResult } from '../auth/authService';

interface LoginTestSectionProps {
  signIn: (params: {
    email: string;
    password: string;
    keepSignedIn: boolean;
    enableBiometric: boolean;
  }) => Promise<SignInResult>;
}

/**
 * Uji koneksi Fase 4: memanggil login API sungguhan dari perangkat.
 * Dihapus saat layar Login (Fase 5) selesai.
 */
export function LoginTestSection({ signIn }: LoginTestSectionProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const submit = async () => {
    setBusy(true);
    setResult(null);
    const outcome = await signIn({ email, password, keepSignedIn, enableBiometric: false });
    setResult(outcome.ok ? `Berhasil masuk: ${outcome.fullName}` : `Gagal: ${outcome.message}`);
    setBusy(false);
  };

  return (
    <div className="flex flex-col gap-lg">
      <Input
        label="Email"
        type="email"
        autoComplete="username"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
        }}
      />
      <Input
        label="Kata sandi"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
        }}
      />
      <label className="flex min-h-button items-center gap-sm text-body">
        <input
          type="checkbox"
          className="size-icon-sm accent-primary"
          checked={keepSignedIn}
          onChange={(e) => {
            setKeepSignedIn(e.target.checked);
          }}
        />
        Ingat saya
      </label>
      <Button
        fullWidth
        disabled={busy || email === '' || password === ''}
        onClick={() => void submit()}
      >
        {busy ? 'Memproses...' : 'Masuk'}
      </Button>
      {result && (
        <Card elevated>
          <p className="text-secondary" role="status">
            {result}
          </p>
        </Card>
      )}
    </div>
  );
}
