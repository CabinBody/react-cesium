import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// import cesium from 'vite-plugin-cesium';
import vitePluginImp from 'vite-plugin-imp'
import path from 'path'


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    vitePluginImp({
      libList: [
        {
          libName: 'antd',
          style: (name) => `antd/es/${name}/style`,
        },
      ],
    }),
  ],
  resolve: {
    alias: {
      cesium: path.resolve(__dirname, 'public/libs/cesium/Build/Cesium')
    }
  },
  server: {
    fs: {
      allow: [
        'public/libs/cesium',
        './'
      ]
    }
  },
  build: {
    rollupOptions: {
      external: ['cesium'],
      output: {
        globals: {
          cesium: 'Cesium'
        }
      }
    }
  },
  base:'./',
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },


})
