import Constants from 'expo-constants';

// Mengambil URL dari extra app.json atau fallback ke production URL
const WEB_API_URL = 
  Constants.expoConfig?.extra?.WEB_API_URL || 
  'https://aumonext-api.onrender.com';

export const CONFIG = {
  API_BASE_URL: WEB_API_URL,
  TOKEN_KEY: 'auth_token',
  TIMEOUT: 15000,
} as const;