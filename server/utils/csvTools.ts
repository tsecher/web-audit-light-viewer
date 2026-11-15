// Clé de comparaison : décode l'URL, minuscules, tout séparateur (/ _ - %2F ...) devient un espace
export function normKey(s: string) {
  let d = s
  try { d = decodeURIComponent(s) } catch {}
  return d.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim()
}

export function findUrlColumn(cols: string[], rows: Record<string, string>[]) {
  const by = (re: RegExp) => cols.find((c) => re.test(c.trim()))
  return by(/^url$/i) ?? by(/url|address|adresse/i) ??
    cols.find((c) => rows.slice(0, 20).some((r) => /^https?:\/\//i.test(r[c] ?? '')))
}

// URL complète -> nom du fichier html (qui ne contient que le chemin)
export function matchReport(url: string | undefined, byKey: Map<string, string>) {
  if (!url) return
  let u: URL
  try { u = new URL(url.trim()) } catch { return }
  for (const k of [normKey(u.pathname + u.search), normKey(u.pathname)]) {
    const f = byKey.get(k) ?? (k === '' ? byKey.get('index') : undefined)
    if (f) return f
  }
}
