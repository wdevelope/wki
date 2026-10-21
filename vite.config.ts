/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { minimal2023Preset } from '@vite-pwa/assets-generator/config';

// GitHub Pages 프로젝트 사이트 경로 (https://<user>.github.io/wki/)
const BASE = '/wki/';
const ICON_BACKGROUND = '#18202b';

export default defineConfig({
  base: BASE,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      pwaAssets: {
        image: 'public/icon.svg',
        overrideManifestIcons: true,
        // index.html에 라이트/다크용 theme-color를 직접 둔다
        injectThemeColor: false,
        // 아이콘 자체에 여백이 있어 추가 여백 없이 배경색만 채운다
        preset: {
          ...minimal2023Preset,
          maskable: { ...minimal2023Preset.maskable, padding: 0, resizeOptions: { background: ICON_BACKGROUND } },
          apple: { ...minimal2023Preset.apple, padding: 0, resizeOptions: { background: ICON_BACKGROUND } },
        },
      },
      manifest: {
        name: 'WKI 단어장',
        short_name: 'WKI',
        description: 'NGSL 2,809 단어를 간격 반복으로 외우는 개인 단어장',
        lang: 'ko',
        scope: BASE,
        start_url: BASE,
        display: 'standalone',
        theme_color: '#eef1f4',
        background_color: '#eef1f4',
      },
      workbox: {
        // ngsl.json까지 미리 받아 두어 첫 실행 이후에는 오프라인으로 동작
        globPatterns: ['**/*.{js,css,html,svg,png,ico,json}'],
      },
    }),
  ],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
