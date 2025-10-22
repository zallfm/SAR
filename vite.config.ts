import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const isAnalyze = mode === 'analyze';
    
    return {
      server: {
        port: 5173,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        // Bundle analyzer plugin
        isAnalyze && visualizer({
          filename: 'dist/bundle-analysis.html',
          open: true,
          gzipSize: true,
          brotliSize: true,
          template: 'treemap', // sunburst, treemap, network
        })
      ].filter(Boolean),
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        // Bundle optimization
        rollupOptions: {
          output: {
            manualChunks: {
              // Vendor chunks
              'react-vendor': ['react', 'react-dom'],
              'router-vendor': ['react-router-dom'],
              'chart-vendor': ['chart.js', 'react-chartjs-2'],
              'utils-vendor': ['dompurify', 'validator'],
              'state-vendor': ['zustand'],
            },
            // Optimize chunk names
            chunkFileNames: (chunkInfo) => {
              const facadeModuleId = chunkInfo.facadeModuleId
                ? chunkInfo.facadeModuleId.split('/').pop()?.replace('.tsx', '').replace('.ts', '')
                : 'chunk';
              return `js/${facadeModuleId}-[hash].js`;
            },
            entryFileNames: 'js/[name]-[hash].js',
            assetFileNames: (assetInfo) => {
              const info = assetInfo.name?.split('.') || [];
              const ext = info[info.length - 1];
              if (/\.(css)$/.test(assetInfo.name || '')) {
                return `css/[name]-[hash].${ext}`;
              }
              if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name || '')) {
                return `images/[name]-[hash].${ext}`;
              }
              return `assets/[name]-[hash].${ext}`;
            }
          }
        },
        // Performance optimizations
        target: 'es2015',
        minify: 'esbuild',
        // Source map for production debugging
        sourcemap: mode === 'development',
        // Chunk size warnings
        chunkSizeWarningLimit: 1000,
      },
      // Performance optimizations
      optimizeDeps: {
        include: [
          'react',
          'react-dom',
          'react-router-dom',
          'chart.js',
          'react-chartjs-2',
          'zustand',
          'dompurify',
          'validator'
        ],
        exclude: ['@playwright/test']
      }
    };
});
