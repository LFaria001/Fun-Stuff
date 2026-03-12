import { createContext, useContext, useState, useCallback } from 'react'
import { uid, now, mesAno, creditosPorTipo, valorPorTipo } from './utils'

const Ctx = createContext()
export const useStore = () => useContext(Ctx)

const load = (k) => { try { return JSON.parse(localStorage.getItem(k)) || [] } catch { return [] } }
const save = (k, v) => localStorage.setItem(k, JSON.stringify(v))

export function StoreProvider({ children }) {
  const [clientes, setClientes] = useState(() => load('it_clientes'))
  const [trabalhos, setTrabalhos] = useState(() => load('it_trabalhos'))
  const [consumos, setConsumos] = useState(() => load('it_consumos'))

  const persist = (setter, key) => (fn) => {
    setter(prev => {
      const next = typeof fn === 'function' ? fn(prev) : fn
      save(key, next)
      return next
    })
  }

  const setC = persist(setClientes, 'it_clientes')
  const setT = persist(setTrabalhos, 'it_trabalhos')
  const setCo = persist(setConsumos, 'it_consumos')

  const addCliente = useCallback((data) => {
    const c = { id: uid(), ...data }
    setC(prev => [...prev, c])
    return c
  }, [])

  const updateCliente = useCallback((id, data) => {
    setC(prev => prev.map(c => c.id === id ? { ...c, ...data } : c))
  }, [])

  const deleteCliente = useCallback((id) => {
    setC(prev => prev.filter(c => c.id !== id))
    setT(prev => prev.filter(t => t.cliente_id !== id))
    setCo(prev => prev.filter(c => c.cliente_id !== id))
  }, [])

  const addTrabalho = useCallback((data) => {
    const t = {
      id: uid(),
      ...data,
      mes_referencia: data.mes_referencia || mesAno(data.data_trabalho),
      valor: valorPorTipo(data.tipo_multimedia),
      estado_trabalho: 'Realizado',
    }
    setT(prev => [...prev, t])
    const deltas = creditosPorTipo(t.tipo_multimedia)
    if (Object.keys(deltas).length) {
      const co = {
        id: uid(), trabalho_id: t.id, cliente_id: t.cliente_id,
        periodo: t.mes_referencia,
        delta_vt: deltas.vt || 0, delta_video: deltas.video || 0, delta_3d: deltas.d3 || 0,
        timestamp: now(), observacoes: t.tipo_multimedia,
      }
      setCo(prev => [...prev, co])
    }
    return t
  }, [])

  const updateTrabalho = useCallback((id, data) => {
    setT(prev => prev.map(t => {
      if (t.id !== id) return t
      const updated = { ...t, ...data, mes_referencia: data.mes_referencia || mesAno(data.data_trabalho || t.data_trabalho), valor: valorPorTipo(data.tipo_multimedia || t.tipo_multimedia) }
      return updated
    }))
    setCo(prev => prev.filter(c => c.trabalho_id !== id))
    setT(prev => {
      const t = prev.find(x => x.id === id)
      if (!t) return prev
      const deltas = creditosPorTipo(t.tipo_multimedia)
      if (Object.keys(deltas).length) {
        const co = {
          id: uid(), trabalho_id: t.id, cliente_id: t.cliente_id,
          periodo: t.mes_referencia,
          delta_vt: deltas.vt || 0, delta_video: deltas.video || 0, delta_3d: deltas.d3 || 0,
          timestamp: now(), observacoes: t.tipo_multimedia,
        }
        setCo(p => [...p, co])
      }
      return prev
    })
  }, [])

  const deleteTrabalho = useCallback((id) => {
    setT(prev => prev.filter(t => t.id !== id))
    setCo(prev => prev.filter(c => c.trabalho_id !== id))
  }, [])

  const markUpload = useCallback((id, extra = {}) => {
    setT(prev => prev.map(t => t.id === id ? { ...t, ...extra, estado_trabalho: 'Upload feito', data_upload: now() } : t))
  }, [])

  const saldoMes = useCallback((clienteId, periodo) => {
    const c = clientes.find(x => x.id === clienteId)
    if (!c) return { vt: 0, video: 0, d3: 0 }
    const plan = c.plano_mensal || {}
    const cos = consumos.filter(x => x.cliente_id === clienteId && x.periodo === periodo)
    const used = cos.reduce((a, x) => ({ vt: a.vt + Math.abs(x.delta_vt || 0), video: a.video + Math.abs(x.delta_video || 0), d3: a.d3 + Math.abs(x.delta_3d || 0) }), { vt: 0, video: 0, d3: 0 })
    return {
      vt: { total: plan.creditos_vt || 0, usado: used.vt },
      video: { total: plan.creditos_video || 0, usado: used.video },
      d3: { total: plan.creditos_3d || 0, usado: used.d3 },
    }
  }, [clientes, consumos])

  const exportData = useCallback(() => ({ clientes, trabalhos, consumos }), [clientes, trabalhos, consumos])

  const importData = useCallback((data) => {
    if (data.clientes) setC(data.clientes)
    if (data.trabalhos) setT(data.trabalhos)
    if (data.consumos) setCo(data.consumos)
  }, [])

  const clearAll = useCallback(() => { setC([]); setT([]); setCo([]) }, [])
  const clearTrabalhos = useCallback(() => { setT([]); setCo([]) }, [])
  const clearClientes = useCallback(() => {
    setC([])
    setT(prev => prev.filter(t => false))
    setCo([])
  }, [])

  return (
    <Ctx.Provider value={{
      clientes, trabalhos, consumos,
      addCliente, updateCliente, deleteCliente,
      addTrabalho, updateTrabalho, deleteTrabalho, markUpload,
      saldoMes, exportData, importData, clearAll, clearTrabalhos, clearClientes,
    }}>
      {children}
    </Ctx.Provider>
  )
}
