module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      "expo-router/babel",
      // @tanstack/react-query's package.json "react-native" field points at
      // its raw src/*.ts (uses private class methods, e.g. MutationObserver
      // #updateResult) instead of a compiled build. babel-preset-expo on
      // this project's SDK (49) doesn't enable this transform by default.
      ["@babel/plugin-transform-private-methods", { loose: true }],
    ],
  };
};
