import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig(({ command }) => {
    // Use relative paths for dev, absolute path for production builds
    const base = command === 'build' ? '/space-wars/' : './';
    
    return {
        base,
        plugins: [
            viteStaticCopy({
                targets: [
                    {
                        src: 'assets/*',
                        dest: 'assets'
                    }
                ]
            })
        ],
        build: {
            assetsInlineLimit: 0, // Ensure assets are not inlined as base64
        },
        server: {
            host: true
        }
    };
}); 