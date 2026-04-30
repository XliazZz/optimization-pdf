import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';

export default defineConfig({
  output: 'server',

  vite: {
    plugins: [tailwindcss()],
  },

  security: {
    checkOrigin: false,
  },

  adapter: vercel()
});