import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
   plugins: [
      sveltekit(),
         SvelteKitPWA({
            manifest: {
               name: 'HIITBeep',
               short_name: 'HIITBeep',
               description: 'Cronómetro HIIT con sonidos y animaciones',
               start_url: '/',
               scope: './',
               display: 'standalone',
               background_color: '#111827',
               theme_color: '#111827',
               icons: [
                  {
                     src: '/favicon.svg',
                     sizes: '192x192',
                     type: 'image/svg+xml'
                  }
               ]
            },
            registerType: 'prompt',
            devOptions: {
               enabled: true
            },
            workbox: {
               globPatterns: ['**/*.{js,css,html,svg,png,ico,txt,woff2}'],
               navigateFallback: null,
               runtimeCaching: [
                  {
                     urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                     handler: 'CacheFirst',
                     options: {
                        cacheName: 'google-fonts-cache',
                        expiration: {
                           maxEntries: 10,
                           maxAgeSeconds: 60 * 60 * 24 * 365
                        }
                     }
                  }
               ]
            }
         })
   ]
});