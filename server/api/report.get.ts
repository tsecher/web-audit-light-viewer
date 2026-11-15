import { promises as fs } from 'node:fs'
import { resolve, dirname, join, sep } from 'node:path'

export default defineEventHandler(async (event) => {
  const { path, file } = getQuery(event)
  const { csvDir } = await readConfig()
  if (!csvDir || typeof path !== 'string' || typeof file !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'Paramètre manquant' })
  }
  const root = resolveRoot(csvDir)
  const reports = join(dirname(resolve(root, path)), 'reports')
  const target = resolve(reports, file)
  if (!reports.startsWith(root + sep) || !target.startsWith(reports + sep) || !/\.html$/i.test(target)) {
    throw createError({ statusCode: 403, statusMessage: 'Chemin refusé' })
  }
  try {
    const html = await fs.readFile(target)
    setHeader(event, 'content-type', 'text/html; charset=utf-8')
    setHeader(event, 'content-security-policy', 'sandbox allow-scripts allow-popups allow-popups-to-escape-sandbox')
    return html
  } catch {
    throw createError({ statusCode: 404, statusMessage: 'Rapport introuvable' })
  }
})
