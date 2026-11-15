// Le polling est nécessaire quand les fichiers sont montés dans Docker sur Mac/Windows
const poll = process.env.WATCH_POLLING === 'true'

export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: false },
  css: ['~/assets/main.css'],
  app: { head: { title: 'Analyses CSV', htmlAttrs: { lang: 'fr' } } },
  watchers: { chokidar: { usePolling: poll, interval: 1000 } },
  vite: { server: { watch: { usePolling: poll } } }
})
