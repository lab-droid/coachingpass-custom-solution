import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      build: {
        rollupOptions: {
          // Keep the dependencies declared in index.html's importmap as bare
          // imports so the browser loads their browser-compatible builds from
          // esm.sh. Bundling the Node build of `mammoth` pulls in `process`/
          // `path` references that crash in the browser (blank screen).
          external: [/^react(\/.*)?$/, /^react-dom(\/.*)?$/, '@google/genai', 'mammoth'],
        },
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
