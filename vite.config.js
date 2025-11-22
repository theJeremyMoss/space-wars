import { defineConfig } from 'vite';

export default defineConfig({
    base: './', // Relative base path for GitHub Pages
    build: {
        assetsInlineLimit: 0, // Ensure assets are not inlined as base64
    },
    server: {
        host: true
    }
});
