import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiPort = parseInt(env.API_PORT) || 3848;
  return {
    server: {
      port: parseInt(env.PORT) || 3847,
      proxy: {
        '/api': {
          target: `http://localhost:${apiPort}`,
          changeOrigin: true
        }
      }
    }
  };
});
