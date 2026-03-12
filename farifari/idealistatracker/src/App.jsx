import { useState, useMemo, useRef } from 'react'
import { LayoutDashboard, Users, Briefcase, BarChart3, Settings, Plus, Search, Upload, ExternalLink, Trash2, Edit3, ChevronLeft, ChevronRight, Download, AlertTriangle, X } from 'lucide-react'
import { useStore } from './store'
import { fmt, fmtDT, hoje, mesAno, mesAtual, mesLabel, TIPOS, ESTADOS, uid, creditosPorTipo, valorPorTipo } from './utils'

/* ── theme ── */
const C = {
  bg: '#0c0d12', card: '#13141b', border: '#1e1f2a',
  t1: '#f4f4f5', t2: '#a1a1aa', t3: '#52525b',
  blue: '#3b82f6', green: '#10b981', amber: '#f59e0b', red: '#ef4444',
}
const font = "'DM Sans',system-ui,sans-serif"
const mono = "'JetBrains Mono',monospace"

/* ── shared styles ── */
const s = {
  input: { width: '100%', padding: '10px 12px', background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, color: C.t1, fontSize: 14, fontFamily: font, outline: 'none', boxSizing: 'border-box' },
  label: { fontSize: 11, fontWeight: 600, color: C.t2, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4, display: 'block' },
  btn: { padding: '10px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, fontFamily: font },
  card: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 },
}
const btnP = { ...s.btn, background: `linear-gradient(135deg, ${C.blue}, #2563eb)`, color: '#fff' }
const btnD = { ...s.btn, background: 'transparent', border: `1px solid ${C.border}`, color: C.t2 }

/* ── hook: media query ── */
function useMedia(q) {
  const [m, setM] = useState(() => window.matchMedia(q).matches)
  useState(() => {
    const mq = window.matchMedia(q)
    const h = (e) => setM(e.matches)
    mq.addEventListener('change', h)
    return () => mq.removeEventListener('change', h)
  })
  return m
}

/* ── Toast ── */
function Toast({ msg, type, onClose }) {
  if (!msg) return null
  const bg = type === 'error' ? C.red : type === 'success' ? C.green : C.blue
  return (
    <div style={{ position: 'fixed', bottom: 20, right: 20, left: 20, zIndex: 999, display: 'flex', justifyContent: 'center' }}>
      <div style={{ background: bg, color: '#fff', padding: '12px 20px', borderRadius: 10, fontSize: 14, fontFamily: font, display: 'flex', alignItems: 'center', gap: 8, maxWidth: 400 }}>
        <span style={{ flex: 1 }}>{msg}</span>
        <X size={16} style={{ cursor: 'pointer', opacity: 0.7 }} onClick={onClose} />
      </div>
    </div>
  )
}

/* ══════════════════════════════════ APP ══════════════════════════════════ */
export default function App() {
  const store = useStore()
  const isMobile = useMedia('(max-width: 768px)')
  const [page, setPage] = useState('dashboard')
  const [sub, setSub] = useState(null) // 'form' | 'detail' | 'upload'
  const [selId, setSelId] = useState(null)
  const [toast, setToast] = useState(null)

  const show = (msg, type = 'info') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500) }
  const go = (p, s = null, id = null) => { setPage(p); setSub(s); setSelId(id) }

  const nav = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'clientes', icon: Users, label: 'Clientes' },
    { id: 'trabalhos', icon: Briefcase, label: 'Trabalhos' },
    { id: 'relatorios', icon: BarChart3, label: 'Relatórios' },
    { id: 'definicoes', icon: Settings, label: 'Definições' },
  ]

  const content = (() => {
    switch (page) {
      case 'dashboard': return <Dashboard store={store} go={go} />
      case 'clientes': return <Clientes store={store} go={go} sub={sub} selId={selId} show={show} isMobile={isMobile} />
      case 'trabalhos': return <Trabalhos store={store} go={go} sub={sub} selId={selId} show={show} isMobile={isMobile} />
      case 'relatorios': return <Relatorios store={store} isMobile={isMobile} />
      case 'definicoes': return <Definicoes store={store} show={show} />
      default: return null
    }
  })()

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.t1, fontFamily: font, display: 'flex', flexDirection: isMobile ? 'column' : 'row' }}>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: ${C.bg}; }
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        input:focus, select:focus, textarea:focus { border-color: ${C.blue} !important; }
        select { appearance: none; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 3px; }
      `}</style>

      {/* Sidebar / Bottom bar */}
      {isMobile ? (
        <>
          <header style={{ background: C.card, borderBottom: `1px solid ${C.border}`, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 16, fontWeight: 700 }}>Idealista Tracker</span>
          </header>
          <main style={{ flex: 1, overflow: 'auto', padding: 16, paddingBottom: 80 }}>{content}</main>
          <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: C.card, borderTop: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-around', padding: '8px 0', paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}>
            {nav.map(n => (
              <button key={n.id} onClick={() => go(n.id)} style={{ background: 'none', border: 'none', color: page === n.id ? C.blue : C.t3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, cursor: 'pointer', fontSize: 10, fontFamily: font }}>
                <n.icon size={20} />
                {n.label}
              </button>
            ))}
          </nav>
        </>
      ) : (
        <>
          <aside style={{ width: 220, background: C.card, borderRight: `1px solid ${C.border}`, padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
            <div style={{ fontSize: 18, fontWeight: 700, padding: '8px 12px', marginBottom: 16 }}>Idealista Tracker</div>
            {nav.map(n => (
              <button key={n.id} onClick={() => go(n.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, border: 'none', background: page === n.id ? `${C.blue}15` : 'transparent', color: page === n.id ? C.blue : C.t2, cursor: 'pointer', fontSize: 14, fontFamily: font, fontWeight: page === n.id ? 600 : 400, width: '100%', textAlign: 'left' }}>
                <n.icon size={18} />{n.label}
              </button>
            ))}
          </aside>
          <main style={{ flex: 1, overflow: 'auto', padding: 32 }}>{content}</main>
        </>
      )}

      <Toast msg={toast?.msg} type={toast?.type} onClose={() => setToast(null)} />
    </div>
  )
}

/* ══════════════════════════════════ DASHBOARD ══════════════════════════════════ */
function Dashboard({ store, go }) {
  const { trabalhos, clientes } = store
  const mes = mesAtual()

  const trabMes = useMemo(() => trabalhos.filter(t => mesAno(t.data_trabalho) === mes), [trabalhos, mes])
  const receita = useMemo(() => trabMes.reduce((s, t) => s + (t.valor || 0), 0), [trabMes])
  const realizados = trabMes.filter(t => t.estado_trabalho === 'Realizado').length
  const uploads = trabMes.filter(t => t.estado_trabalho === 'Upload feito').length

  const semUpload = useMemo(() => trabalhos.filter(t => t.estado_trabalho === 'Realizado'), [trabalhos])
  const semId = useMemo(() => trabalhos.filter(t => t.estado_trabalho === 'Upload feito' && !t.id_sistema), [trabalhos])

  const nomeCli = (id) => clientes.find(c => c.id === id)?.nome_agencia || '—'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h2 style={{ fontSize: 22, fontWeight: 700 }}>Dashboard</h2>
      <div style={{ fontSize: 13, color: C.t2 }}>{mesLabel(mes)}</div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
        <StatCard label="Receita" value={`${receita}€`} color={C.green} />
        <StatCard label="Trabalhos" value={trabMes.length} color={C.blue} />
        <StatCard label="Realizados" value={realizados} color={C.amber} />
        <StatCard label="Uploads" value={uploads} color={C.green} />
      </div>

      {/* Alerts */}
      {semUpload.length > 0 && (
        <div style={{ ...s.card, borderColor: C.amber + '40' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <AlertTriangle size={16} color={C.amber} />
            <span style={{ fontWeight: 600, fontSize: 14 }}>Sem upload ({semUpload.length})</span>
          </div>
          {semUpload.slice(0, 5).map(t => (
            <div key={t.id} style={{ fontSize: 13, color: C.t2, padding: '4px 0', display: 'flex', justifyContent: 'space-between' }}>
              <span>{nomeCli(t.cliente_id)}</span>
              <span style={{ fontFamily: mono, fontSize: 12 }}>{fmt(t.data_trabalho)}</span>
            </div>
          ))}
        </div>
      )}

      {semId.length > 0 && (
        <div style={{ ...s.card, borderColor: C.red + '40' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <AlertTriangle size={16} color={C.red} />
            <span style={{ fontWeight: 600, fontSize: 14 }}>Sem ID de Anúncio ({semId.length})</span>
          </div>
          {semId.slice(0, 5).map(t => (
            <div key={t.id} style={{ fontSize: 13, color: C.t2, padding: '4px 0', display: 'flex', justifyContent: 'space-between' }}>
              <span>{nomeCli(t.cliente_id)}</span>
              <span style={{ fontFamily: mono, fontSize: 12 }}>{t.morada || '—'}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, color }) {
  return (
    <div style={s.card}>
      <div style={{ fontSize: 11, color: C.t2, textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color, fontFamily: mono }}>{value}</div>
    </div>
  )
}

/* ══════════════════════════════════ CLIENTES ══════════════════════════════════ */
function Clientes({ store, go, sub, selId, show, isMobile }) {
  const { clientes, trabalhos, consumos, addCliente, updateCliente, deleteCliente, saldoMes } = store
  const [search, setSearch] = useState('')
  const mes = mesAtual()

  if (sub === 'form') return <ClienteForm store={store} id={selId} go={go} show={show} />
  if (sub === 'detail' && selId) return <ClienteDetail store={store} id={selId} go={go} isMobile={isMobile} />

  const filtered = clientes.filter(c =>
    !search || c.nome_agencia?.toLowerCase().includes(search.toLowerCase()) || c.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700 }}>Clientes</h2>
        <button style={btnP} onClick={() => go('clientes', 'form')}><Plus size={16} style={{ marginRight: 4, verticalAlign: -3 }} />Novo</button>
      </div>

      <div style={{ position: 'relative' }}>
        <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: C.t3 }} />
        <input style={{ ...s.input, paddingLeft: 36 }} placeholder="Pesquisar..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', color: C.t3, padding: 40 }}>Nenhum cliente encontrado</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(c => {
            const saldo = saldoMes(c.id, mes)
            return (
              <div key={c.id} style={{ ...s.card, cursor: 'pointer' }} onClick={() => go('clientes', 'detail', c.id)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{c.nome_agencia}</div>
                    <div style={{ fontSize: 12, color: C.t2, marginTop: 2 }}>{c.email || c.contacto || '—'}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <CreditBadge label="VT" used={saldo.vt.usado} total={saldo.vt.total} />
                    <CreditBadge label="VI" used={saldo.video.usado} total={saldo.video.total} />
                    <CreditBadge label="3D" used={saldo.d3.usado} total={saldo.d3.total} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function CreditBadge({ label, used, total }) {
  if (total === 0) return null
  const color = used >= total ? C.green : C.red
  return (
    <span style={{ fontSize: 11, fontFamily: mono, padding: '2px 6px', borderRadius: 4, background: color + '20', color }}>
      {label} {used}/{total}
    </span>
  )
}

function ClienteForm({ store, id, go, show }) {
  const existing = id ? store.clientes.find(c => c.id === id) : null
  const [form, setForm] = useState(existing || { id_cliente: '', nome_agencia: '', contacto: '', email: '', plano_mensal: { creditos_vt: 0, creditos_video: 0, creditos_3d: 0 } })
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const setPlan = (k, v) => setForm(p => ({ ...p, plano_mensal: { ...p.plano_mensal, [k]: parseInt(v) || 0 } }))

  const handleSave = () => {
    if (!form.nome_agencia) return show('Nome da agência obrigatório', 'error')
    if (id) { store.updateCliente(id, form); show('Cliente atualizado', 'success') }
    else { store.addCliente(form); show('Cliente criado', 'success') }
    go('clientes')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button style={btnD} onClick={() => go('clientes')}><ChevronLeft size={16} /></button>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>{id ? 'Editar' : 'Novo'} Cliente</h2>
      </div>

      <div style={s.card}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="ID Cliente" value={form.id_cliente} onChange={v => set('id_cliente', v)} />
          <Field label="Nome Agência *" value={form.nome_agencia} onChange={v => set('nome_agencia', v)} />
          <Field label="Contacto" value={form.contacto} onChange={v => set('contacto', v)} />
          <Field label="Email" value={form.email} onChange={v => set('email', v)} type="email" />

          <div>
            <label style={s.label}>Plano Mensal</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              {[['creditos_vt', 'VT'], ['creditos_video', 'Vídeo'], ['creditos_3d', '3D']].map(([k, l]) => (
                <div key={k}>
                  <div style={{ fontSize: 11, color: C.t3, marginBottom: 4 }}>{l}</div>
                  <select style={s.input} value={form.plano_mensal?.[k] || 0} onChange={e => setPlan(k, e.target.value)}>
                    {[...Array(11)].map((_, i) => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button style={{ ...btnP, flex: 1 }} onClick={handleSave}>Guardar</button>
            <button style={btnD} onClick={() => go('clientes')}>Cancelar</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ClienteDetail({ store, id, go, isMobile }) {
  const c = store.clientes.find(x => x.id === id)
  if (!c) return <div style={{ color: C.t3 }}>Cliente não encontrado</div>
  const mes = mesAtual()
  const saldo = store.saldoMes(id, mes)
  const trabs = store.trabalhos.filter(t => t.cliente_id === id)
  const cons = store.consumos.filter(x => x.cliente_id === id).sort((a, b) => b.timestamp?.localeCompare(a.timestamp))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button style={btnD} onClick={() => go('clientes')}><ChevronLeft size={16} /></button>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>{c.nome_agencia}</h2>
        <button style={{ ...btnD, marginLeft: 'auto' }} onClick={() => go('clientes', 'form', id)}><Edit3 size={14} /></button>
      </div>

      <div style={{ display: 'flex', gap: 4, fontSize: 13, color: C.t2 }}>
        {c.email && <span>{c.email}</span>}
        {c.contacto && <span> · {c.contacto}</span>}
      </div>

      {/* Credit bars */}
      <div style={{ ...s.card }}>
        <div style={{ fontSize: 12, color: C.t2, marginBottom: 8 }}>Créditos — {mesLabel(mes)}</div>
        {[['VT', saldo.vt], ['Vídeo', saldo.video], ['3D', saldo.d3]].map(([l, v]) => v.total > 0 && (
          <div key={l} style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
              <span style={{ color: C.t2 }}>{l}</span>
              <span style={{ fontFamily: mono, color: v.usado >= v.total ? C.green : C.red }}>{v.usado}/{v.total}</span>
            </div>
            <div style={{ height: 6, background: C.border, borderRadius: 3 }}>
              <div style={{ height: '100%', borderRadius: 3, background: v.usado >= v.total ? C.green : C.amber, width: `${Math.min((v.usado / v.total) * 100, 100)}%`, transition: 'width 0.3s' }} />
            </div>
          </div>
        ))}
      </div>

      {/* Trabalhos */}
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Trabalhos ({trabs.length})</div>
        {trabs.slice(0, 10).map(t => (
          <div key={t.id} style={{ fontSize: 13, color: C.t2, padding: '6px 0', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between' }}>
            <span>{fmt(t.data_trabalho)} — {t.tipo_multimedia}</span>
            <span style={{ fontSize: 11, color: t.estado_trabalho === 'Upload feito' ? C.green : C.amber }}>{t.estado_trabalho}</span>
          </div>
        ))}
      </div>

      {/* Consumos */}
      {cons.length > 0 && (
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Consumos</div>
          {cons.slice(0, 10).map(x => (
            <div key={x.id} style={{ fontSize: 12, color: C.t3, padding: '4px 0', fontFamily: mono }}>
              {x.periodo} · {x.observacoes} · VT:{x.delta_vt} VI:{x.delta_video} 3D:{x.delta_3d}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════ TRABALHOS ══════════════════════════════════ */
function Trabalhos({ store, go, sub, selId, show, isMobile }) {
  const { trabalhos, clientes, deleteTrabalho, markUpload } = store
  const [search, setSearch] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [filtroCliente, setFiltroCliente] = useState('')

  if (sub === 'form') return <TrabalhoForm store={store} id={selId} go={go} show={show} />
  if (sub === 'upload' && selId) return <UploadForm store={store} id={selId} go={go} show={show} />

  const nomeCli = (id) => clientes.find(c => c.id === id)?.nome_agencia || '—'
  const filtered = trabalhos
    .filter(t => !filtroEstado || t.estado_trabalho === filtroEstado)
    .filter(t => !filtroCliente || t.cliente_id === filtroCliente)
    .filter(t => !search || t.morada?.toLowerCase().includes(search.toLowerCase()) || t.id_sistema?.toLowerCase().includes(search.toLowerCase()) || nomeCli(t.cliente_id).toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.data_trabalho.localeCompare(a.data_trabalho))

  const handleDelete = (id) => {
    if (confirm('Apagar este trabalho?')) {
      deleteTrabalho(id)
      show('Trabalho apagado', 'success')
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700 }}>Trabalhos</h2>
        <button style={btnP} onClick={() => go('trabalhos', 'form')}><Plus size={16} style={{ marginRight: 4, verticalAlign: -3 }} />Novo</button>
      </div>

      <div style={{ position: 'relative' }}>
        <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: C.t3 }} />
        <input style={{ ...s.input, paddingLeft: 36 }} placeholder="Pesquisar morada, ID, cliente..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <select style={{ ...s.input, width: 'auto', minWidth: 120 }} value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
          <option value="">Todos estados</option>
          {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
        </select>
        <select style={{ ...s.input, width: 'auto', minWidth: 120 }} value={filtroCliente} onChange={e => setFiltroCliente(e.target.value)}>
          <option value="">Todos clientes</option>
          {clientes.map(c => <option key={c.id} value={c.id}>{c.nome_agencia}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', color: C.t3, padding: 40 }}>Nenhum trabalho encontrado</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(t => (
            <div key={t.id} style={s.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{nomeCli(t.cliente_id)}</span>
                    <span style={{ fontSize: 11, fontFamily: mono, padding: '2px 6px', borderRadius: 4, background: C.blue + '20', color: C.blue }}>{t.tipo_multimedia}</span>
                    <span style={{ fontSize: 11, fontFamily: mono, padding: '2px 6px', borderRadius: 4, background: t.estado_trabalho === 'Upload feito' ? C.green + '20' : C.amber + '20', color: t.estado_trabalho === 'Upload feito' ? C.green : C.amber }}>{t.estado_trabalho}</span>
                  </div>
                  <div style={{ fontSize: 12, color: C.t2, marginTop: 4 }}>
                    {fmt(t.data_trabalho)} · {t.morada || t.id_sistema || '—'} · {t.local || ''}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                  {t.estado_trabalho === 'Realizado' && (
                    <button style={{ ...btnD, padding: '6px 8px' }} onClick={() => go('trabalhos', 'upload', t.id)} title="Upload"><Upload size={14} /></button>
                  )}
                  {t.link_upload && (
                    <a href={t.link_upload} target="_blank" rel="noopener" style={{ ...btnD, padding: '6px 8px', display: 'flex', alignItems: 'center', textDecoration: 'none' }}><ExternalLink size={14} /></a>
                  )}
                  <button style={{ ...btnD, padding: '6px 8px' }} onClick={() => go('trabalhos', 'form', t.id)} title="Editar"><Edit3 size={14} /></button>
                  <button style={{ ...btnD, padding: '6px 8px', color: C.red }} onClick={() => handleDelete(t.id)} title="Apagar"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function TrabalhoForm({ store, id, go, show }) {
  const existing = id ? store.trabalhos.find(t => t.id === id) : null
  const [form, setForm] = useState(existing || { cliente_id: '', data_trabalho: hoje(), mes_referencia: mesAtual(), tipo_multimedia: '', local: '', id_sistema: '', morada: '' })
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSave = () => {
    if (!form.cliente_id) return show('Selecione um cliente', 'error')
    if (!form.tipo_multimedia) return show('Selecione o tipo', 'error')
    if (!form.id_sistema && !form.morada) return show('Preencha ID ou morada', 'error')
    if (!form.local) return show('Preencha o local', 'error')
    if (id) { store.updateTrabalho(id, form); show('Trabalho atualizado', 'success') }
    else { store.addTrabalho(form); show('Trabalho criado', 'success') }
    go('trabalhos')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button style={btnD} onClick={() => go('trabalhos')}><ChevronLeft size={16} /></button>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>{id ? 'Editar' : 'Novo'} Trabalho</h2>
      </div>

      <div style={s.card}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={s.label}>Agência *</label>
            <select style={s.input} value={form.cliente_id} onChange={e => set('cliente_id', e.target.value)}>
              <option value="">Selecionar...</option>
              {store.clientes.map(c => <option key={c.id} value={c.id}>{c.nome_agencia}</option>)}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <Field label="Data *" type="date" value={form.data_trabalho} onChange={v => { set('data_trabalho', v); set('mes_referencia', mesAno(v)) }} />
            <Field label="Mês Referência" type="month" value={form.mes_referencia} onChange={v => set('mes_referencia', v)} />
          </div>

          <div>
            <label style={s.label}>Tipo Multimédia *</label>
            <select style={s.input} value={form.tipo_multimedia} onChange={e => set('tipo_multimedia', e.target.value)}>
              <option value="">Selecionar...</option>
              {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <Field label="ID do Anúncio" value={form.id_sistema} onChange={v => set('id_sistema', v)} placeholder="Ou preencha morada" />
          <Field label="Morada" value={form.morada} onChange={v => set('morada', v)} placeholder="Ou preencha ID" />
          <Field label="Local *" value={form.local} onChange={v => set('local', v)} />

          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button style={{ ...btnP, flex: 1 }} onClick={handleSave}>Guardar</button>
            <button style={btnD} onClick={() => go('trabalhos')}>Cancelar</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function UploadForm({ store, id, go, show }) {
  const t = store.trabalhos.find(x => x.id === id)
  if (!t) return null
  const [idSistema, setIdSistema] = useState(t.id_sistema || '')
  const [morada, setMorada] = useState(t.morada || '')

  const handleConfirm = () => {
    if (!idSistema && !morada) return show('Preencha ID ou morada', 'error')
    store.markUpload(id, { id_sistema: idSistema || t.id_sistema, morada: morada || t.morada })
    show('Upload marcado', 'success')
    go('trabalhos')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button style={btnD} onClick={() => go('trabalhos')}><ChevronLeft size={16} /></button>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>Marcar Upload</h2>
      </div>
      <div style={s.card}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="ID do Anúncio" value={idSistema} onChange={setIdSistema} />
          <Field label="Morada" value={morada} onChange={setMorada} />
          <button style={btnP} onClick={handleConfirm}>Confirmar Upload</button>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════ RELATÓRIOS ══════════════════════════════════ */
function Relatorios({ store, isMobile }) {
  const [periodo, setPeriodo] = useState(mesAtual())
  const { clientes, trabalhos, consumos, saldoMes } = store

  const trabPeriodo = useMemo(() => trabalhos.filter(t => mesAno(t.data_trabalho) === periodo), [trabalhos, periodo])
  const clientesAtivos = useMemo(() => {
    const ids = new Set(trabPeriodo.map(t => t.cliente_id))
    return clientes.filter(c => ids.has(c.id) || (c.plano_mensal && (c.plano_mensal.creditos_vt > 0 || c.plano_mensal.creditos_video > 0 || c.plano_mensal.creditos_3d > 0)))
  }, [clientes, trabPeriodo])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h2 style={{ fontSize: 22, fontWeight: 700 }}>Relatórios</h2>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button style={btnD} onClick={() => {
          const [y, m] = periodo.split('-').map(Number)
          const d = new Date(y, m - 2)
          setPeriodo(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
        }}><ChevronLeft size={16} /></button>
        <span style={{ fontSize: 16, fontWeight: 600, minWidth: 100, textAlign: 'center' }}>{mesLabel(periodo)}</span>
        <button style={btnD} onClick={() => {
          const [y, m] = periodo.split('-').map(Number)
          const d = new Date(y, m)
          setPeriodo(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
        }}><ChevronRight size={16} /></button>
      </div>

      {/* Consumo por cliente */}
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Consumo por Cliente</div>
        {clientesAtivos.length === 0 ? (
          <div style={{ color: C.t3, fontSize: 13 }}>Sem dados para este período</div>
        ) : clientesAtivos.map(c => {
          const sal = saldoMes(c.id, periodo)
          return (
            <div key={c.id} style={{ ...s.card, marginBottom: 8 }}>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>{c.nome_agencia}</div>
              <div style={{ display: 'flex', gap: 12, fontSize: 12, fontFamily: mono }}>
                {sal.vt.total > 0 && <span style={{ color: sal.vt.usado >= sal.vt.total ? C.green : C.red }}>VT {sal.vt.usado}/{sal.vt.total}</span>}
                {sal.video.total > 0 && <span style={{ color: sal.video.usado >= sal.video.total ? C.green : C.red }}>VI {sal.video.usado}/{sal.video.total}</span>}
                {sal.d3.total > 0 && <span style={{ color: sal.d3.usado >= sal.d3.total ? C.green : C.red }}>3D {sal.d3.usado}/{sal.d3.total}</span>}
              </div>
            </div>
          )
        })}
      </div>

      {/* Trabalhos do período */}
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Trabalhos ({trabPeriodo.length})</div>
        {trabPeriodo.length === 0 ? (
          <div style={{ color: C.t3, fontSize: 13 }}>Sem trabalhos neste período</div>
        ) : trabPeriodo.map(t => {
          const nome = clientes.find(c => c.id === t.cliente_id)?.nome_agencia || '—'
          return (
            <div key={t.id} style={{ fontSize: 13, color: C.t2, padding: '8px 0', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4 }}>
              <span>{fmt(t.data_trabalho)} · {nome} · {t.morada || t.id_sistema || '—'}</span>
              <span style={{ fontSize: 11, fontFamily: mono, color: t.estado_trabalho === 'Upload feito' ? C.green : C.amber }}>{t.tipo_multimedia} · {t.estado_trabalho}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ══════════════════════════════════ DEFINIÇÕES ══════════════════════════════════ */
function Definicoes({ store, show }) {
  const { clientes, trabalhos, consumos, exportData, importData, clearAll, clearTrabalhos, clearClientes } = store
  const fileRef = useRef()

  const handleExport = () => {
    const data = exportData()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `backup-${hoje()}.json`; a.click()
    URL.revokeObjectURL(url)
    show('Backup exportado', 'success')
  }

  const handleImport = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result)
        if (!confirm('Isto vai substituir todos os dados atuais. Continuar?')) return
        importData(data)
        show('Dados importados', 'success')
      } catch { show('Ficheiro inválido', 'error') }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h2 style={{ fontSize: 22, fontWeight: 700 }}>Definições</h2>

      {/* Dados */}
      <div style={s.card}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Dados</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          <div style={{ textAlign: 'center', padding: 12, background: C.bg, borderRadius: 8 }}>
            <div style={{ fontSize: 22, fontWeight: 700, fontFamily: mono, color: C.blue }}>{clientes.length}</div>
            <div style={{ fontSize: 11, color: C.t2 }}>Clientes</div>
          </div>
          <div style={{ textAlign: 'center', padding: 12, background: C.bg, borderRadius: 8 }}>
            <div style={{ fontSize: 22, fontWeight: 700, fontFamily: mono, color: C.blue }}>{trabalhos.length}</div>
            <div style={{ fontSize: 11, color: C.t2 }}>Trabalhos</div>
          </div>
          <div style={{ textAlign: 'center', padding: 12, background: C.bg, borderRadius: 8 }}>
            <div style={{ fontSize: 22, fontWeight: 700, fontFamily: mono, color: C.blue }}>{consumos.length}</div>
            <div style={{ fontSize: 11, color: C.t2 }}>Consumos</div>
          </div>
        </div>
      </div>

      {/* Backup */}
      <div style={s.card}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Backup</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button style={btnP} onClick={handleExport}><Download size={14} style={{ marginRight: 4, verticalAlign: -2 }} />Exportar JSON</button>
          <button style={btnD} onClick={() => fileRef.current?.click()}><Upload size={14} style={{ marginRight: 4, verticalAlign: -2 }} />Importar JSON</button>
          <input ref={fileRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleImport} />
        </div>
      </div>

      {/* Danger zone */}
      <div style={{ ...s.card, borderColor: C.red + '40' }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: C.red }}>Zona Perigosa</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button style={{ ...s.btn, background: 'transparent', border: `1px solid ${C.red}30`, color: C.red, width: '100%', textAlign: 'left' }} onClick={() => { if (confirm('Apagar TODOS os dados?')) { clearAll(); show('Dados apagados', 'success') } }}>
            Apagar todos os dados
          </button>
          <button style={{ ...s.btn, background: 'transparent', border: `1px solid ${C.border}`, color: C.t2, width: '100%', textAlign: 'left' }} onClick={() => { if (confirm('Apagar todos os trabalhos?')) { clearTrabalhos(); show('Trabalhos apagados', 'success') } }}>
            Apagar só trabalhos
          </button>
          <button style={{ ...s.btn, background: 'transparent', border: `1px solid ${C.border}`, color: C.t2, width: '100%', textAlign: 'left' }} onClick={() => { if (confirm('Apagar todos os clientes?')) { clearClientes(); show('Clientes apagados', 'success') } }}>
            Apagar só clientes
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── shared field ── */
function Field({ label, value, onChange, type = 'text', placeholder = '' }) {
  return (
    <div>
      <label style={s.label}>{label}</label>
      <input style={s.input} type={type} value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  )
}
