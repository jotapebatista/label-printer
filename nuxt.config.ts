import tailwindcss from "@tailwindcss/vite";
import AutoImport from 'unplugin-auto-import/vite'

export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  ssr: false,
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [
      tailwindcss(),
	  AutoImport({
        imports: [
          {
            'naive-ui': [
              'useDialog',
              'useMessage',
              'useNotification',
              'useLoadingBar'
            ]
          }
        ]
      }),
	],
  },

  modules: ["nuxtjs-naive-ui"],
});