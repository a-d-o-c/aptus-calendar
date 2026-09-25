import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

/**
 * Next resolves the "@/" alias itself; Vitest runs outside Next, so it needs
 * spelling out. Nothing here changes how the app builds — it only lets the
 * tests import what the app imports. JSX needs no setting: Vitest's own
 * transform handles it.
 */
export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('.', import.meta.url)) },
  },
});
