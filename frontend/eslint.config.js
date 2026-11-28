/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: [
      "node_modules/**",
      "out/**",
      "build/**",
      "dist/**",
      "src/routeTree.gen.ts",
      "**/*lock*",
    ],
  },
  {
    plugins: {},
    rules: {},
    settings: {},
  },
];
