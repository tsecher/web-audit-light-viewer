import { promises as fs } from 'node:fs'
import { resolve, dirname } from 'node:path'

const FILE = resolve(process.cwd(), 'data/config.json')

export async function readConfig(): Promise<{ csvDir: string }> {
  try {
    return { csvDir: '', ...JSON.parse(await fs.readFile(FILE, 'utf8')) }
  } catch {
    return { csvDir: '' }
  }
}

export async function writeConfig(c: { csvDir: string }) {
  await fs.mkdir(dirname(FILE), { recursive: true })
  await fs.writeFile(FILE, JSON.stringify(c, null, 2))
}

// Le chemin saisi est relatif au dossier de l'app (là où on lance `npm run dev`)
export const resolveRoot = (rel: string) => resolve(process.cwd(), rel)
