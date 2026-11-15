import { resolve } from 'node:path'

// Configuration lue dans l'environnement (fichier .env en dev, variables du conteneur en Docker)
export async function readConfig(): Promise<{ csvDir: string }> {
  return { csvDir: (process.env.CSV_DIR || '').trim() }
}

// Chemin relatif au dossier de l'app, ou absolu
export const resolveRoot = (rel: string) => resolve(process.cwd(), rel)
