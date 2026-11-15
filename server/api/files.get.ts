import { promises as fs } from 'node:fs'
import { join, relative, dirname, sep } from 'node:path'

type Entry = { path: string; dir: string; sub: string; name: string; size: number }

async function walk(dir: string, root: string, out: Entry[]) {
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.') || e.name === 'node_modules') continue
    const full = join(dir, e.name)
    if (e.isDirectory()) {
      await walk(full, root, out)
    } else if (e.name.toLowerCase().endsWith('.csv')) {
      const rel = relative(root, full)
      const parts = dirname(rel).split(sep).filter((p) => p && p !== '.')
      const deep = parts.length >= 2
      out.push({
        path: rel,
        dir: deep ? parts.slice(0, -1).join('/') : (parts[0] ?? '(racine)'),
        sub: deep ? parts[parts.length - 1] : '',
        name: e.name,
        size: (await fs.stat(full)).size
      })
    }
  }
}

export default defineEventHandler(async () => {
  const { csvDir } = await readConfig()
  if (!csvDir) return { root: '', files: [] as Entry[] }
  const root = resolveRoot(csvDir)
  try {
    await fs.access(root)
  } catch {
    throw createError({ statusCode: 400, statusMessage: `Répertoire introuvable : ${root}` })
  }
  const files: Entry[] = []
  await walk(root, root, files)
  const all = new Set(files.map((f) => f.path))
  const shown = files.filter((f) => !(/_(history|details)\.csv$/i.test(f.path) && all.has(f.path.replace(/_(history|details)\.csv$/i, '.csv'))))
  shown.sort((a, b) => a.path.localeCompare(b.path))
  return { root, files: shown }
})
