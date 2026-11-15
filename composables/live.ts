// Dernier changement reçu du serveur (chemins relatifs des CSV modifiés)
export const useLive = () => useState<{ n: number; paths: string[] }>('live', () => ({ n: 0, paths: [] }))
