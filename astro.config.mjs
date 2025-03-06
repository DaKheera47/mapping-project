import tailwindcss from "@tailwindcss/vite";
// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
	integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
  output: 'server',
  adapter: vercel(),
	experimental: {
		svg: {
			mode: "sprite",
		},
},
});
