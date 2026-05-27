import path from 'path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      // Use injectManifest strategy to avoid workbox-build generating ESM imports
      // with the absolute Windows path (which contains an apostrophe that breaks
      // JS string parsing when the project lives in "Life Do's").
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      manifest: {
        name: "Life Do's",
        short_name: "Life Do's",
        description: 'Personal productivity: habits, projects, goals, and notes.',
        theme_color: '#7c3aed',
        background_color: '#0f0f14',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/icons/icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})
