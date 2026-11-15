import chokidar, { type FSWatcher } from 'chokidar'
import { EventEmitter } from 'node:events'
import { relative, sep } from 'node:path'

export const liveBus = new EventEmitter()
liveBus.setMaxListeners(0)

let watcher: FSWatcher | null = null
let current = ''
const pending = new Set<string>()
let timer: ReturnType<typeof setTimeout> | null = null

function queue(root: string, file: string) {
  if (!/\.(csv|html)$/i.test(file)) return
  pending.add(relative(root, file))
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => {
    liveBus.emit('change', [...pending])
    pending.clear()
  }, 150)
}

// root vide = arrêter la surveillance
export function watchDir(root: string) {
  if (root === current) return
  watcher?.close()
  watcher = null
  current = root
  if (!root) return
  watcher = chokidar.watch(root, {
    ignoreInitial: true,
    // attend la fin de l'écriture pour ne pas lire un fichier à moitié écrit
    awaitWriteFinish: { stabilityThreshold: 300, pollInterval: 100 },
    ignored: (p: string) => relative(root, p).split(sep).some((s) => s.startsWith('.') || s === 'node_modules')
  })
  for (const ev of ['add', 'change', 'unlink'] as const) watcher.on(ev, (f) => queue(root, f))
}
