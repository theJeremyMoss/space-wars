import { defineConfig } from 'vite';

export default defineConfig({
    base: '/space-wars/', // GitHub Pages base path (repo name)
    build: {
        assetsInlineLimit: 0, // Ensure assets are not inlined as base64
    },
    server: {
        host: true
    }
}); 