import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  integrations: [tailwind()],
    content: ['./src/**/*.{html,js,astro,svelte}'],
  theme: {
    extend: {},
  },
  plugins: [],
});
