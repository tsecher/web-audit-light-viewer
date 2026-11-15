export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  if (typeof body?.csvDir !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'csvDir manquant' })
  }
  const csvDir = body.csvDir.trim()
  await writeConfig({ csvDir })
  watchDir(csvDir ? resolveRoot(csvDir) : '')
  return { csvDir }
})
