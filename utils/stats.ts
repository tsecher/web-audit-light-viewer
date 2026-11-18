// Nombre simple : 12, -3.5, 12,5 (virgule française), 1e3
const NUM = /^[+-]?(\d+([.,]\d+)?|[.,]\d+)(e[+-]?\d+)?$/i

// Moyenne par colonne, uniquement si toutes les cellules non vides sont numériques
export function columnAverages(columns: string[], rows: Record<string, any>[]): Record<string, string> {
  const out: Record<string, string> = {}
  for (const c of columns) {
    let sum = 0, n = 0, ok = true
    for (const r of rows) {
      const raw = String(r[c] ?? '').trim()
      if (raw === '') continue
      if (!NUM.test(raw)) { ok = false; break }
      sum += parseFloat(raw.replace(',', '.'))
      n++
    }
    if (ok && n > 0) out[c] = (sum / n).toLocaleString('fr-FR', { maximumFractionDigits: 2 })
  }
  return out
}
