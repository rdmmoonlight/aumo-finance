import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  outDir: 'dist',

  clean: true,
  sourcemap: true,
  minify: false,
  splitting: false,

  target: 'node20',
  platform: 'node',

  dts: false,
  treeshake: false,

  // Cukup bundle Zod saja ke dalam dist/index.js agar tidak ReferenceError,
  // sementara node_modules lainnya tetap eksternal.
  noExternal: ['zod'],
});
