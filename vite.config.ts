import {fileURLToPath, URL} from 'url'

import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'

const path = require('path')

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    build: {
        minify: false,
        outDir: '/Users/weiwait/PhpstormProjects/dcat-admin-extension/public/vendor/dcat-admin-extensions/weiwait/dcat-vue',
        rollupOptions: {
            output: {
                assetFileNames: 'css/index.css',
                entryFileNames: 'js/bundle.js',
                chunkFileNames: chunkInfo => 'main' === chunkInfo.name ? `js/index.js` : ''
            }
        },
    }
})
