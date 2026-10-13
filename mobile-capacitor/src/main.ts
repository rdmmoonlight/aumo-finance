import './index.css';
import { installGlobalErrorHandlers } from './logging/logger';
import { mountCatalog } from './screens/catalog';
import { mountCrashLog } from './screens/crashLog';
import { authService, logger } from './services';

const root = document.getElementById('root');
if (!root) throw new Error('Elemen #root tidak ditemukan');

installGlobalErrorHandlers(logger);

// Navigasi sementara (Fase 3-4). Router sungguhan menyusul di Fase 5.
let cleanup: (() => void) | null = null;

function show(view: 'catalog' | 'crashlog'): void {
  cleanup?.();
  if (!root) return;
  cleanup =
    view === 'crashlog'
      ? mountCrashLog(root, {
          readLog: () => logger.read(),
          clearLog: () => logger.clear(),
          onBack: () => {
            show('catalog');
          },
        })
      : mountCatalog(root, {
          onOpenCrashLog: () => {
            show('crashlog');
          },
          signIn: (params) => authService.signIn(params),
        });
}

show('catalog');
