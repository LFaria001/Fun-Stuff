export const uid = () => crypto.randomUUID?.() || Math.random().toString(36).slice(2)
export const now = () => new Date().toISOString()
export const hoje = () => new Date().toISOString().slice(0, 10)
export const mesAno = (d) => d?.slice(0, 7) || ''
export const mesAtual = () => hoje().slice(0, 7)

export const fmt = (d) => {
  if (!d) return '—'
  const [y, m, day] = d.slice(0, 10).split('-')
  return `${day}/${m}/${y}`
}

export const fmtDT = (d) => {
  if (!d) return '—'
  try { return new Date(d).toLocaleString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) }
  catch { return d }
}

export const mesLabel = (p) => {
  if (!p) return ''
  const [y, m] = p.split('-')
  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  return `${meses[parseInt(m) - 1]} ${y}`
}

export const TIPOS = ['VT', 'Vídeo', '3D', 'VT+Vídeo', '3D+Vídeo']
export const ESTADOS = ['Realizado', 'Upload feito']

export const creditosPorTipo = (tipo) => {
  const m = { 'VT': { vt: -1 }, 'Vídeo': { video: -1 }, '3D': { d3: -1 }, 'VT+Vídeo': { vt: -1, video: -1 }, '3D+Vídeo': { d3: -1, video: -1 } }
  return m[tipo] || {}
}

export const valorPorTipo = (tipo) => {
  const m = { 'VT': 30, 'Vídeo': 40, '3D': 30, 'VT+Vídeo': 70, '3D+Vídeo': 70 }
  return m[tipo] || 0
}
