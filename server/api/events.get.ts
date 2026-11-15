export default defineEventHandler(async (event) => {
  const { csvDir } = await readConfig()
  if (csvDir) watchDir(resolveRoot(csvDir))

  const stream = createEventStream(event)
  const onChange = (paths: string[]) => stream.push(JSON.stringify({ paths }))
  liveBus.on('change', onChange)
  stream.onClosed(async () => {
    liveBus.off('change', onChange)
    await stream.close()
  })
  return stream.send()
})
