import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
    server: {
        port: 3000,
        open: true,
        strictPort: true,
    },
    plugins: [
        tailwindcss(),
    ],
});