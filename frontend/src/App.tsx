import { ReduxProvider } from '@/components/redux-provider';
import { ThemeProvider } from '@/components/theme-provider';
import {
  RouterProvider,
  createBrowserHistory,
  createHashHistory,
  createRouter,
} from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';

const isFileProtocol = typeof window !== 'undefined' && window.location.protocol === 'file:';

const history = isFileProtocol ? createHashHistory() : createBrowserHistory();

const router = createRouter({
  routeTree,
  history,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ReduxProvider>
        <RouterProvider router={router} />
      </ReduxProvider>
    </ThemeProvider>
  );
}
