const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  environment: import.meta.env.MODE,
  isProduction: import.meta.env.PROD,
  isDevelopment: import.meta.env.DEV,
};

export default config;
