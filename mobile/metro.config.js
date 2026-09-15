// eslint-disable-next-line @typescript-eslint/no-var-requires
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// @tabler/icons-react-native (>=3.x) sets its package.json "react-native"
// field to an ESM (.mjs) build. Metro's default resolver on this project's
// Expo SDK (49) doesn't include "mjs" in sourceExts, so it fails to resolve
// that file even though a CJS build ("main" field) exists right next to it.
// Registering "mjs" as a recognized source extension lets Metro load it
// (Babel already knows how to transform ES module syntax).
config.resolver.sourceExts.push('mjs');

module.exports = config;
