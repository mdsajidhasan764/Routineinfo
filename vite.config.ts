import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { defineConfig, Plugin } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import { fetchLiveOfficersFromHost } from './src/services/teacherBackendService';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function jashoreOfficersBackendPlugin(): Plugin {
  return {
    name: 'jashore-officers-backend-plugin',
    configureServer(server) {
      server.middlewares.use('/api/teachers', async (req, res) => {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.setHeader('Access-Control-Allow-Origin', '*');

        try {
          // Attempt live fetch from https://jashore.polytech.gov.bd/pages/officers
          const liveData = await fetchLiveOfficersFromHost();
          res.setHeader('X-DataSource', 'https://jashore.polytech.gov.bd/pages/officers (LIVE)');
          res.end(JSON.stringify({
            success: true,
            source: 'https://jashore.polytech.gov.bd/pages/officers',
            sourceDomain: 'jashore.polytech.gov.bd',
            isLive: true,
            total: liveData.length,
            data: liveData
          }));
        } catch (err: any) {
          console.warn('[Jashore Officers] Live fetch fallback to local cache:', err.message);
          try {
            const cachePath = path.resolve(__dirname, 'src/data/jashoreOfficers.json');
            const cached = fs.readFileSync(cachePath, 'utf8');
            const data = JSON.parse(cached);
            res.setHeader('X-DataSource', 'jashore.polytech.gov.bd (CACHED)');
            res.end(JSON.stringify({
              success: true,
              source: 'https://jashore.polytech.gov.bd/pages/officers',
              sourceDomain: 'jashore.polytech.gov.bd',
              isLive: false,
              total: data.length,
              data
            }));
          } catch (readErr) {
            res.statusCode = 500;
            res.end(JSON.stringify({ success: false, error: 'Failed to load teacher directory' }));
          }
        }
      });
    }
  };
}

export default defineConfig(() => {
  return {
    base: '/',
    plugins: [
      react(),
      tailwindcss(),
      jashoreOfficersBackendPlugin(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['icon.svg', 'apple-touch-icon.png', 'pwa-192x192.png', 'pwa-512x512.png'],
        manifest: {
          id: '/',
          name: 'BTEB Routine Manager',
          short_name: 'Routine',
          description: 'Offline Institute Class Routine Manager with class start and end alerts',
          theme_color: '#059669',
          background_color: '#f8fafc',
          display: 'standalone',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,json,woff,woff2}'],
          cleanupOutdatedCaches: true,
          maximumFileSizeToCacheInBytes: 3145728, // 3MB to comfortably cache curriculum
        },
        devOptions: {
          enabled: false,
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      chunkSizeWarningLimit: 2000,
      sourcemap: false,
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
