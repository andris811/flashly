import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwind from '@tailwindcss/vite'

export default defineConfig( () => {
  const useRemote = process.env.FLASHLY_USE_REMOTE === 'true';
  return {
    plugins: [react(), tailwind()],
    base: useRemote ? '/' : './', // '/' for Vercel, './' for bundled (Phase 6)
  };
});
