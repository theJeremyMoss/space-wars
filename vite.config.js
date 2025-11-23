import { defineConfig } from 'vite';

export default defineConfig(({ command }) => {
    // Use relative paths for dev, absolute path for production builds
    const base = command === 'build' ? '/space-wars/' : './';
    
    return {
        base,
        build: {
            assetsInlineLimit: 0, // Ensure assets are not inlined as base64
        },
        server: {
            host: true
        }
    };
}); 