import {fileURLToPath, URL} from 'url'

import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'

// const path = require('path')

// https://vitejs.dev/config/
export default defineConfig({
    define: {
        __VUE_PROD_DEVTOOLS__: true
    },
    plugins: [vue()],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    build: {
        minify: true,
        chunkSizeWarningLimit: 2048,
        outDir: '/Users/weiwait/PhpstormProjects/dcat-admin-extension/public',
        rollupOptions: {
            // input: 'src/index.ts',
            output: {
                manualChunks: id => {
                    if (id.includes('src/main')) {
                        return 'index'
                    }

                    // if (id.includes('src/components')) {
                    //     const match = /src\/components\/(.*)\.vue/.exec(id)
                    //     if (match && match.length > 1) {
                    //         return match[1]
                    //     }
                    // }
                },
                assetFileNames: 'vendor/dcat-admin-extensions/weiwait/dcat-vue/css/index.css',
                entryFileNames: 'vendor/dcat-admin-extensions/weiwait/dcat-vue/js/bundle.js',
                chunkFileNames: chunkInfo => `vendor/dcat-admin-extensions/weiwait/dcat-vue/js/${chunkInfo.name}.js`,
            }
        },
    }
})
