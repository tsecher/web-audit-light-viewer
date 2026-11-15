import { promises as fs } from 'node:fs'
import { resolve, sep } from 'node:path'
import Papa from 'papaparse'

const MAX_ROWS = 20000

export default defineEventHandler(async (event) => {
  const { path } = getQuery(event)
  const { csvDir } = await readConfig()
  if (!csvDir || typeof path !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'Paramètre manquant' })
  }
  const root = resolveRoot(csvDir)
  const file = resolve(root, path)
  // Empêche de lire un fichier en dehors du répertoire configuré
  if (!file.startsWith(root + sep) || !file.toLowerCase().endsWith('.csv')) {
    throw createError({ statusCode: 403, statusMessage: 'Chemin refusé' })
  }
  let text: string
  try {
    text = (await fs.readFile(file, 'utf8')).replace(/^\uFEFF/, '')
  } catch {
    throw createError({ statusCode: 404, statusMessage: 'Fichier introuvable' })
  }
  const parsed = Papa.parse<Record<string, string>>(text, { header: true, skipEmptyLines: true })
  return {
    columns: parsed.meta.fields ?? [],
    rows: parsed.data.slice(0, MAX_ROWS),
    total: parsed.data.length,
    truncated: parsed.data.length > MAX_ROWS
  }
})
