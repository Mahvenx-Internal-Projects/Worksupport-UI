export const ENV = {
  API_URL:          (process.env.REACT_APP_API_URL ?? 'https://localhost:65257').replace(/\/+$/, ''),
  GOOGLE_CLIENT_ID: process.env.REACT_APP_GOOGLE_CLIENT_ID || '33681586909-67i3qmrm8aom6tfanqjkq9gc5c4lai49.apps.googleusercontent.com',
  WHATSAPP:         process.env.REACT_APP_WHATSAPP        || '9441363687',
  IS_DEV:           process.env.NODE_ENV === 'development',
} as const;
