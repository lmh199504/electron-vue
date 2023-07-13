import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
    main: {
        plugins: [externalizeDepsPlugin()]
    },
    preload: {
        plugins: [externalizeDepsPlugin()]
    },
    renderer: {
        resolve: {
            alias: {
                '@renderer': resolve('src/renderer/src')
            }
        },
        plugins: [vue()],
        css: {
            preprocessorOptions: {
                less: {
                    modifyVars: {
                        // 在这里自定义主题色等样式
                        'primary-color': '#ff9c42'
                    },
                    javascriptEnabled: true
                }
            }
        }
    }
})
