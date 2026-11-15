import { promises as fs } from 'node:fs'
import { resolve, dirname, join, sep } from 'node:path'
import Papa from 'papaparse'

const MAX_ROWS = 20000
const TIME = 'time'
const VALUE = 'task duration without dev tools (cumulated)'

const parse = (t: string) => Papa.parse<Record<string, string>>(t.replace(/^\uFEFF/, ''), { header: true, skipEmptyLines: true })
const read = (f: string) => fs.readFile(f, 'utf8').catch(() => null)
const find = (cols: string[], name: string) => cols.find((c) => c.trim().toLowerCase() === name)

export default defineEventHandler(async (event) => {
  const { path } = getQuery(event)
  const { csvDir } = await readConfig()
  if (!csvDir || typeof path !== 'string') throw createError({ statusCode: 400, statusMessage: 'Paramètre manquant' })
  const root = resolveRoot(csvDir)
  const file = resolve(root, path)
  if (!file.startsWith(root + sep) || !file.toLowerCase().endsWith('.csv')) {
    throw createError({ statusCode: 403, statusMessage: 'Chemin refusé' })
  }
  const text = await read(file)
  if (text === null) throw createError({ statusCode: 404, statusMessage: 'Fichier introuvable' })

  const parsed = parse(text)
  const columns = parsed.meta.fields ?? []
  const urlCol = findUrlColumn(columns, parsed.data)

  // Rapports html : <dossier du csv>/reports/*.html
  const reportFiles = (await fs.readdir(join(dirname(file), 'reports')).catch(() => [] as string[])).filter((f) => /\.html$/i.test(f))
  const byKey = new Map<string, string>()
  for (const f of reportFiles) {
    const k = normKey(f.replace(/\.html$/i, ''))
    if (!byKey.has(k)) byKey.set(k, f)
  }

  // Historique : <nom>_history.csv, groupé par URL
  let history: { points: Record<string, { t: string; v: number }[]> } | null = null
  const histText = await read(file.replace(/\.csv$/i, '_history.csv'))
  if (histText !== null) {
    const h = parse(histText)
    const hc = h.meta.fields ?? []
    const hu = findUrlColumn(hc, h.data), ht = find(hc, TIME), hv = find(hc, VALUE)
    if (hu && ht && hv) {
      const points: Record<string, { t: string; v: number }[]> = {}
      for (const r of h.data) {
        const u = r[hu]?.trim()
        const v = parseFloat(String(r[hv]).replace(',', '.'))
        if (u && !Number.isNaN(v)) (points[u] ||= []).push({ t: r[ht], v })
      }
      history = { points }
    }
  }

  // Détails : <nom>_details.csv, groupé par URL
  let details: { columns: string[]; byUrl: Record<string, Record<string, string>[]> } | null = null
  const detText = await read(file.replace(/\.csv$/i, '_details.csv'))
  if (detText !== null) {
    const d = parse(detText)
    const dc = d.meta.fields ?? []
    const du = findUrlColumn(dc, d.data)
    if (du) {
      const byUrl: Record<string, Record<string, string>[]> = {}
      for (const r of d.data) {
        const u = r[du]?.trim()
        if (u) (byUrl[u] ||= []).push(r)
      }
      details = { columns: dc, byUrl }
    }
  }

  const rows = parsed.data.slice(0, MAX_ROWS).map((r) => {
    const rep = urlCol ? matchReport(r[urlCol], byKey) : undefined
    return rep ? { ...r, __report: rep } : r
  })
  return { columns, urlCol, rows, total: parsed.data.length, truncated: parsed.data.length > MAX_ROWS, hasReports: reportFiles.length > 0, history, details }
})
