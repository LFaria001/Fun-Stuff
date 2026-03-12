import { useState, useEffect, useMemo, useCallback } from "react";
import {
  LayoutDashboard, Users, Briefcase, BarChart3, Plus, Search,
  Upload, CheckCircle, AlertTriangle, ChevronRight, X, Edit2,
  ArrowLeft, Trash2, Filter, Calendar, Download, ChevronLeft,
  AlertCircle, Info, Check, XCircle, ExternalLink, RefreshCw, Settings, Euro, LogOut
} from "lucide-react";

// ─── API ─────────────────────────────────────────────────────────────────────
import * as api from "./src/api.js";

// ─── UTILS ──────────────────────────────────────────────────────────────────
const uid = () => crypto.randomUUID?.() || Math.random().toString(36).slice(2, 11);
const fmt = (d) => d ? new Date(d).toLocaleDateString("pt-PT") : "—";
const fmtDT = (d) => d ? new Date(d).toLocaleString("pt-PT") : "—";
const now = () => new Date().toISOString();
const mesAno = (d) => { const dt = new Date(d); return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,"0")}`; };
const mesLabel = (p) => { const [y,m] = p.split("-"); const nomes=["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"]; return `${nomes[+m-1]} ${y}`; };
const hoje = () => { const d = new Date(); return d.toISOString().split("T")[0]; };
const TIPOS = ["VT", "Vídeo", "3D", "VT+Vídeo", "3D+Vídeo"];
const ESTADOS = ["Realizado", "Upload feito"];
const ESTADO_CORES = { "Realizado": "#f59e0b", "Upload feito": "#10b981" };

function creditosPorTipo(tipo) {
  switch(tipo) {
    case "VT": return { vt: 1, video: 0, "3d": 0 };
    case "Vídeo": return { vt: 0, video: 1, "3d": 0 };
    case "3D": return { vt: 0, video: 0, "3d": 1 };
    case "VT+Vídeo": return { vt: 1, video: 1, "3d": 0 };
    case "3D+Vídeo": return { vt: 0, video: 1, "3d": 1 };
    default: return { vt: 0, video: 0, "3d": 0 };
  }
}
function valorPorTipo(tipo) {
  switch(tipo) {
    case "VT": return 30;
    case "Vídeo": return 40;
    case "3D": return 30;
    case "VT+Vídeo": return 70;
    case "3D+Vídeo": return 70;
    default: return 0;
  }
}

// ─── SEED DATA ──────────────────────────────────────────────────────────────

// ─── STORAGE (removed — now using API) ──────────────────────────────────────

// ─── useMediaQuery ──────────────────────────────────────────────────────────
function useMedia(query) {
  const [match, setMatch] = useState(() => typeof window !== "undefined" && window.matchMedia(query).matches);
  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e) => setMatch(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query]);
  return match;
}

// ─── LOGIN PAGE ─────────────────────────────────────────────────────────────
function LoginPage({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const fn = isRegister ? api.authRegister : api.authLogin;
      const { user } = await fn(email, password);
      onLogin(user);
    } catch (err) { setError(err.message || "Erro inesperado."); }
    setLoading(false);
  };

  const iStyle = {
    width: "100%", padding: "12px 14px", background: "#0c0d12", border: "1px solid #27272a",
    borderRadius: 10, color: "#e4e4e7", fontSize: 14, outline: "none",
    fontFamily: "'DM Sans',sans-serif",
  };

  return (
    <div style={{
      fontFamily: "'DM Sans', sans-serif", background: "#0c0d12",
      color: "#e4e4e7", minHeight: "100vh", display: "flex",
      alignItems: "center", justifyContent: "center", padding: 20,
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input:focus { border-color: #3b82f6 !important; box-shadow: 0 0 0 3px #3b82f614; outline: none; }`}</style>
      <div style={{
        background: "#13141b", border: "1px solid #1e1f2a",
        borderRadius: 16, padding: 32, width: "100%", maxWidth: 400,
      }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#f4f4f5", marginBottom: 4 }}>Idealista Tracker</h1>
        <p style={{ fontSize: 13, color: "#52525b", marginBottom: 24 }}>
          {isRegister ? "Criar conta" : "Entrar na tua conta"}
        </p>

        {error && <div style={{
          background: "#7f1d1d33", border: "1px solid #7f1d1d",
          borderRadius: 8, padding: "8px 12px", fontSize: 13,
          color: "#ef4444", marginBottom: 16,
        }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12, marginBottom: 16 }}>
          <input style={iStyle} type="email" placeholder="Email" value={email}
            onChange={e => setEmail(e.target.value)} required />
          <input style={iStyle} type="password" placeholder="Password" value={password}
            onChange={e => setPassword(e.target.value)} required minLength={6} />
          <button type="submit" disabled={loading} style={{
            width: "100%", padding: "12px 0", background: "linear-gradient(135deg, #3b82f6, #2563eb)",
            color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.5 : 1,
            fontFamily: "'DM Sans',sans-serif",
          }}>{loading ? "A processar..." : isRegister ? "Criar conta" : "Entrar"}</button>
        </form>

        <p style={{ fontSize: 13, color: "#52525b", textAlign: "center" }}>
          {isRegister ? "Já tens conta? " : "Não tens conta? "}
          <button onClick={() => { setIsRegister(!isRegister); setError(""); }} style={{
            background: "none", border: "none", color: "#3b82f6",
            cursor: "pointer", fontSize: 13, fontWeight: 500,
            fontFamily: "'DM Sans',sans-serif",
          }}>{isRegister ? "Entrar" : "Criar conta"}</button>
        </p>
      </div>
    </div>
  );
}

// ─── MAIN APP ───────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    api.authMe().then(({ user }) => setUser(user)).catch(() => {}).finally(() => setAuthLoading(false));
  }, []);

  const handleLogin = (u) => setUser(u);
  const handleLogout = async () => { await api.authLogout().catch(() => {}); setUser(null); };

  if (authLoading) return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#0c0d12", color: "#a1a1aa", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      A carregar...
    </div>
  );

  if (!user) return <LoginPage onLogin={handleLogin} />;

  return <AppAuthed key={user.id} user={user} onLogout={handleLogout} />;
}

// ─── AUTHENTICATED APP ──────────────────────────────────────────────────────
function AppAuthed({ user, onLogout }) {
  const [clientes, setClientes] = useState([]);
  const [trabalhos, setTrabalhos] = useState([]);
  const [consumos, setConsumos] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [page, setPage] = useState("dashboard");
  const [subPage, setSubPage] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);


  const isMobile = useMedia("(max-width: 768px)");
  const isTablet = useMedia("(max-width: 1024px)");
  const mesAtualGlobal = mesAno(new Date());

  // Load data from API on mount
  useEffect(() => {
    Promise.all([api.getClientes(), api.getTrabalhos(), api.getConsumos()])
      .then(([c, t, co]) => { setClientes(c); setTrabalhos(t); setConsumos(co); })
      .catch(() => {})
      .finally(() => setDataLoading(false));
  }, []);

  const showToast = useCallback((msg, type = "info") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const navigate = (p, sub = null, id = null) => {
    setPage(p); setSubPage(sub); setSelectedId(id);
    window.scrollTo?.(0, 0);
  };

  const clienteNome = useCallback((id) => clientes.find(c => c.id === id)?.nome_agencia || "—", [clientes]);

  const saldoMes = useCallback((clienteId, periodo) => {
    const cli = clientes.find(c => c.id === clienteId);
    if (!cli) return { vt: 0, video: 0, "3d": 0 };
    const cons = consumos.filter(c => c.cliente_id === clienteId && c.periodo === periodo);
    const usadoVT = cons.reduce((s, c) => s + Math.abs(c.delta_vt), 0);
    const usadoVideo = cons.reduce((s, c) => s + Math.abs(c.delta_video), 0);
    const usado3D = cons.reduce((s, c) => s + Math.abs(c.delta_3d), 0);
    return {
      vt: cli.plano_mensal.creditos_vt - usadoVT,
      video: cli.plano_mensal.creditos_video - usadoVideo,
      "3d": cli.plano_mensal.creditos_3d - usado3D,
      usadoVT, usadoVideo, usado3D,
      totalVT: cli.plano_mensal.creditos_vt,
      totalVideo: cli.plano_mensal.creditos_video,
      total3D: cli.plano_mensal.creditos_3d,
    };
  }, [clientes, consumos]);

  const registarConsumo = useCallback(async (trabalhoId, clienteId, tipo, periodo) => {
    const custos = creditosPorTipo(tipo);
    const consumo = {
      id: uid(), trabalho_id: trabalhoId, cliente_id: clienteId, periodo,
      delta_vt: -custos.vt, delta_video: -custos.video, delta_3d: -custos["3d"],
      timestamp: now(), observacoes: `${tipo}`
    };
    setConsumos(prev => [...prev, consumo]);
    try { await api.createConsumo(consumo); } catch {}
  }, []);


  const findCol = (headers, names) => headers.find(h => names.some(n => h.toLowerCase().includes(n.toLowerCase())));

  const [syncLoading, setSyncLoading] = useState(false);

  const SHEETS = {
    clientes: "1_zaLer7UNb84TENlG-MoPjbABYAGf-Zy5M_IuwRhHH0",
    trabalhos: "1KJ3IZJRJWiXSHBy-JrHIPC_advKYhWDz",
  };

  const parseCSV = (text) => {
    const rows = [];
    let current = "", inQuotes = false, row = [], i = 0;
    while (i <= text.length) {
      const ch = text[i] ?? "\n";
      if (inQuotes) {
        if (ch === '"' && text[i + 1] === '"') { current += '"'; i += 2; continue; }
        if (ch === '"') { inQuotes = false; i++; continue; }
        current += ch; i++; continue;
      }
      if (ch === '"') { inQuotes = true; i++; continue; }
      if (ch === ",") { row.push(current); current = ""; i++; continue; }
      if (ch === "\n" || ch === "\r") {
        row.push(current); current = "";
        if (row.some(c => c.trim())) rows.push(row);
        row = [];
        if (ch === "\r" && text[i + 1] === "\n") i++;
        i++; continue;
      }
      current += ch; i++;
    }
    return rows;
  };

  const fetchGoogleSheet = async (sheetId) => {
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Erro ao aceder ao Google Sheets (${sheetId}). Verifica que está partilhado como "Qualquer pessoa com o link".`);
    const text = await res.text();
    // gviz returns JS callback on error, CSV on success
    if (text.includes("google.visualization.Query.setResponse")) {
      throw new Error(`Google Sheets não acessível. Verifica que a sheet está partilhada como "Qualquer pessoa com o link".`);
    }
    const csvRows = parseCSV(text);
    if (!csvRows.length) throw new Error("Sheet vazia — nenhum dado encontrado.");
    // Convert CSV rows to array of objects (first row = headers)
    const headers = csvRows[0];
    const data = csvRows.slice(1).map(row => {
      const obj = {};
      headers.forEach((h, i) => { obj[h] = row[i] ?? ""; });
      return obj;
    });
    return { headers, data };
  };

  const parseClientesFromSheet = ({ headers, data }, existingNames, seen) => {
    const novos = [];
    const rows = data;
    if (!rows.length) return novos;

    // Try to find columns by name first, then fall back to position
    let colAgencia = findCol(headers, ["Agência", "Agencia"]);
    let colContacto = findCol(headers, ["Contacto"]);
    let colEmail = findCol(headers, ["Email"]);
    let colConteudos = findCol(headers, ["Conteúdos", "Conteudos", "Multimédia", "Multimedia"]);
    let colNotas = findCol(headers, ["Notas"]);

    // If no named "Agência" column, try to detect by content pattern
    if (!colAgencia) {
      for (const h of headers) {
        const sample = String(rows[0][h] ?? "").trim();
        if (sample && !sample.includes("@") && isNaN(sample) && sample.length > 3 && !sample.includes("VT") && !sample.includes("VI")) {
          colAgencia = h;
          break;
        }
      }
    }
    if (!colAgencia) return novos;

    // Detect conteúdos column by content pattern (contains "VT" or "VI")
    if (!colConteudos) {
      for (const h of headers) {
        const sample = String(rows[0][h] ?? "");
        if (sample.match(/\d+\s*(VT|VI|3D)/i)) { colConteudos = h; break; }
      }
    }
    // Detect email column by content pattern
    if (!colEmail) {
      for (const h of headers) {
        const sample = String(rows[0][h] ?? "");
        if (sample.includes("@")) { colEmail = h; break; }
      }
    }
    // Detect contacto column by content pattern (9-digit number)
    if (!colContacto) {
      for (const h of headers) {
        const sample = String(rows[0][h] ?? "").trim();
        if (sample.match(/^\d{9,}$/)) { colContacto = h; break; }
      }
    }

    for (const row of rows) {
      const nome = String(row[colAgencia] ?? "").trim();
      if (!nome) continue;
      const nomeKey = nome.toLowerCase();
      if (existingNames.has(nomeKey) || seen.has(nomeKey)) continue;
      seen.add(nomeKey);

      const conteudos = colConteudos ? String(row[colConteudos] ?? "").trim() : "";
      const plano = { creditos_vt: 0, creditos_video: 0, creditos_3d: 0 };
      const vtMatch = conteudos.match(/(\d+)\s*VT/i);
      const viMatch = conteudos.match(/(\d+)\s*V[IÍ]/i);
      const tdMatch = conteudos.match(/(\d+)\s*3D/i);
      if (vtMatch) plano.creditos_vt = parseInt(vtMatch[1]);
      if (viMatch) plano.creditos_video = parseInt(viMatch[1]);
      if (tdMatch) plano.creditos_3d = parseInt(tdMatch[1]);

      novos.push({
        id: uid(), nome_agencia: nome,
        contacto: colContacto ? String(row[colContacto] ?? "") : "",
        email: colEmail ? String(row[colEmail] ?? "").trim() : "",
        notas: colNotas ? String(row[colNotas] ?? "").trim() : "",
        plano_mensal: plano, estado_cliente: "ativo",
      });
    }
    return novos;
  };

  const sincronizarSheets = async () => {
    setSyncLoading(true);
    try {
      // 1. Fetch client sheet
      const wbCli = await fetchGoogleSheet(SHEETS.clientes);

      const existingNames = new Set(clientes.map(c => c.nome_agencia.toLowerCase()));
      const seen = new Set();
      const novosClientes = parseClientesFromSheet(wbCli, existingNames, seen);

      // Add new clients (save each to API)
      if (novosClientes.length) {
        for (const nc of novosClientes) { try { await api.createCliente(nc); } catch {} }
        setClientes(prev => [...prev, ...novosClientes]);
      }

      const msgs = [];
      if (novosClientes.length) msgs.push(`${novosClientes.length} cliente(s)`);
      if (msgs.length) {
        showToast(`Sincronizado! ${msgs.join(" e ")} importado(s).`, "success");
      } else {
        showToast("Tudo sincronizado — nenhum dado novo.", "info");
      }
    } catch (err) { showToast(err.message, "error"); }
    setSyncLoading(false);
  };

  const alertas = useMemo(() => ({
    realizadosSemUpload: trabalhos.filter(t => t.estado_trabalho === "Realizado"),
    pendentesSemId: trabalhos.filter(t => !t.id_sistema?.trim()),
  }), [trabalhos, clientes, saldoMes]);

  const pages = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "clientes", label: "Clientes", icon: Users },
    { id: "trabalhos", label: "Trabalhos", icon: Briefcase },
    { id: "relatorios", label: "Relatórios", icon: BarChart3 },
    { id: "definicoes", label: "Definições", icon: Settings },
  ];

  const ctx = {
    clientes, setClientes, trabalhos, setTrabalhos, consumos, setConsumos,
    navigate, clienteNome, saldoMes, registarConsumo,
    showToast, modal, setModal, isMobile, isTablet, alertas,
    mesAtual: mesAtualGlobal, sincronizarSheets, syncLoading, user, onLogout, dataLoading,
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#0c0d12", color: "#e4e4e7", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=JetBrains+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { -webkit-text-size-adjust: 100%; }
        body { overflow-y: scroll; }
        input, select, textarea, button { font-family: 'DM Sans', sans-serif; font-size: 16px; }
        input:focus, select:focus, textarea:focus { border-color: #3b82f6 !important; box-shadow: 0 0 0 3px #3b82f614; outline: none; }
        button { transition: opacity 0.15s, transform 0.1s, background 0.15s, color 0.15s, border-color 0.15s; }
        button:active { transform: scale(0.97); }
        tr { transition: background 0.12s; }
        tr:hover { background: #1e1f2a40; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #3f3f46; border-radius: 2px; }
        ::selection { background: #3b82f640; color: #f4f4f5; }
        @keyframes slideUp { from { transform: translateY(12px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideDown { from { transform: translateY(-100%); } to { transform: translateY(0); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
      `}</style>

      {/* ── MOBILE HEADER ── */}
      {isMobile && (
        <header style={{
          position: "sticky", top: 0, zIndex: 100, background: "#13141bee",
          backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
          borderBottom: "1px solid #1e1f2a", padding: "12px 16px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div>
            <span style={{ fontSize: 17, fontWeight: 700, color: "#f4f4f5" }}>Idealista Tracker</span>
            <span style={{ fontSize: 10, color: "#52525b", marginLeft: 8, fontFamily: "'JetBrains Mono',monospace" }}>v1.0</span>
          </div>
          <button onClick={() => onLogout()} title="Sair" style={{
            background: "none", border: "none", color: "#71717a", cursor: "pointer", padding: 4,
          }}><LogOut size={18} /></button>
        </header>
      )}

      <div style={{ display: "flex", minHeight: isMobile ? "auto" : "100vh" }}>
        {/* ── DESKTOP SIDEBAR ── */}
        {!isMobile && (
          <nav style={{
            width: isTablet ? 68 : 220, background: "#13141b",
            borderRight: "1px solid #1e1f2a", padding: "20px 0",
            flexShrink: 0, display: "flex", flexDirection: "column",
            position: "sticky", top: 0, height: "100vh", overflow: "auto",
            transition: "width 0.2s ease",
          }}>
            <div style={{ padding: isTablet ? "0 8px 20px" : "0 20px 20px", borderBottom: "1px solid #1e1f2a", marginBottom: 8, textAlign: isTablet ? "center" : "left" }}>
              <div style={{ fontSize: isTablet ? 14 : 17, fontWeight: 700, color: "#f4f4f5", letterSpacing: "-0.02em" }}>
                {isTablet ? "IT" : "Idealista Tracker"}
              </div>
              {!isTablet && <div style={{ fontSize: 10, color: "#3b82f6", fontFamily: "'JetBrains Mono',monospace", marginTop: 3, fontWeight: 500 }}>Gestão v1.0</div>}
            </div>
            <div style={{ padding: "4px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
              {pages.map(p => (
                <button key={p.id} onClick={() => navigate(p.id)} title={p.label} style={{
                  display: "flex", alignItems: "center", justifyContent: isTablet ? "center" : "flex-start",
                  gap: 10, padding: isTablet ? "12px 0" : "10px 12px", border: "none",
                  background: page === p.id ? "#3b82f612" : "transparent",
                  color: page === p.id ? "#3b82f6" : "#71717a", cursor: "pointer",
                  fontSize: 14, fontWeight: page === p.id ? 600 : 400,
                  borderRadius: 10, transition: "all 0.15s",
                }}><p.icon size={18} /> {!isTablet && p.label}</button>
              ))}
            </div>
            <div style={{ marginTop: "auto", padding: "12px 8px", borderTop: "1px solid #1e1f2a" }}>
              {!isTablet && <div style={{ fontSize: 11, color: "#52525b", padding: "4px 12px", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</div>}
              <button onClick={() => onLogout()} title="Sair" style={{
                display: "flex", alignItems: "center", justifyContent: isTablet ? "center" : "flex-start",
                gap: 10, padding: isTablet ? "10px 0" : "10px 12px", border: "none",
                background: "transparent", color: "#71717a", cursor: "pointer",
                fontSize: 13, borderRadius: 10, width: "100%",
              }}><LogOut size={16} /> {!isTablet && "Sair"}</button>
            </div>
          </nav>
        )}

        {/* ── CONTENT ── */}
        <main style={{
          flex: 1, padding: isMobile ? "16px 16px 88px" : "24px 28px",
          overflowX: "hidden",
          maxHeight: isMobile ? "none" : "100vh",
          overflowY: isMobile ? "visible" : "auto",
        }}>
          {dataLoading ? <div style={{ padding: 40, textAlign: "center", color: "#71717a" }}>A carregar dados...</div> : <>
          {page === "dashboard" && <DashboardPage {...ctx} />}
          {page === "clientes" && !subPage && <ClientesLista {...ctx} />}
          {page === "clientes" && subPage === "detalhe" && <ClienteDetalhe clienteId={selectedId} {...ctx} />}
          {page === "clientes" && subPage === "novo" && <ClienteForm {...ctx} />}
          {page === "clientes" && subPage === "editar" && <ClienteForm editId={selectedId} {...ctx} />}
          {page === "trabalhos" && !subPage && <TrabalhosLista {...ctx} />}
          {page === "trabalhos" && subPage === "novo" && <TrabalhoForm {...ctx} />}
          {page === "trabalhos" && subPage === "editar" && <TrabalhoForm editId={selectedId} {...ctx} />}
          {page === "relatorios" && <RelatoriosPage {...ctx} />}
          {page === "definicoes" && <DefinicoesPage {...ctx} />}
          </>}
        </main>
      </div>

      {/* ── MOBILE BOTTOM TAB BAR ── */}
      {isMobile && (
        <nav style={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100,
          background: "#13141bf0", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
          borderTop: "1px solid #1e1f2a",
          display: "flex", paddingBottom: "env(safe-area-inset-bottom, 4px)",
        }}>
          {pages.map(p => (
            <button key={p.id} onClick={() => navigate(p.id)} style={{
              flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
              gap: 3, padding: "10px 0 6px", border: "none", background: "transparent",
              color: page === p.id ? "#3b82f6" : "#52525b", cursor: "pointer",
              fontSize: 10, fontWeight: page === p.id ? 600 : 400,
              position: "relative",
            }}>
              {page === p.id && <div style={{ position: "absolute", top: 0, left: "25%", right: "25%", height: 2, background: "#3b82f6", borderRadius: "0 0 2px 2px" }} />}
              <p.icon size={20} strokeWidth={page === p.id ? 2.5 : 1.5} />
              <span>{p.label}</span>
            </button>
          ))}
        </nav>
      )}

      {/* ── SYNC OVERLAY ── */}
      {syncLoading && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 9998, background: "rgba(0,0,0,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          animation: "fadeIn 0.15s ease",
        }}>
          <div style={{ background: "#1a1b23", borderRadius: 16, padding: "24px 32px", border: "1px solid #27272a", textAlign: "center" }}>
            <RefreshCw size={28} style={{ color: "#34a853", animation: "spin 1s linear infinite", marginBottom: 12 }} />
            <div style={{ color: "#f4f4f5", fontSize: 14, fontWeight: 500 }}>A sincronizar com Google Sheets...</div>
          </div>
        </div>
      )}

      {/* ── TOAST ── */}
      {toast && (
        <div style={{
          position: "fixed", bottom: isMobile ? 80 : 20, left: isMobile ? 16 : "auto",
          right: isMobile ? 16 : 20, zIndex: 9999, animation: "slideUp 0.2s ease",
          background: toast.type === "error" ? "#7f1d1d" : toast.type === "success" ? "#14532d" : "#1e3a5f",
          color: "#f4f4f5", borderRadius: 14, fontSize: 14,
          maxWidth: isMobile ? "none" : 420,
          boxShadow: "0 8px 32px rgba(0,0,0,0.5)", overflow: "hidden",
          border: `1px solid ${toast.type === "error" ? "#991b1b" : toast.type === "success" ? "#166534" : "#1e40af"}`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px" }}>
            {toast.type === "error" ? <XCircle size={18} style={{ flexShrink: 0 }} /> : toast.type === "success" ? <CheckCircle size={18} style={{ flexShrink: 0 }} /> : <Info size={18} style={{ flexShrink: 0 }} />}
            <span style={{ whiteSpace: "pre-line", flex: 1, fontSize: 13 }}>{toast.msg}</span>
            <button onClick={() => setToast(null)} style={{ background: "none", border: "none", color: "#a1a1aa", cursor: "pointer", flexShrink: 0, padding: 4 }}><X size={16} /></button>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SHARED UI COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════
const btnChip = {
  display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px",
  background: "none", border: "1px solid #27272a", borderRadius: 10,
  color: "#a1a1aa", fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
  whiteSpace: "nowrap",
};
const btnPrimary = (mob) => ({
  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
  padding: mob ? "14px 20px" : "10px 20px", background: "linear-gradient(135deg, #3b82f6, #2563eb)",
  color: "#fff", border: "none", borderRadius: 12, fontSize: mob ? 15 : 14,
  fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
  width: mob ? "100%" : "auto", boxShadow: "0 2px 8px #3b82f630",
});
const btnSecondary = (mob) => ({ ...btnPrimary(mob), background: "#1e1f2a", color: "#e4e4e7", boxShadow: "none" });
const inputStyle = {
  width: "100%", padding: "12px 14px", background: "#0c0d12", border: "1px solid #27272a",
  borderRadius: 10, color: "#e4e4e7", fontSize: 16, outline: "none",
  fontFamily: "'DM Sans',sans-serif", WebkitAppearance: "none",
  transition: "border-color 0.15s, box-shadow 0.15s",
};
const labelStyle = { fontSize: 12, fontWeight: 600, color: "#71717a", marginBottom: 6, display: "block", textTransform: "uppercase", letterSpacing: "0.04em" };
const cardStyle = { background: "#13141b", border: "1px solid #1e1f2a", borderRadius: 16, padding: 18, marginBottom: 12 };
const tdS = { padding: "12px 14px", borderBottom: "1px solid #0c0d1280" };
const thS = { textAlign: "left", padding: "10px 14px", borderBottom: "2px solid #1e1f2a", color: "#52525b", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" };

function Badge({ children, color }) {
  return <span style={{
    display: "inline-flex", alignItems: "center", padding: "4px 10px", borderRadius: 20,
    fontSize: 11, fontWeight: 600, background: color + "15", color, whiteSpace: "nowrap",
    border: `1px solid ${color}20`, letterSpacing: "0.01em",
  }}>{children}</span>;
}

function PageHeader({ title, subtitle, actions, isMobile }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "center", flexDirection: isMobile ? "column" : "row", gap: isMobile ? 12 : 0 }}>
        <div>
          <h1 style={{ fontSize: isMobile ? 22 : 24, fontWeight: 700, color: "#f4f4f5", letterSpacing: "-0.02em" }}>{title}</h1>
          {subtitle && <p style={{ fontSize: 13, color: "#52525b", marginTop: 2 }}>{subtitle}</p>}
        </div>
        {actions && <div style={{ display: "flex", gap: 8, width: isMobile ? "100%" : "auto" }}>{actions}</div>}
      </div>
    </div>
  );
}

function ModalSheet({ title, children, onClose, isMobile }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex",
      alignItems: isMobile ? "flex-end" : "center", justifyContent: "center",
      zIndex: 1000, animation: "fadeIn 0.15s ease",
    }} onClick={onClose}>
      <div style={{
        background: "#13141b", border: isMobile ? "none" : "1px solid #1e1f2a",
        borderRadius: isMobile ? "20px 20px 0 0" : 16,
        width: isMobile ? "100%" : 520, maxWidth: "100vw",
        maxHeight: isMobile ? "92vh" : "85vh", overflow: "auto",
        padding: isMobile ? "8px 16px 32px" : 28,
        animation: "slideUp 0.25s ease",
      }} onClick={e => e.stopPropagation()}>
        {isMobile && <div style={{ width: 36, height: 4, background: "#3f3f46", borderRadius: 2, margin: "8px auto 16px" }} />}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#f4f4f5" }}>{title}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#71717a", cursor: "pointer", padding: 4 }}><X size={22} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function CreditBar({ label, used, total, color }) {
  const pct = total > 0 ? (used / total) * 100 : 0;
  const textColor = total === 0 ? "#52525b" : used >= total ? "#10b981" : "#ef4444";
  const barColor = total === 0 ? "#52525b" : pct >= 100 ? "#10b981" : color;
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6, alignItems: "center" }}>
        <span style={{ color: "#a1a1aa" }}>{label}</span>
        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 600, color: textColor, fontSize: 14 }}>
          {used}<span style={{ color: "#3f3f46" }}>/{total}</span>
        </span>
      </div>
      <div style={{ height: 6, background: "#1e1f2a", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${Math.min(pct, 100)}%`, background: barColor, borderRadius: 3, transition: "width 0.4s ease" }} />
      </div>
    </div>
  );
}

function ScrollTable({ children }) {
  return <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch", margin: "0 -16px", padding: "0 16px" }}>{children}</div>;
}

// Mobile card for a single trabalho
function TrabalhoCard({ t, clienteNome, onAction }) {
  return (
    <div style={{ ...cardStyle, padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8, gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#f4f4f5", marginBottom: 3 }}>{clienteNome(t.cliente_id)}</div>
          <div style={{ fontSize: 13, color: "#71717a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {t.local ? `${t.local} — ` : ""}{t.morada}
          </div>
        </div>
        <Badge color={ESTADO_CORES[t.estado_trabalho]}>{t.estado_trabalho}</Badge>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", fontSize: 12, color: "#71717a", marginBottom: 14, alignItems: "center" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#52525b" }}><Calendar size={12} /> {fmt(t.data_trabalho)}</span>
        <Badge color="#3b82f6">{t.tipo_multimedia}</Badge>
        {!t.id_sistema?.trim() && <Badge color="#ef4444">Sem ID</Badge>}
        {t.id_sistema?.trim() && <span style={{ fontFamily: "'JetBrains Mono',monospace", color: "#3f3f46", fontSize: 12 }}>{t.id_sistema}</span>}
      </div>
      <div style={{ display: "flex", gap: 8, borderTop: "1px solid #1e1f2a", paddingTop: 12 }}>
        <button style={{ ...btnChip, flex: 1, justifyContent: "center" }} onClick={() => onAction("editar", t)}><Edit2 size={14} /> Editar</button>
        {t.estado_trabalho === "Realizado" && (
          <button style={{ ...btnChip, flex: 1, justifyContent: "center", color: "#8b5cf6", borderColor: "#8b5cf640" }} onClick={() => onAction("upload", t)}>
            <Upload size={14} /> Upload
          </button>
        )}
        {t.link_upload && (
          <a href={t.link_upload} target="_blank" rel="noopener noreferrer" style={{ ...btnChip, textDecoration: "none" }}><ExternalLink size={14} /></a>
        )}
        <button style={{ ...btnChip, color: "#ef4444", borderColor: "#ef444440" }} onClick={() => onAction("apagar", t)}><Trash2 size={14} /></button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PAGES
// ═══════════════════════════════════════════════════════════════════════════

// ─── DASHBOARD ──────────────────────────────────────────────────────────────
function DashboardPage({ trabalhos, clienteNome, isMobile, alertas, mesAtual }) {
  const [mes, setMes] = useState(mesAtual);
  const isCurrentMonth = mes === mesAtual;

  const navMes = (dir) => {
    const [y, m] = mes.split("-").map(Number);
    const d = new Date(y, m - 1 + dir, 1);
    setMes(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  };

  const hj = new Date(); const dow = hj.getDay();
  const seg = new Date(hj); seg.setDate(hj.getDate() - ((dow + 6) % 7)); seg.setHours(0,0,0,0);
  const dom = new Date(seg); dom.setDate(seg.getDate() + 6); dom.setHours(23,59,59,999);
  const semanaTrab = trabalhos.filter(t => { const d = new Date(t.data_trabalho); return d >= seg && d <= dom; });
  const mesTrab = trabalhos.filter(t => (t.mes_referencia || mesAno(t.data_trabalho)) === mes);
  const fatSemana = semanaTrab.reduce((s, t) => s + (t.valor || 0), 0);
  const fatMes = mesTrab.reduce((s, t) => s + (t.valor || 0), 0);

  return (
    <div>
      <PageHeader title="Dashboard" subtitle={new Date().toLocaleDateString("pt-PT", { weekday: "long", day: "numeric", month: "long" })} isMobile={isMobile} />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 16 }}>
        <button onClick={() => navMes(-1)} style={{ background: "none", border: "none", color: "#a1a1aa", cursor: "pointer", padding: 4 }}><ChevronLeft size={20} /></button>
        <span style={{ fontSize: 15, fontWeight: 600, color: "#f4f4f5", minWidth: 100, textAlign: "center" }}>{mesLabel(mes)}</span>
        <button onClick={() => navMes(1)} style={{ background: "none", border: "none", color: isCurrentMonth ? "#27272a" : "#a1a1aa", cursor: isCurrentMonth ? "default" : "pointer", padding: 4 }} disabled={isCurrentMonth}><ChevronRight size={20} /></button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "1fr 1fr", gap: isMobile ? 10 : 14, marginBottom: 16 }}>
        {[
          { label: "Fat. Semana", value: fatSemana.toFixed(2) + "€", color: "#10b981", grad: "linear-gradient(135deg, #10b98118, #10b98108)" },
          { label: "Fat. Mês", value: fatMes.toFixed(2) + "€", color: "#06b6d4", grad: "linear-gradient(135deg, #06b6d418, #06b6d408)" },
        ].map((s, i) => (
          <div key={i} style={{
            ...cardStyle, padding: isMobile ? 16 : 20, background: s.grad,
            borderColor: s.color + "20", position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "absolute", top: -8, right: -8, opacity: 0.06 }}>
              <Euro size={64} color={s.color} />
            </div>
            <div style={{ fontSize: 12, color: "#71717a", fontWeight: 500, marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: isMobile ? 22 : 28, fontWeight: 700, color: s.color, lineHeight: 1, fontFamily: "'JetBrains Mono',monospace" }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12, marginBottom: 12 }}>
        {[
          { title: "Semana por estado", data: semanaTrab, total: semanaTrab.length },
          { title: "Mês por estado", data: mesTrab, total: mesTrab.length },
        ].map((section, si) => (
          <div key={si} style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#f4f4f5" }}>{section.title}</div>
              <span style={{ fontSize: 12, color: "#52525b", fontFamily: "'JetBrains Mono',monospace" }}>{section.total} total</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${ESTADOS.length}, 1fr)`, gap: 8 }}>
              {ESTADOS.map(e => {
                const count = section.data.filter(t => t.estado_trabalho === e).length;
                return (
                  <div key={e} style={{
                    padding: isMobile ? 12 : 16, background: "#0c0d12", borderRadius: 12, textAlign: "center",
                    borderBottom: `3px solid ${ESTADO_CORES[e]}40`,
                  }}>
                    <div style={{ fontSize: isMobile ? 22 : 30, fontWeight: 700, color: count > 0 ? ESTADO_CORES[e] : "#27272a", lineHeight: 1 }}>
                      {count}
                    </div>
                    <div style={{ fontSize: 11, color: "#52525b", marginTop: 6, fontWeight: 500 }}>{e}</div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12 }}>
        {[
          { title: "Sem upload", icon: AlertTriangle, color: "#f59e0b", items: alertas.realizadosSemUpload },
          { title: "Sem ID de Anúncio", icon: AlertCircle, color: "#ef4444", items: alertas.pendentesSemId },
        ].map((alert, ai) => (
          <div key={ai} style={{ ...cardStyle, borderColor: alert.items.length > 0 ? alert.color + "20" : "#1e1f2a" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: alert.color, display: "flex", alignItems: "center", gap: 8 }}>
                <alert.icon size={16} /> {alert.title}
              </div>
              <span style={{
                fontSize: 12, fontWeight: 700, color: alert.items.length > 0 ? alert.color : "#27272a",
                background: alert.items.length > 0 ? alert.color + "18" : "transparent",
                padding: "2px 8px", borderRadius: 20, fontFamily: "'JetBrains Mono',monospace",
              }}>{alert.items.length}</span>
            </div>
            {alert.items.length === 0 ? (
              <div style={{ color: "#27272a", fontSize: 13, padding: "8px 0" }}>Tudo em dia!</div>
            ) : alert.items.slice(0, 5).map(t => (
              <div key={t.id} style={{ padding: "8px 0", borderBottom: "1px solid #1e1f2a08", fontSize: 13, display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, color: "#a1a1aa" }}>
                  <strong style={{ color: "#e4e4e7" }}>{clienteNome(t.cliente_id)}</strong> — {t.morada?.slice(0, 20) || "Sem morada"}
                </span>
                <span style={{ color: "#3f3f46", flexShrink: 0, fontSize: 12, fontFamily: "'JetBrains Mono',monospace" }}>{fmt(t.data_trabalho)}</span>
              </div>
            ))}
            {alert.items.length > 5 && (
              <div style={{ fontSize: 12, color: "#52525b", paddingTop: 8, textAlign: "center" }}>+{alert.items.length - 5} mais</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── CLIENTES LISTA ─────────────────────────────────────────────────────────
function ClientesLista({ clientes, navigate, saldoMes, mesAtual, isMobile }) {
  const [search, setSearch] = useState("");
  const filtered = clientes.filter(c => c.nome_agencia.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <PageHeader title="Clientes" subtitle={`${clientes.length} registados`} isMobile={isMobile}
        actions={<button style={btnPrimary(isMobile)} onClick={() => navigate("clientes", "novo")}><Plus size={18} /> Novo</button>} />
      <div style={{ marginBottom: 14, position: "relative" }}>
        <Search size={18} style={{ position: "absolute", left: 14, top: 14, color: "#3f3f46" }} />
        <input placeholder="Pesquisar…" value={search} onChange={e => setSearch(e.target.value)} style={{ ...inputStyle, paddingLeft: 42 }} />
      </div>

      {isMobile ? (
        filtered.map(c => {
          const s = saldoMes(c.id, mesAtual);
          return (
            <div key={c.id} onClick={() => navigate("clientes", "detalhe", c.id)}
              style={{ ...cardStyle, padding: 14, cursor: "pointer" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#f4f4f5" }}>{c.nome_agencia}</div>
              </div>
              <div style={{ fontSize: 13, color: "#52525b", marginBottom: 8 }}>{c.email}</div>
              <div style={{ display: "flex", gap: 12, fontSize: 12 }}>
                <span>VT: <strong style={{ color: s.totalVT === 0 ? "#52525b" : s.usadoVT >= s.totalVT ? "#10b981" : "#ef4444" }}>{s.usadoVT}/{s.totalVT}</strong></span>
                <span>Vid: <strong style={{ color: s.totalVideo === 0 ? "#52525b" : s.usadoVideo >= s.totalVideo ? "#10b981" : "#ef4444" }}>{s.usadoVideo}/{s.totalVideo}</strong></span>
                <span>3D: <strong style={{ color: s.total3D === 0 ? "#52525b" : s.usado3D >= s.total3D ? "#10b981" : "#ef4444" }}>{s.usado3D}/{s.total3D}</strong></span>
              </div>
            </div>
          );
        })
      ) : (
        <div style={cardStyle}>
          <ScrollTable>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, minWidth: 700 }}>
              <thead><tr>{["Agência","Contacto","Email","Plano","Usado",""].map((h,i) => <th key={i} style={thS}>{h}</th>)}</tr></thead>
              <tbody>{filtered.map(c => {
                const s = saldoMes(c.id, mesAtual);
                return (
                  <tr key={c.id} style={{ cursor: "pointer" }} onClick={() => navigate("clientes", "detalhe", c.id)}>
                    <td style={{ ...tdS, fontWeight: 600, color: "#f4f4f5" }}>{c.nome_agencia}</td>
                    <td style={tdS}>{c.contacto}</td>
                    <td style={{ ...tdS, color: "#52525b" }}>{c.email}</td>
                    <td style={{ ...tdS, fontFamily: "'JetBrains Mono',monospace", fontSize: 13 }}>{c.plano_mensal.creditos_vt}/{c.plano_mensal.creditos_video}/{c.plano_mensal.creditos_3d}</td>
                    <td style={{ ...tdS, fontFamily: "'JetBrains Mono',monospace", fontSize: 13 }}>
                      <span style={{ color: s.totalVT === 0 ? "#52525b" : s.usadoVT >= s.totalVT ? "#10b981" : "#ef4444" }}>{s.usadoVT}</span>/<span style={{ color: s.totalVideo === 0 ? "#52525b" : s.usadoVideo >= s.totalVideo ? "#10b981" : "#ef4444" }}>{s.usadoVideo}</span>/<span style={{ color: s.total3D === 0 ? "#52525b" : s.usado3D >= s.total3D ? "#10b981" : "#ef4444" }}>{s.usado3D}</span>
                    </td>
                    <td style={tdS}><ChevronRight size={16} color="#3f3f46" /></td>
                  </tr>
                );
              })}</tbody>
            </table>
          </ScrollTable>
          {filtered.length === 0 && <div style={{ padding: 32, textAlign: "center", color: "#3f3f46" }}>Nenhum resultado.</div>}
        </div>
      )}
    </div>
  );
}

// ─── CLIENTE DETALHE ────────────────────────────────────────────────────────
function ClienteDetalhe({ clienteId, clientes, trabalhos, consumos, saldoMes, mesAtual, navigate, isMobile }) {
  const cli = clientes.find(c => c.id === clienteId);
  if (!cli) return <div style={{ padding: 32, textAlign: "center" }}>Não encontrado.</div>;
  const s = saldoMes(cli.id, mesAtual);
  const cliTrabalhos = trabalhos.filter(t => t.cliente_id === cli.id).sort((a, b) => new Date(b.data_trabalho) - new Date(a.data_trabalho));
  const cliConsumos = consumos.filter(c => c.cliente_id === cli.id && c.periodo === mesAtual);

  return (
    <div>
      <button onClick={() => navigate("clientes")} style={{ ...btnChip, marginBottom: 12 }}><ArrowLeft size={14} /> Voltar</button>
      <PageHeader title={cli.nome_agencia} subtitle={`${cli.email} • ${cli.contacto}`} isMobile={isMobile}
        actions={
          <button style={{ ...btnChip }} onClick={() => navigate("clientes", "editar", cli.id)}><Edit2 size={14} /> Editar</button>
        } />

      <div style={cardStyle}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#f4f4f5", marginBottom: 14 }}>Créditos — {mesLabel(mesAtual)}</div>
        <CreditBar label="Visitas Virtuais (VT)" used={s.usadoVT} total={s.totalVT} color="#3b82f6" />
        <CreditBar label="Vídeo" used={s.usadoVideo} total={s.totalVideo} color="#8b5cf6" />
        <CreditBar label="3D" used={s.usado3D} total={s.total3D} color="#f59e0b" />
      </div>

      {cliConsumos.length > 0 && (
        <div style={cardStyle}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#f4f4f5", marginBottom: 10 }}>Consumos do mês</div>
          {cliConsumos.map(c => (
            <div key={c.id} style={{ padding: "8px 0", borderBottom: "1px solid #1e1f2a", fontSize: 13, display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#a1a1aa" }}>{c.observacoes}</span>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", color: "#ef4444", fontSize: 12 }}>
                {c.delta_vt ? `VT:${c.delta_vt} ` : ""}{c.delta_video ? `Vid:${c.delta_video} ` : ""}{c.delta_3d ? `3D:${c.delta_3d}` : ""}
              </span>
            </div>
          ))}
        </div>
      )}

      <div style={cardStyle}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#f4f4f5", marginBottom: 12 }}>Trabalhos ({cliTrabalhos.length})</div>
        {cliTrabalhos.length === 0 ? (
          <div style={{ color: "#3f3f46", fontSize: 13 }}>Sem trabalhos.</div>
        ) : cliTrabalhos.map(t => (
          <div key={t.id} style={{ padding: "10px 0", borderBottom: "1px solid #1e1f2a", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, color: "#a1a1aa", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.morada}</div>
              <div style={{ fontSize: 12, color: "#3f3f46", marginTop: 2 }}>{fmt(t.data_trabalho)} • {t.id_sistema || "Sem ID"}</div>
            </div>
            <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
              <Badge color="#3b82f6">{t.tipo_multimedia}</Badge>
              <Badge color={ESTADO_CORES[t.estado_trabalho]}>{t.estado_trabalho}</Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── CLIENTE FORM ───────────────────────────────────────────────────────────
function ClienteForm({ clientes, setClientes, navigate, showToast, editId, isMobile }) {
  const existing = editId ? clientes.find(c => c.id === editId) : null;
  const [form, setForm] = useState(existing || {
    id_cliente: "", nome_agencia: "", contacto: "", email: "",
    plano_mensal: { creditos_vt: 0, creditos_video: 0, creditos_3d: 0 },
  });
  const F = (f, v) => setForm(p => ({ ...p, [f]: v }));
  const FP = (f, v) => setForm(p => ({ ...p, plano_mensal: { ...p.plano_mensal, [f]: +v || 0 } }));

  const hasMultimedia = form.plano_mensal.creditos_vt > 0 || form.plano_mensal.creditos_video > 0 || form.plano_mensal.creditos_3d > 0;
  const save = async () => {
    if (!form.id_cliente?.trim()) { showToast("ID Cliente é obrigatório.", "error"); return; }
    if (!form.nome_agencia?.trim()) { showToast("Agência é obrigatória.", "error"); return; }
    if (!hasMultimedia) { showToast("Seleciona pelo menos um conteúdo multimédia.", "error"); return; }
    if (!window.confirm("Tens a certeza que queres guardar?")) return;
    try {
      if (editId) {
        await api.updateCliente(editId, form);
        setClientes(p => p.map(c => c.id === editId ? { ...c, ...form } : c));
        showToast("Atualizado.", "success");
      } else {
        const newCliente = { ...form, id: uid() };
        await api.createCliente(newCliente);
        setClientes(p => [...p, newCliente]);
        showToast("Criado.", "success");
      }
      navigate("clientes");
    } catch (err) { showToast(err.message || "Erro ao guardar.", "error"); }
  };

  return (
    <div style={{ maxWidth: 600 }}>
      <button onClick={() => navigate("clientes")} style={{ ...btnChip, marginBottom: 12 }}><ArrowLeft size={14} /> Voltar</button>
      <PageHeader title={editId ? "Editar Cliente" : "Novo Cliente"} isMobile={isMobile} />
      <div style={{ display: "grid", gap: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "auto 1fr", gap: 12 }}>
          <div><label style={labelStyle}>ID Cliente <span style={{ color: "#ef4444" }}>*</span></label><input style={inputStyle} value={form.id_cliente || ""} onChange={e => F("id_cliente", e.target.value)} placeholder="Ex: 001" /></div>
          <div><label style={labelStyle}>Agência <span style={{ color: "#ef4444" }}>*</span></label><input style={inputStyle} value={form.nome_agencia} onChange={e => F("nome_agencia", e.target.value)} placeholder="Nome da agência" /></div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12 }}>
          <div><label style={labelStyle}>Contacto</label><input style={inputStyle} value={form.contacto} onChange={e => F("contacto", e.target.value)} placeholder="912 345 678" /></div>
          <div><label style={labelStyle}>Email</label><input style={inputStyle} type="email" value={form.email} onChange={e => F("email", e.target.value)} placeholder="email@exemplo.com" /></div>
        </div>
        <div>
          <label style={{ ...labelStyle, marginBottom: 10 }}>Conteúdos Multimédia <span style={{ color: "#ef4444" }}>*</span></label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            {[
              { label: "VT", key: "creditos_vt" },
              { label: "Vídeo", key: "creditos_video" },
              { label: "3D", key: "creditos_3d" },
            ].map(({ label, key }) => (
              <div key={key}>
                <label style={{ ...labelStyle, fontSize: 11 }}>{label}</label>
                <select style={inputStyle} value={form.plano_mensal[key] || 0} onChange={e => FP(key, e.target.value)}>
                  {Array.from({ length: 11 }, (_, i) => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, flexDirection: isMobile ? "column" : "row" }}>
          <button style={btnPrimary(isMobile)} onClick={save}><Check size={18} /> Guardar</button>
          <button style={btnSecondary(isMobile)} onClick={() => navigate("clientes")}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}

// ─── TRABALHOS LISTA ────────────────────────────────────────────────────────
function TrabalhosLista({ trabalhos, setTrabalhos, clientes, clienteNome, navigate, showToast, modal, setModal, isMobile, setConsumos, consumos }) {
  const [search, setSearch] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroCliente, setFiltroCliente] = useState("");
  const [filtrosOpen, setFiltrosOpen] = useState(false);

  const filtered = useMemo(() => {
    return trabalhos.filter(t => {
      if (filtroEstado && t.estado_trabalho !== filtroEstado) return false;
      if (filtroCliente && t.cliente_id !== filtroCliente) return false;
      if (search) {
        const s = search.toLowerCase();
        return t.morada?.toLowerCase().includes(s) || t.id_sistema?.toLowerCase().includes(s) || clienteNome(t.cliente_id).toLowerCase().includes(s);
      }
      return true;
    }).sort((a, b) => new Date(b.data_trabalho) - new Date(a.data_trabalho));
  }, [trabalhos, filtroEstado, filtroCliente, search, clienteNome]);

  const handleAction = async (action, t) => {
    if (action === "editar") navigate("trabalhos", "editar", t.id);
    else if (action === "upload") setModal({ type: "upload", trabalho: t });
    else if (action === "apagar") {
      if (window.confirm("Tens a certeza que queres apagar este trabalho?")) {
        try {
          await api.deleteTrabalho(t.id);
          // Delete associated consumos via API
          const related = consumos?.filter(c => c.trabalho_id === t.id) || [];
          for (const c of related) { try { await api.deleteConsumo(c.id); } catch {} }
          setTrabalhos(p => p.filter(tr => tr.id !== t.id));
          setConsumos(p => p.filter(c => c.trabalho_id !== t.id));
          showToast("Trabalho apagado.", "success");
        } catch (err) { showToast(err.message || "Erro ao apagar.", "error"); }
      }
    }
  };

  return (
    <div>
      <PageHeader title="Trabalhos" subtitle={`${trabalhos.length} registados`} isMobile={isMobile}
        actions={<button style={btnPrimary(isMobile)} onClick={() => navigate("trabalhos", "novo")}><Plus size={18} /> Novo</button>} />

      <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: isMobile ? "100%" : 200 }}>
          <Search size={18} style={{ position: "absolute", left: 14, top: 14, color: "#3f3f46" }} />
          <input placeholder="Pesquisar…" value={search} onChange={e => setSearch(e.target.value)} style={{ ...inputStyle, paddingLeft: 42 }} />
        </div>
        {isMobile ? (
          <button style={btnChip} onClick={() => setFiltrosOpen(!filtrosOpen)}>
            <Filter size={14} /> Filtros {(filtroEstado || filtroCliente) ? <Badge color="#3b82f6">!</Badge> : null}
          </button>
        ) : (
          <>
            <select style={{ ...inputStyle, width: "auto", minWidth: 140 }} value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
              <option value="">Todos os estados</option>{ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
            <select style={{ ...inputStyle, width: "auto", minWidth: 150 }} value={filtroCliente} onChange={e => setFiltroCliente(e.target.value)}>
              <option value="">Todos os clientes</option>{clientes.map(c => <option key={c.id} value={c.id}>{c.nome_agencia}</option>)}
            </select>
          </>
        )}
      </div>

      {isMobile && filtrosOpen && (
        <div style={{ ...cardStyle, display: "grid", gap: 10, marginBottom: 12 }}>
          <select style={inputStyle} value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
            <option value="">Todos os estados</option>{ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
          <select style={inputStyle} value={filtroCliente} onChange={e => setFiltroCliente(e.target.value)}>
            <option value="">Todos os clientes</option>{clientes.map(c => <option key={c.id} value={c.id}>{c.nome_agencia}</option>)}
          </select>
          {(filtroEstado || filtroCliente) && (
            <button style={{ ...btnChip, justifyContent: "center", width: "100%" }} onClick={() => { setFiltroEstado(""); setFiltroCliente(""); }}>Limpar filtros</button>
          )}
        </div>
      )}

      {isMobile ? (
        filtered.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "#3f3f46" }}>Nenhum resultado.</div>
        ) : filtered.map(t => <TrabalhoCard key={t.id} t={t} clienteNome={clienteNome} onAction={handleAction} />)
      ) : (
        <div style={cardStyle}>
          <ScrollTable>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, minWidth: 800 }}>
              <thead><tr>{["Data","Cliente","Morada","Tipo","ID","Estado","Ações"].map((h,i) => <th key={i} style={thS}>{h}</th>)}</tr></thead>
              <tbody>{filtered.map(t => (
                <tr key={t.id}>
                  <td style={{ ...tdS, whiteSpace: "nowrap" }}>{fmt(t.data_trabalho)}</td>
                  <td style={{ ...tdS, fontWeight: 500 }}>{clienteNome(t.cliente_id)}</td>
                  <td style={{ ...tdS, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 13 }}>{t.morada}</td>
                  <td style={tdS}><Badge color="#3b82f6">{t.tipo_multimedia}</Badge></td>
                  <td style={{ ...tdS, fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>{t.id_sistema || <Badge color="#ef4444">Sem ID</Badge>}</td>
                  <td style={tdS}><Badge color={ESTADO_CORES[t.estado_trabalho]}>{t.estado_trabalho}</Badge></td>
                  <td style={{ ...tdS, whiteSpace: "nowrap" }}>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button style={btnChip} onClick={() => handleAction("editar", t)}><Edit2 size={13} /></button>
                      {t.estado_trabalho === "Realizado" && <button style={{ ...btnChip, color: "#8b5cf6", borderColor: "#8b5cf640" }} onClick={() => handleAction("upload", t)}><Upload size={13} /></button>}
                      {t.link_upload && <a href={t.link_upload} target="_blank" rel="noopener noreferrer" style={{ ...btnChip, textDecoration: "none" }}><ExternalLink size={13} /></a>}
                      <button style={{ ...btnChip, color: "#ef4444", borderColor: "#ef444440" }} onClick={() => handleAction("apagar", t)}><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </ScrollTable>
          {filtered.length === 0 && <div style={{ padding: 32, textAlign: "center", color: "#3f3f46" }}>Nenhum resultado.</div>}
        </div>
      )}

      {modal?.type === "upload" && (
        <ModalUpload trabalho={modal.trabalho} onClose={() => setModal(null)}
          setTrabalhos={setTrabalhos} showToast={showToast} clienteNome={clienteNome} isMobile={isMobile} />
      )}
    </div>
  );
}

// ─── MODAL UPLOAD (R4, R5) ──────────────────────────────────────────────────
function ModalUpload({ trabalho, onClose, setTrabalhos, showToast, clienteNome, isMobile }) {
  const [idSistema, setIdSistema] = useState(trabalho.id_sistema || "");
  const [morada, setMorada] = useState(trabalho.morada || "");

  const confirmar = async () => {
    if (!idSistema.trim() && !morada.trim()) { showToast("Preenche o ID do anúncio ou a morada.", "error"); return; }
    const updated = { ...trabalho, estado_trabalho: "Upload feito", data_upload: now(), id_sistema: idSistema.trim(), morada: morada.trim() };
    try {
      await api.updateTrabalho(trabalho.id, updated);
      setTrabalhos(prev => prev.map(t => t.id === trabalho.id ? updated : t));
      showToast("Upload registado!", "success");
      onClose();
    } catch (err) { showToast(err.message || "Erro ao registar upload.", "error"); }
  };

  return (
    <ModalSheet title="Upload" onClose={onClose} isMobile={isMobile}>
      <div style={{ fontSize: 14, lineHeight: 1.7, marginBottom: 16, color: "#a1a1aa" }}>
        <strong style={{ color: "#f4f4f5" }}>{clienteNome(trabalho.cliente_id)}</strong><br />
        {trabalho.tipo_multimedia} • {fmt(trabalho.data_trabalho)}
      </div>
      <div style={{ display: "grid", gap: 14 }}>
        <div><label style={labelStyle}>ID do Anúncio</label><input style={inputStyle} value={idSistema} onChange={e => setIdSistema(e.target.value)} placeholder="Ex: 12345678" /></div>
        {!idSistema.trim() && (
          <div><label style={labelStyle}>Morada (sem ID)</label><input style={inputStyle} value={morada} onChange={e => setMorada(e.target.value)} placeholder="Rua…, Cidade" /></div>
        )}
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 20, flexDirection: isMobile ? "column-reverse" : "row", justifyContent: "flex-end" }}>
        <button style={btnSecondary(isMobile)} onClick={onClose}>Cancelar</button>
        <button style={{ ...btnPrimary(isMobile), background: "#8b5cf6" }} onClick={confirmar}><Upload size={18} /> Confirmar</button>
      </div>
    </ModalSheet>
  );
}

// ─── TRABALHO FORM ──────────────────────────────────────────────────────────
function TrabalhoForm({ trabalhos, setTrabalhos, clientes, navigate, showToast, editId, isMobile, registarConsumo, setConsumos, consumos }) {
  const existing = editId ? trabalhos.find(t => t.id === editId) : null;
  const existingCliente = existing ? clientes.find(c => c.id === existing.cliente_id) : null;
  const [agenciaSearch, setAgenciaSearch] = useState(existingCliente?.nome_agencia || "");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [idMode, setIdMode] = useState(existing?.id_sistema?.trim() ? "id" : existing?.morada?.trim() ? "morada" : "id");
  const [form, setForm] = useState(existing || {
    cliente_id: "", data_trabalho: hoje(), mes_referencia: mesAno(hoje()), local: "", morada: "",
    id_sistema: "", tipo_multimedia: "VT", valor: valorPorTipo("VT"), estado_trabalho: "Realizado",
    link_upload: "", notas_upload: "", data_upload: null
  });
  const F = (f, v) => setForm(p => ({ ...p, [f]: v }));

  const save = async () => {
    if (!form.data_trabalho) { showToast("Data é obrigatória.", "error"); return; }
    if (!form.cliente_id) { showToast("Agência é obrigatória.", "error"); return; }
    if (!form.tipo_multimedia) { showToast("Conteúdos Multimédia é obrigatório.", "error"); return; }
    if (idMode === "id" && !form.id_sistema?.trim()) { showToast("ID do Anúncio é obrigatório.", "error"); return; }
    if (idMode === "morada" && !form.morada?.trim()) { showToast("Morada é obrigatória.", "error"); return; }
    if (!form.local?.trim()) { showToast("Local é obrigatório.", "error"); return; }
    if (!window.confirm("Tens a certeza que queres guardar?")) return;
    try {
      if (editId) {
        const updated = { ...form, valor: form.valor ? +form.valor : null };
        await api.updateTrabalho(editId, updated);
        setTrabalhos(p => p.map(t => t.id === editId ? { ...t, ...updated } : t));
        // Re-register consumption with updated type/period/client
        const periodo = form.mes_referencia || mesAno(form.data_trabalho || new Date());
        const custos = creditosPorTipo(form.tipo_multimedia);
        // Delete old consumos for this trabalho via API
        const oldConsumos = consumos.filter(c => c.trabalho_id === editId);
        for (const oc of oldConsumos) { try { await api.deleteConsumo(oc.id); } catch {} }
        if (form.cliente_id) {
          const newConsumo = {
            id: uid(), trabalho_id: editId, cliente_id: form.cliente_id, periodo,
            delta_vt: -custos.vt, delta_video: -custos.video, delta_3d: -custos["3d"],
            timestamp: now(), observacoes: `${form.tipo_multimedia}`
          };
          await api.createConsumo(newConsumo);
          setConsumos(p => [...p.filter(c => c.trabalho_id !== editId), newConsumo]);
        } else {
          setConsumos(p => p.filter(c => c.trabalho_id !== editId));
        }
        showToast("Atualizado.", "success");
      } else {
        const newId = uid();
        const newTrabalho = { ...form, id: newId, valor: form.valor ? +form.valor : null };
        await api.createTrabalho(newTrabalho);
        setTrabalhos(p => [...p, newTrabalho]);
        const periodo = form.mes_referencia || mesAno(form.data_trabalho || new Date());
        if (form.cliente_id) await registarConsumo(newId, form.cliente_id, form.tipo_multimedia, periodo);
        showToast("Criado.", "success");
      }
      navigate("trabalhos");
    } catch (err) { showToast(err.message || "Erro ao guardar.", "error"); }
  };

  return (
    <div style={{ maxWidth: 600 }}>
      <button onClick={() => navigate("trabalhos")} style={{ ...btnChip, marginBottom: 12 }}><ArrowLeft size={14} /> Voltar</button>
      <PageHeader title={editId ? "Editar Trabalho" : "Novo Trabalho"} isMobile={isMobile} />
      <div style={{ display: "grid", gap: 14 }}>
        <div><label style={labelStyle}>Data <span style={{ color: "#ef4444" }}>*</span></label><input type="date" style={inputStyle} value={form.data_trabalho} onChange={e => { F("data_trabalho", e.target.value); if (!existing) F("mes_referencia", mesAno(e.target.value)); }} /></div>
        <div><label style={labelStyle}>Mês de referência</label><input type="month" style={inputStyle} value={form.mes_referencia || mesAno(form.data_trabalho)} onChange={e => F("mes_referencia", e.target.value)} /></div>
        <div style={{ position: "relative" }}><label style={labelStyle}>Agência <span style={{ color: "#ef4444" }}>*</span></label>
          <input style={inputStyle} value={agenciaSearch} placeholder="Pesquisar agência..."
            onChange={e => {
              setAgenciaSearch(e.target.value);
              setShowSuggestions(true);
              if (!e.target.value.trim()) F("cliente_id", "");
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          />
          {showSuggestions && agenciaSearch.trim() && (() => {
            const q = agenciaSearch.toLowerCase();
            const matches = clientes.filter(c => c.nome_agencia.toLowerCase().includes(q));
            return matches.length > 0 ? (
              <div style={{
                position: "absolute", top: "100%", left: 0, right: 0, zIndex: 50,
                background: "#1e1f2a", border: "1px solid #3f3f46", borderRadius: 8,
                maxHeight: 160, overflowY: "auto", marginTop: 4,
              }}>
                {matches.map(c => (
                  <div key={c.id} onMouseDown={() => { F("cliente_id", c.id); setAgenciaSearch(c.nome_agencia); setShowSuggestions(false); }}
                    style={{
                      padding: "8px 12px", cursor: "pointer", fontSize: 13,
                      color: form.cliente_id === c.id ? "#3b82f6" : "#e4e4e7",
                      background: form.cliente_id === c.id ? "#3b82f614" : "transparent",
                    }}>
                    {c.nome_agencia}
                  </div>
                ))}
              </div>
            ) : null;
          })()}
        </div>
        <div><label style={labelStyle}>Conteúdos Multimédia <span style={{ color: "#ef4444" }}>*</span></label>
          <select style={inputStyle} value={form.tipo_multimedia} onChange={e => { F("tipo_multimedia", e.target.value); F("valor", valorPorTipo(e.target.value)); }}>
            {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Identificação do imóvel <span style={{ color: "#ef4444" }}>*</span></label>
          <div style={{ display: "flex", gap: 0, marginBottom: 10 }}>
            {[{ label: "ID do Anúncio", val: "id" }, { label: "Morada", val: "morada" }].map(opt => (
              <button key={opt.val} onClick={() => { setIdMode(opt.val); if (opt.val === "id") F("morada", ""); else F("id_sistema", ""); }}
                style={{
                  flex: 1, padding: "8px 0", border: "1px solid #3f3f46", background: idMode === opt.val ? "#3b82f6" : "#1e1f2a",
                  color: idMode === opt.val ? "#fff" : "#a1a1aa", fontSize: 13, fontWeight: 500, cursor: "pointer",
                  borderRadius: opt.val === "id" ? "8px 0 0 8px" : "0 8px 8px 0",
                }}>{opt.label}</button>
            ))}
          </div>
          {idMode === "id"
            ? <input style={inputStyle} value={form.id_sistema} onChange={e => F("id_sistema", e.target.value)} placeholder="Ex: 12345678" />
            : <input style={inputStyle} value={form.morada} onChange={e => F("morada", e.target.value)} placeholder="Rua…, Cidade" />
          }
        </div>
        <div><label style={labelStyle}>Local <span style={{ color: "#ef4444" }}>*</span></label><input style={inputStyle} value={form.local} onChange={e => F("local", e.target.value)} placeholder="Ex: Cascais" /></div>
        <div style={{ display: "flex", gap: 10, flexDirection: isMobile ? "column" : "row" }}>
          <button style={btnPrimary(isMobile)} onClick={save}><Check size={18} /> Guardar</button>
          <button style={btnSecondary(isMobile)} onClick={() => navigate("trabalhos")}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}

// ─── RELATÓRIOS ─────────────────────────────────────────────────────────────
function RelatoriosPage({ clientes, trabalhos, consumos, saldoMes, mesAtual, clienteNome, isMobile }) {
  const [mes, setMes] = useState(mesAtual);

  const consumosPorCliente = useMemo(() => {
    return clientes.map(c => {
      const s = saldoMes(c.id, mes);
      const trabMes = trabalhos.filter(t => t.cliente_id === c.id && consumos.some(co => co.trabalho_id === t.id && co.periodo === mes));
      return { ...c, saldo: s, trabCount: trabMes.length };
    });
  }, [clientes, mes, saldoMes, trabalhos, consumos]);

  const trabalhosPeriodo = useMemo(() => {
    return trabalhos.filter(t => (t.mes_referencia || mesAno(t.data_trabalho)) === mes).sort((a, b) => new Date(b.data_trabalho) - new Date(a.data_trabalho));
  }, [trabalhos, mes]);

  return (
    <div>
      <PageHeader title="Relatórios" isMobile={isMobile} />
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <label style={{ fontSize: 14, color: "#71717a" }}>Período:</label>
        <input type="month" style={{ ...inputStyle, width: "auto", minWidth: 160 }} value={mes} onChange={e => setMes(e.target.value)} />
      </div>

      {/* Consumo por cliente */}
      <div style={cardStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#f4f4f5" }}>Consumo — {mesLabel(mes)}</div>
        </div>
        {isMobile ? (
          consumosPorCliente.map(c => (
            <div key={c.id} style={{ padding: "12px 0", borderBottom: "1px solid #1e1f2a" }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#f4f4f5", marginBottom: 6 }}>{c.nome_agencia}</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, fontSize: 12 }}>
                {[
                  { lab: "VT", used: c.saldo.usadoVT, total: c.saldo.totalVT, rem: c.saldo.vt, warn: c.saldo.totalVT === 0 ? null : c.saldo.usadoVT < c.saldo.totalVT },
                  { lab: "Vídeo", used: c.saldo.usadoVideo, total: c.saldo.totalVideo, rem: c.saldo.video, warn: c.saldo.totalVideo === 0 ? null : c.saldo.usadoVideo < c.saldo.totalVideo },
                  { lab: "3D", used: c.saldo.usado3D, total: c.saldo.total3D, rem: c.saldo["3d"], warn: c.saldo.total3D === 0 ? null : c.saldo.usado3D < c.saldo.total3D },
                ].map(x => (
                  <div key={x.lab}>
                    <span style={{ color: "#52525b" }}>{x.lab}</span><br />
                    <span style={{ fontFamily: "'JetBrains Mono',monospace" }}>{x.used}/{x.total}</span>
                    <span style={{ color: x.warn === null ? "#52525b" : x.warn ? "#ef4444" : "#10b981", marginLeft: 4 }}>({x.rem})</span>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <ScrollTable>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, minWidth: 650 }}>
              <thead><tr>{["Agência","VT","Vídeo","3D","Saldo VT","Saldo Vid","Saldo 3D","Trab."].map((h,i) => <th key={i} style={thS}>{h}</th>)}</tr></thead>
              <tbody>{consumosPorCliente.map(c => (
                <tr key={c.id}>
                  <td style={{ ...tdS, fontWeight: 500 }}>{c.nome_agencia}</td>
                  <td style={{ ...tdS, fontFamily: "'JetBrains Mono',monospace", fontSize: 13 }}>{c.saldo.usadoVT}/{c.saldo.totalVT}</td>
                  <td style={{ ...tdS, fontFamily: "'JetBrains Mono',monospace", fontSize: 13 }}>{c.saldo.usadoVideo}/{c.saldo.totalVideo}</td>
                  <td style={{ ...tdS, fontFamily: "'JetBrains Mono',monospace", fontSize: 13 }}>{c.saldo.usado3D}/{c.saldo.total3D}</td>
                  <td style={{ ...tdS, fontFamily: "'JetBrains Mono',monospace", color: c.saldo.totalVT === 0 ? "#52525b" : c.saldo.usadoVT >= c.saldo.totalVT ? "#10b981" : "#ef4444" }}>{c.saldo.vt}</td>
                  <td style={{ ...tdS, fontFamily: "'JetBrains Mono',monospace", color: c.saldo.totalVideo === 0 ? "#52525b" : c.saldo.usadoVideo >= c.saldo.totalVideo ? "#10b981" : "#ef4444" }}>{c.saldo.video}</td>
                  <td style={{ ...tdS, fontFamily: "'JetBrains Mono',monospace", color: c.saldo.total3D === 0 ? "#52525b" : c.saldo.usado3D >= c.saldo.total3D ? "#10b981" : "#ef4444" }}>{c.saldo["3d"]}</td>
                  <td style={{ ...tdS, fontFamily: "'JetBrains Mono',monospace" }}>{c.trabCount}</td>
                </tr>
              ))}</tbody>
            </table>
          </ScrollTable>
        )}
      </div>

      {/* Trabalhos do período */}
      <div style={cardStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#f4f4f5" }}>Trabalhos — {mesLabel(mes)} ({trabalhosPeriodo.length})</div>
        </div>
        {isMobile ? (
          trabalhosPeriodo.length === 0 ? (
            <div style={{ color: "#3f3f46", fontSize: 13, padding: 20, textAlign: "center" }}>Sem trabalhos.</div>
          ) : trabalhosPeriodo.map(t => (
            <div key={t.id} style={{ padding: "10px 0", borderBottom: "1px solid #1e1f2a" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4, gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{clienteNome(t.cliente_id)}</span>
                <Badge color={ESTADO_CORES[t.estado_trabalho]}>{t.estado_trabalho}</Badge>
              </div>
              <div style={{ fontSize: 12, color: "#52525b" }}>
                {fmt(t.data_trabalho)} • {t.tipo_multimedia} • {t.morada?.slice(0, 30)}
              </div>
            </div>
          ))
        ) : (
          <ScrollTable>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, minWidth: 600 }}>
              <thead><tr>{["Data","Cliente","Morada","Tipo","Estado","Upload"].map((h,i) => <th key={i} style={thS}>{h}</th>)}</tr></thead>
              <tbody>{trabalhosPeriodo.map(t => (
                <tr key={t.id}>
                  <td style={tdS}>{fmt(t.data_trabalho)}</td>
                  <td style={{ ...tdS, fontWeight: 500 }}>{clienteNome(t.cliente_id)}</td>
                  <td style={{ ...tdS, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 13 }}>{t.morada}</td>
                  <td style={tdS}><Badge color="#3b82f6">{t.tipo_multimedia}</Badge></td>
                  <td style={tdS}><Badge color={ESTADO_CORES[t.estado_trabalho]}>{t.estado_trabalho}</Badge></td>
                  <td style={{ ...tdS, fontSize: 12 }}>{t.data_upload ? fmtDT(t.data_upload) : "—"}</td>
                </tr>
              ))}</tbody>
            </table>
          </ScrollTable>
        )}
      </div>

    </div>
  );
}

// ─── DEFINIÇÕES PAGE ─────────────────────────────────────────────────────────
function DefinicoesPage({ clientes, setClientes, trabalhos, setTrabalhos, consumos, setConsumos, sincronizarSheets, syncLoading, isMobile, showToast, user, onLogout }) {
  const sectionStyle = {
    background: "#13141b", borderRadius: 14, border: "1px solid #1e1f2a",
    padding: isMobile ? 16 : 20, marginBottom: 16,
  };
  const headingStyle = { fontSize: 15, fontWeight: 600, color: "#f4f4f5", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 };
  const btnStyle = {
    display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px",
    background: "none", border: "1px solid #27272a", borderRadius: 10,
    color: "#a1a1aa", fontSize: 13, cursor: "pointer", whiteSpace: "nowrap",
  };
  const statBox = { background: "#0c0d12", borderRadius: 10, padding: "10px 14px", flex: 1, minWidth: 100 };

  const totalClientes = clientes.length;
  const totalTrabalhos = trabalhos.length;
  const totalConsumos = consumos.length;


  return (
    <div style={{ padding: isMobile ? 16 : 24, maxWidth: 640 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: "#f4f4f5", marginBottom: 20 }}>Definições</h2>

      {/* ── CONTA ── */}
      <div style={sectionStyle}>
        <div style={headingStyle}><Users size={16} /> Conta</div>
        <div style={{ fontSize: 13, color: "#a1a1aa", marginBottom: 12 }}>{user.email}</div>
        <button onClick={() => onLogout()} style={{ ...btnStyle, color: "#ef4444", borderColor: "#7f1d1d" }}>
          <LogOut size={14} /> Terminar sessão
        </button>
      </div>

      {/* ── SINCRONIZAÇÃO ── */}
      <div style={sectionStyle}>
        <div style={headingStyle}><RefreshCw size={16} /> Sincronização</div>
        <p style={{ fontSize: 13, color: "#71717a", marginBottom: 12, lineHeight: 1.5 }}>
          Sincroniza clientes e trabalhos diretamente do Google Sheets.
        </p>
        <button onClick={sincronizarSheets} disabled={syncLoading}
          style={{ ...btnStyle, color: "#34a853", borderColor: "#1a5c2a", opacity: syncLoading ? 0.5 : 1 }}>
          <RefreshCw size={14} style={syncLoading ? { animation: "spin 1s linear infinite" } : {}} />
          {syncLoading ? "A sincronizar..." : "Sincronizar agora"}
        </button>
      </div>

      {/* ── DADOS ── */}
      <div style={sectionStyle}>
        <div style={headingStyle}><BarChart3 size={16} /> Dados</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          <div style={statBox}>
            <div style={{ fontSize: 11, color: "#52525b" }}>Clientes</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: "#f4f4f5" }}>{totalClientes}</div>
          </div>
          <div style={statBox}>
            <div style={{ fontSize: 11, color: "#52525b" }}>Trabalhos</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: "#f4f4f5" }}>{totalTrabalhos}</div>
          </div>
          <div style={statBox}>
            <div style={{ fontSize: 11, color: "#52525b" }}>Consumos</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: "#f4f4f5" }}>{totalConsumos}</div>
          </div>
        </div>
      </div>

      {/* ── BACKUP ── */}
      <div style={sectionStyle}>
        <div style={headingStyle}><Download size={16} /> Backup</div>
        <p style={{ fontSize: 13, color: "#71717a", marginBottom: 12, lineHeight: 1.5 }}>
          Exporta ou restaura todos os dados da app.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <button onClick={async () => {
            try {
              const backup = await api.exportBackup();
              const data = JSON.stringify(backup, null, 2);
              const blob = new Blob([data], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url; a.download = `idealista-backup-${new Date().toISOString().slice(0, 10)}.json`;
              a.click(); URL.revokeObjectURL(url);
            } catch (err) { showToast(err.message || "Erro ao exportar.", "error"); }
          }} style={{ ...btnStyle, color: "#3b82f6", borderColor: "#1e40af" }}>
            <Download size={14} /> Exportar JSON
          </button>
          <button onClick={() => {
            const input = document.createElement("input");
            input.type = "file"; input.accept = ".json";
            input.onchange = async (e) => {
              const file = e.target.files[0]; if (!file) return;
              try {
                const text = await file.text();
                const d = JSON.parse(text);
                if (!d.clientes || !d.trabalhos || !d.consumos) { showToast("Ficheiro inválido.", "error"); return; }
                if (!window.confirm(`Importar ${d.clientes.length} clientes, ${d.trabalhos.length} trabalhos e ${d.consumos.length} consumos? Isto substitui todos os dados atuais.`)) return;
                await api.importBackup(d);
                setClientes(d.clientes); setTrabalhos(d.trabalhos); setConsumos(d.consumos);
                showToast("Dados importados com sucesso!", "success");
              } catch { showToast("Erro ao importar.", "error"); }
            };
            input.click();
          }} style={{ ...btnStyle, color: "#8b5cf6", borderColor: "#5b21b6" }}>
            <Upload size={14} /> Importar JSON
          </button>
        </div>
      </div>

      {/* ── ZONA PERIGOSA ── */}
      <div style={{ ...sectionStyle, borderColor: "#7f1d1d33" }}>
        <div style={{ ...headingStyle, color: "#ef4444" }}><AlertTriangle size={16} /> Zona perigosa</div>
        <p style={{ fontSize: 13, color: "#71717a", marginBottom: 12, lineHeight: 1.5 }}>
          Ações irreversíveis. Usa com cuidado.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <button onClick={async () => {
            if (window.confirm("Tens a certeza? Isto apaga TODOS os dados da app (clientes, trabalhos, consumos). Esta ação não pode ser desfeita.")) {
              try {
                await api.deleteAllData();
                setClientes([]); setTrabalhos([]); setConsumos([]);
                showToast("Todos os dados apagados.", "success");
              } catch (err) { showToast(err.message || "Erro ao apagar.", "error"); }
            }
          }} style={{
            ...btnStyle, color: "#ef4444", borderColor: "#7f1d1d",
          }}>
            <Trash2 size={14} /> Apagar todos os dados
          </button>
          <button onClick={async () => {
            if (window.confirm("Isto remove todos os trabalhos mas mantém os clientes. Continuar?")) {
              try {
                // Import with empty trabalhos/consumos but keep clientes
                await api.importBackup({ clientes, trabalhos: [], consumos: [] });
                setTrabalhos([]); setConsumos([]);
                showToast("Trabalhos apagados.", "success");
              } catch (err) { showToast(err.message || "Erro ao apagar.", "error"); }
            }
          }} style={{
            ...btnStyle, color: "#f59e0b", borderColor: "#78350f",
          }}>
            <Trash2 size={14} /> Apagar só trabalhos
          </button>
          <button onClick={async () => {
            if (window.confirm("Isto remove todos os clientes mas mantém os trabalhos. Continuar?")) {
              try {
                await api.importBackup({ clientes: [], trabalhos, consumos });
                setClientes([]);
                showToast("Clientes apagados.", "success");
              } catch (err) { showToast(err.message || "Erro ao apagar.", "error"); }
            }
          }} style={{
            ...btnStyle, color: "#f59e0b", borderColor: "#78350f",
          }}>
            <Trash2 size={14} /> Apagar só clientes
          </button>
        </div>
      </div>
    </div>
  );
}
