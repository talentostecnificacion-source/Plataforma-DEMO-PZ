import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  LayoutGrid, Users, Swords, Dumbbell, BookOpen, Settings, Calendar,
  BarChart3, Search, ChevronRight, Plus, X, Trash2, Save, Edit3,
  AlertTriangle, TrendingUp, TrendingDown, Minus, Menu, ChevronLeft,
  Shield, Target, Activity, Clock, MapPin, Star, Eye, Printer,
  FileText, Brain, Zap, ClipboardList
} from "lucide-react";

/* ============================================================
   PZ · Puntualización Zonal — Plataforma de gestión de equipo
   Tokens de diseño
   navy      #0B1F3A  estructural
   navy2     #142A4E  superficies oscuras
   red       #E63946  énfasis
   green     #2A9D5C  campo / positivo
   yellow    #F4B400  advertencia / amarillas
   redLight  #FF6B6B  incidencias / negativo
   bg        #F5F7FA  fondo
   ============================================================ */

const T = {
  navy: "#0B1F3A", navy2: "#142A4E", navy3: "#1D3A66",
  red: "#E63946", green: "#2A9D5C", yellow: "#F4B400",
  redLight: "#FF6B6B", bg: "#F5F7FA", surface: "#FFFFFF",
  text: "#141C2B", muted: "#5B6B82", line: "#E4E8EF",
};

const uid = () => Math.random().toString(36).slice(2, 10);
const todayISO = () => new Date().toISOString().slice(0, 10);
const calcAge = (dob) => {
  if (!dob) return "-";
  const d = new Date(dob), n = new Date();
  let a = n.getFullYear() - d.getFullYear();
  if (n.getMonth() < d.getMonth() || (n.getMonth() === d.getMonth() && n.getDate() < d.getDate())) a--;
  return a;
};

/* ---------------- Default config & demo data ---------------- */

const DEFAULT_CONFIG = {
  teamName: "CD Puntualización Zonal",
  category: "Juvenil A",
  season: "2026/2027",
  footballType: "Fútbol 11",
  colors: { primary: T.navy, accent: T.red },
  positions: ["Portero", "Defensa Central", "Lateral Derecho", "Lateral Izquierdo",
    "Mediocentro Defensivo", "Mediocentro", "Mediocentro Ofensivo",
    "Extremo Derecho", "Extremo Izquierdo", "Delantero Centro"],
  tacticalSystems: {
    "Fútbol 11": ["1-4-3-3", "1-4-4-2", "1-4-2-3-1", "1-3-5-2", "1-3-4-3"],
    "Fútbol 8": ["1-3-2-2", "1-3-3-1", "1-2-3-2", "1-2-2-3"],
  },
  trainingTypes: ["Físico", "Técnico", "Táctico", "Estratégico", "Psicológico"],
  foundations: {
    "Físicos": ["Resistencia", "Fuerza", "Velocidad", "Potencia", "Agilidad", "Coordinación", "Movilidad", "Recuperación"],
    "Técnicos": ["Control", "Conducción", "Regate", "Pase", "Golpeo", "Remate", "Juego aéreo", "Protección del balón", "Dominio del balón"],
    "Tácticos": ["Ataque", "Defensa", "Transición ofensiva", "Transición defensiva", "Balón parado ofensivo", "Balón parado defensivo"],
    "Psicológicos": ["Concentración", "Comunicación", "Cohesión", "Motivación", "Responsabilidad", "Toma de decisiones", "Actitud"],
  },
  playerStates: ["Disponible", "Lesionado", "Sancionado", "Baja", "Otro"],
  taskCategories: ["Calentamiento", "Técnica", "Táctica", "Físico", "Juego reducido", "Estrategia"],
  rankingWeights: { valoracion: 40, goles: 15, asistencias: 15, asistenciaEntreno: 20, tarjetas: -10 },
  customFields: [],
};

const DEMO_PLAYERS = [
  { nombre: "Álvaro Ruiz Gómez", apodo: "Álvaro", numero: 1, posicion: "Portero", secundarias: [], dob: "2008-03-12", pie: "Diestro", altura: 183, peso: 76, estado: "Disponible" },
  { nombre: "Mario Castillo Peña", apodo: "Mario", numero: 4, posicion: "Defensa Central", secundarias: ["Mediocentro Defensivo"], dob: "2008-06-02", pie: "Zurdo", altura: 181, peso: 74, estado: "Disponible" },
  { nombre: "Diego Herrera Soto", apodo: "Diego", numero: 5, posicion: "Defensa Central", secundarias: [], dob: "2007-11-20", pie: "Diestro", altura: 186, peso: 79, estado: "Sancionado" },
  { nombre: "Iván Molina Lara", apodo: "Iván", numero: 2, posicion: "Lateral Derecho", secundarias: ["Extremo Derecho"], dob: "2008-01-15", pie: "Diestro", altura: 174, peso: 68, estado: "Disponible" },
  { nombre: "Pablo Navarro Ríos", apodo: "Pablo", numero: 3, posicion: "Lateral Izquierdo", secundarias: [], dob: "2008-09-08", pie: "Zurdo", altura: 176, peso: 70, estado: "Disponible" },
  { nombre: "Hugo Delgado Vidal", apodo: "Hugo", numero: 6, posicion: "Mediocentro Defensivo", secundarias: ["Defensa Central"], dob: "2007-07-30", pie: "Diestro", altura: 178, peso: 72, estado: "Lesionado" },
  { nombre: "Marcos Ferrer Nuño", apodo: "Marcos", numero: 8, posicion: "Mediocentro", secundarias: ["Mediocentro Ofensivo"], dob: "2008-04-18", pie: "Diestro", altura: 175, peso: 69, estado: "Disponible" },
  { nombre: "Nico Ortega Blas", apodo: "Nico", numero: 10, posicion: "Mediocentro Ofensivo", secundarias: ["Extremo Izquierdo"], dob: "2008-02-25", pie: "Zurdo", altura: 172, peso: 66, estado: "Disponible" },
  { nombre: "Bruno Salas Marín", apodo: "Bruno", numero: 7, posicion: "Extremo Derecho", secundarias: [], dob: "2009-05-11", pie: "Diestro", altura: 170, peso: 63, estado: "Disponible" },
  { nombre: "Rubén Campos Iglesias", apodo: "Rubén", numero: 11, posicion: "Extremo Izquierdo", secundarias: [], dob: "2008-08-03", pie: "Zurdo", altura: 173, peso: 65, estado: "Disponible" },
  { nombre: "Adrián Vega Torres", apodo: "Adrián", numero: 9, posicion: "Delantero Centro", secundarias: [], dob: "2007-12-14", pie: "Diestro", altura: 182, peso: 75, estado: "Disponible" },
  { nombre: "Leo Aranda Cid", apodo: "Leo", numero: 13, posicion: "Portero", secundarias: [], dob: "2009-01-09", pie: "Diestro", altura: 180, peso: 73, estado: "Disponible" },
];

function buildDemoPlayers() {
  return DEMO_PLAYERS.map((p) => ({
    id: uid(),
    nombre: p.nombre, apodo: p.apodo, numero: p.numero,
    posicion: p.posicion, secundarias: p.secundarias,
    categoria: DEFAULT_CONFIG.category, dob: p.dob, pie: p.pie,
    altura: p.altura, peso: p.peso, estado: p.estado,
    fechaIncorporacion: "2026-07-01", observaciones: "",
    manualRating: null,
    stats: {
      convocatorias: Math.floor(Math.random() * 10) + 3,
      titular: Math.floor(Math.random() * 8) + 1,
      suplente: Math.floor(Math.random() * 4),
      minutos: Math.floor(Math.random() * 800) + 100,
      goles: p.posicion.includes("Delantero") || p.posicion.includes("Extremo") ? Math.floor(Math.random() * 8) : Math.floor(Math.random() * 2),
      asistencias: Math.floor(Math.random() * 5),
      amarillas: Math.floor(Math.random() * 4),
      rojas: Math.random() > 0.9 ? 1 : 0,
      valoraciones: Array.from({ length: 6 }, () => +(5.5 + Math.random() * 3.5).toFixed(1)),
      entrenamientosRealizados: Math.floor(Math.random() * 20) + 10,
      entrenamientosTotales: 24,
    },
    custom: {},
  }));
}

function buildDemoMatches(players) {
  const rivales = ["CF Montealto", "UD San Rafael", "Atlético Vega", "Real Costa", "EF Norte"];
  return rivales.slice(0, 4).map((rival, i) => {
    const gf = Math.floor(Math.random() * 4);
    const gc = Math.floor(Math.random() * 3);
    return {
      id: uid(),
      fecha: `2026-0${9 + i}-1${i}`,
      competicion: "Liga Regional",
      jornada: i + 1,
      rival, esLocal: i % 2 === 0,
      campo: i % 2 === 0 ? "Campo Municipal PZ" : `Campo de ${rival}`,
      resultadoDescanso: `${Math.floor(gf / 2)}-${Math.floor(gc / 2)}`,
      resultadoFinal: `${gf}-${gc}`,
      tipoFutbol: "Fútbol 11",
      sistema: "1-4-3-3",
      convocatoria: players.slice(0, 16).map((p) => ({ jugadorId: p.id, estado: ["Titular", "Titular", "Suplente"][Math.floor(Math.random() * 3)] })),
      cambios: [], goles: [], tarjetas: [],
      tactica: { modelo: "Presión alta y salida en corto", funciono: "Circulación en primera fase", noFunciono: "Pérdida de profundidad en banda", ajustes: "Cambio a 1-4-4-2 en el minuto 60" },
      rendimiento: {
        ataque: 7, defensa: 6, transicionOfensiva: 7, transicionDefensiva: 6,
        balonParadoOfensivo: 5, balonParadoDefensivo: 6,
        fortalezas: "Buena presión tras pérdida", debilidades: "Concesión de espacios a la espalda",
      },
      aprendizajes: { mantener: "Intensidad en el presing", corregir: "Cobertura defensiva en transición", trabajar: "Salida de balón bajo presión" },
      observaciones: "Buen partido en líneas generales. Revisar bloque medio para el próximo encuentro.",
    };
  });
}

function buildDemoTrainings() {
  return Array.from({ length: 5 }, (_, i) => ({
    id: uid(),
    fecha: `2026-08-${10 + i}`, hora: "19:00", lugar: "Campo Municipal PZ",
    duracion: 90, numJugadores: 20,
    objetivoGeneral: "Mejorar la circulación de balón en fase de construcción",
    objetivos: { fisicos: "Resistencia aeróbica", tecnicos: "Pase y control orientado", tacticos: "Salida de balón en 3 líneas", estrategicos: "", psicologicos: "Comunicación entre líneas" },
    calentamiento: { actividad: "Movilidad articular + rondos 4v1", objetivo: "Activación y primer contacto con el balón", materiales: "Conos, petos", tiempo: 15, notas: "" },
    tareas: [{ id: uid(), nombre: "Rondo posicional 6v3", codigo: "TEC-04", objetivo: "Conservación de balón", fundamento: "Pase, control orientado", materiales: "Conos, petos", tiempo: 20, jugadores: 9, espacio: "15x15m", reglas: "2 toques máximo", organizacion: "Círculo con 3 defensores centrales", descripcion: "Rondo con apoyos exteriores", notas: "" }],
    aplicacionJuego: { tipo: "Juego reducido", objetivo: "Transición ofensiva rápida", tiempo: 25, observaciones: "8v8 en campo reducido con transiciones" },
    vueltaCalma: { estiramientos: "Estiramiento global", actividad: "Movilidad pasiva", tiempo: 10, observaciones: "" },
    notas: "Sesión ficticia de demostración.",
    asistencia: [],
  }));
}

function buildDemoRivals() {
  return [
    { id: uid(), nombre: "CF Montealto", sistemas: "1-4-4-2", fortalezas: "Juego aéreo en balón parado, laterales ofensivos", debilidades: "Pérdida de intensidad tras el minuto 70", jugadoresRelevantes: "9 - Delantero centro, referencia física", ofensivo: "Ataques directos por banda derecha", defensivo: "Línea de 4 alta con fuera de juego provocado", transiciones: "Rápidas al espacio tras robo", balonParado: "Central alto en córners, primer palo", observaciones: "Suelen presionar arriba en el saque de puerta.", historial: "1 enfrentamiento previo: victoria 2-1." },
    { id: uid(), nombre: "UD San Rafael", sistemas: "1-4-3-3", fortalezas: "Posesión y circulación en campo propio", debilidades: "Vulnerable a la presión alta tras pérdida", jugadoresRelevantes: "10 - Mediocentro organizador", ofensivo: "Construcción en corto desde portero", defensivo: "Bloque medio, presión por zonas", transiciones: "Lentas, priorizan la posesión", balonParado: "Jugadas ensayadas de córner al segundo palo", observaciones: "Rival exigente técnicamente, cuidar pérdidas en salida.", historial: "Sin enfrentamientos previos." },
  ];
}

function buildDemoSeason() {
  return {
    equipo: DEFAULT_CONFIG.teamName, categoria: DEFAULT_CONFIG.category, competicion: "Liga Regional Juvenil",
    fechaInicio: "2026-08-01", fechaFin: "2027-06-15",
    objetivosGenerales: "Consolidar un modelo de juego propio basado en la posesión con propósito y la presión coordinada tras pérdida.",
    objetivosDeportivos: "Finalizar entre los 3 primeros puestos de la categoría.",
    objetivosFormativos: "Desarrollar la toma de decisiones individual y la polivalencia posicional de los jugadores.",
    weeks: Array.from({ length: 4 }, (_, i) => ({
      id: uid(), numero: i + 1, fechaInicio: `2026-08-${String(4 + i * 7).padStart(2, "0")}`,
      objetivo: ["Adaptación física inicial", "Introducción del modelo de juego", "Consolidación de la fase ofensiva", "Trabajo de fase defensiva y transiciones"][i],
      contenidoFisico: "Resistencia aeróbica de base", contenidoTecnico: "Pase y control orientado",
      contenidoTactico: "Salida de balón en tres líneas", contenidoPsicologico: "Cohesión grupal",
      cargaPrevista: ["Media", "Media-alta", "Alta", "Media"][i],
    })),
  };
}

const DEFAULT_PLANNING = {
  fisica: [
    { id: uid(), fecha: "2026-08-10", capacidad: "Resistencia", carga: 6, observaciones: "Trabajo aeróbico de base, semana de adaptación." },
    { id: uid(), fecha: "2026-08-17", capacidad: "Velocidad", carga: 7, observaciones: "Series cortas con cambios de dirección." },
  ],
  tecnica: [
    { id: uid(), fundamento: "Pase", objetivo: "Mejorar precisión en pase largo", nivelActual: 6, nivelObjetivo: 8, tareas: "Rondo posicional 6v3", evolucion: [6, 6.4, 6.8] },
    { id: uid(), fundamento: "Remate", objetivo: "Definición dentro del área", nivelActual: 5, nivelObjetivo: 7, tareas: "Finalización tras centro", evolucion: [5, 5.3, 5.6] },
  ],
  tactica: [
    { id: uid(), nombre: "Salida de balón 1-4-3-3", sistema: "1-4-3-3", modelo: "Posesión con propósito", principios: "Amplitud, profundidad, apoyos", fase: "Ofensiva", faseOfensiva: "Construcción en 3 líneas", faseDefensiva: "Presión media-alta por zonas", transiciones: "Recuperación inmediata (5s)", balonParado: "Córner al primer palo", comportamientos: "Basculación coordinada de línea defensiva", slots: [] },
  ],
  psicologica: [
    { id: uid(), fecha: "2026-08-12", area: "Cohesión", observaciones: "Dinámica grupal en pretemporada, buena respuesta del grupo." },
  ],
};

const DEMO_TASKS = [
  { id: uid(), nombre: "Rondo posicional 6v3", codigo: "TEC-04", categoria: "Técnica", edad: "Juvenil", minJugadores: 9, maxJugadores: 9, espacio: "15x15m", duracion: 20, objFisico: "Resistencia", objTecnico: "Pase, control orientado", objTactico: "Conservación", objPsicologico: "Comunicación", materiales: "Conos, petos", descripcion: "Rondo con 6 jugadores exteriores y 3 defensores en el centro.", reglas: "2 toques máximo", variantes: "1 toque libre por jugador", progresiones: "Reducir espacio", regresiones: "Ampliar espacio", observaciones: "" },
  { id: uid(), nombre: "Presión tras pérdida 8v8", codigo: "TAC-11", categoria: "Táctica", edad: "Juvenil/Senior", minJugadores: 16, maxJugadores: 16, espacio: "40x30m", duracion: 20, objFisico: "Potencia", objTecnico: "Entrada, cobertura", objTactico: "Transición ofensiva/defensiva", objPsicologico: "Toma de decisiones", materiales: "Conos, petos, porterías", descripcion: "Juego 8v8 con objetivo de recuperación en menos de 5 segundos tras pérdida.", reglas: "Recuperar en 5s o el rival juega libre", variantes: "Zonas de recuperación", progresiones: "Reducir tiempo de recuperación", regresiones: "Ampliar tiempo", observaciones: "" },
  { id: uid(), nombre: "Circuito de velocidad y cambios de ritmo", codigo: "FIS-02", categoria: "Físico", edad: "Todas", minJugadores: 4, maxJugadores: 20, espacio: "30m lineales", duracion: 15, objFisico: "Velocidad, agilidad", objTecnico: "", objTactico: "", objPsicologico: "Concentración", materiales: "Conos, vallas", descripcion: "Circuito de esprines con cambios de dirección.", reglas: "Series de 4x30m", variantes: "Con balón", progresiones: "Añadir resistencia", regresiones: "Reducir series", observaciones: "" },
];

/* ---------------- Storage helpers ---------------- */

/* Almacenamiento local del navegador (localStorage).
   Cada dispositivo (móvil, tablet, ordenador) guarda su propia copia. */
async function loadKey(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.error("storage read error", key, e);
    return fallback;
  }
}
async function saveKey(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("storage write error", key, e);
  }
}

/* ---------------- Small UI atoms ---------------- */

function PitchDivider({ color = T.red }) {
  return (
    <div className="h-[3px] w-full rounded-full" style={{
      background: `repeating-linear-gradient(115deg, ${color} 0px, ${color} 14px, transparent 14px, transparent 24px)`,
    }} />
  );
}

function Eyebrow({ children }) {
  return <div className="text-[11px] font-bold tracking-[0.18em] uppercase" style={{ color: T.red }}>{children}</div>;
}

function Card({ children, className = "", style = {} }) {
  return <div className={`bg-white rounded-2xl border ${className}`} style={{ borderColor: T.line, ...style }}>{children}</div>;
}

function StatTile({ label, value, sub, accent = T.navy, icon: Icon }) {
  return (
    <Card className="p-4 flex flex-col gap-2 min-w-0">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold tracking-wide uppercase" style={{ color: T.muted }}>{label}</span>
        {Icon && <Icon size={16} style={{ color: accent }} />}
      </div>
      <div className="text-2xl font-extrabold tabular-nums" style={{ color: T.navy }}>{value}</div>
      {sub && <div className="text-xs" style={{ color: T.muted }}>{sub}</div>}
    </Card>
  );
}

function Pill({ children, color = T.navy, bg = "#EEF2F8" }) {
  return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold" style={{ color, background: bg }}>{children}</span>;
}

function stateColor(estado) {
  switch (estado) {
    case "Disponible": return { color: T.green, bg: "#E7F6ED" };
    case "Lesionado": return { color: T.redLight, bg: "#FFECEC" };
    case "Sancionado": return { color: T.yellow, bg: "#FFF6DE" };
    case "Baja": return { color: T.muted, bg: "#EEF1F5" };
    default: return { color: T.navy3, bg: "#EEF2F8" };
  }
}

function Field({ label, children, className = "" }) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      <span className="text-xs font-bold uppercase tracking-wide" style={{ color: T.muted }}>{label}</span>
      {children}
    </label>
  );
}

const inputCls = "w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 transition";
const inputStyle = { borderColor: T.line, "--tw-ring-color": T.navy3 };

function TextInput(props) {
  return <input {...props} className={`${inputCls} ${props.className || ""}`} style={{ ...inputStyle, ...(props.style || {}) }} />;
}
function TextArea(props) {
  return <textarea {...props} className={`${inputCls} ${props.className || ""}`} style={{ ...inputStyle, minHeight: 72, ...(props.style || {}) }} />;
}
function Select({ children, ...props }) {
  return <select {...props} className={`${inputCls} bg-white ${props.className || ""}`} style={{ ...inputStyle, ...(props.style || {}) }}>{children}</select>;
}

function Btn({ children, onClick, variant = "primary", icon: Icon, className = "", type = "button", disabled }) {
  const styles = {
    primary: { background: T.navy, color: "#fff" },
    accent: { background: T.red, color: "#fff" },
    ghost: { background: "transparent", color: T.navy, border: `1px solid ${T.line}` },
    danger: { background: "#FFECEC", color: T.redLight },
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-bold transition active:scale-[0.97] disabled:opacity-40 ${className}`}
      style={styles[variant]}>
      {Icon && <Icon size={15} />}{children}
    </button>
  );
}

function Modal({ title, onClose, children, wide }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4">
      <div className={`bg-white w-full ${wide ? "sm:max-w-3xl" : "sm:max-w-lg"} sm:rounded-2xl rounded-t-2xl max-h-[92vh] flex flex-col`}>
        <div className="flex items-center justify-between px-5 py-4 border-b shrink-0" style={{ borderColor: T.line }}>
          <h3 className="font-extrabold text-lg" style={{ color: T.navy }}>{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100"><X size={18} /></button>
        </div>
        <div className="overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </div>
  );
}

function Trend({ values }) {
  if (!values || values.length < 2) return <Minus size={14} style={{ color: T.muted }} />;
  const diff = values[values.length - 1] - values[values.length - 2];
  if (diff > 0.15) return <TrendingUp size={14} style={{ color: T.green }} />;
  if (diff < -0.15) return <TrendingDown size={14} style={{ color: T.redLight }} />;
  return <Minus size={14} style={{ color: T.muted }} />;
}

/* ============================================================
   APP
   ============================================================ */

const NAV = [
  { key: "dashboard", label: "Panel de control", icon: LayoutGrid },
  { key: "plantilla", label: "Plantilla", icon: Users },
  { key: "partidos", label: "Partidos", icon: Swords },
  { key: "entrenamientos", label: "Entrenamientos", icon: Dumbbell },
  { key: "tareas", label: "Biblioteca de tareas", icon: BookOpen },
  { key: "rival", label: "Análisis del rival", icon: Eye },
  { key: "temporada", label: "Temporada", icon: Target },
  { key: "planificacion", label: "Planificación", icon: Brain },
  { key: "calendario", label: "Calendario", icon: Calendar },
  { key: "estadisticas", label: "Estadísticas", icon: BarChart3 },
  { key: "informes", label: "Informes", icon: FileText },
  { key: "configuracion", label: "Configuración", icon: Settings },
];

export default function App() {
  const [loaded, setLoaded] = useState(false);
  const [view, setView] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [players, setPlayers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [trainings, setTrainings] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [rivals, setRivals] = useState([]);
  const [season, setSeason] = useState(null);
  const [planning, setPlanning] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      const [c, p, m, t, tk, rv, se, pl2] = await Promise.all([
        loadKey("pz-config", null),
        loadKey("pz-players", null),
        loadKey("pz-matches", null),
        loadKey("pz-trainings", null),
        loadKey("pz-tasks", null),
        loadKey("pz-rivals", null),
        loadKey("pz-season", null),
        loadKey("pz-planning", null),
      ]);
      if (c) setConfig(c); 
      let pl = p;
      if (!pl) { pl = buildDemoPlayers(); await saveKey("pz-players", pl); }
      setPlayers(pl);
      let mt = m;
      if (!mt) { mt = buildDemoMatches(pl); await saveKey("pz-matches", mt); }
      setMatches(mt);
      let tr = t;
      if (!tr) { tr = buildDemoTrainings(); await saveKey("pz-trainings", tr); }
      setTrainings(tr);
      let tks = tk;
      if (!tks) { tks = DEMO_TASKS; await saveKey("pz-tasks", tks); }
      setTasks(tks);
      let rvv = rv;
      if (!rvv) { rvv = buildDemoRivals(); await saveKey("pz-rivals", rvv); }
      setRivals(rvv);
      let sev = se;
      if (!sev) { sev = buildDemoSeason(); await saveKey("pz-season", sev); }
      setSeason(sev);
      let plv = pl2;
      if (!plv) { plv = DEFAULT_PLANNING; await saveKey("pz-planning", plv); }
      setPlanning(plv);
      if (!c) await saveKey("pz-config", DEFAULT_CONFIG);
      setLoaded(true);
    })();
  }, []);

  // persistence wrappers
  const updatePlayers = useCallback((updater) => {
    setPlayers((prev) => { const next = typeof updater === "function" ? updater(prev) : updater; saveKey("pz-players", next); return next; });
  }, []);
  const updateMatches = useCallback((updater) => {
    setMatches((prev) => { const next = typeof updater === "function" ? updater(prev) : updater; saveKey("pz-matches", next); return next; });
  }, []);
  const updateTrainings = useCallback((updater) => {
    setTrainings((prev) => { const next = typeof updater === "function" ? updater(prev) : updater; saveKey("pz-trainings", next); return next; });
  }, []);
  const updateTasks = useCallback((updater) => {
    setTasks((prev) => { const next = typeof updater === "function" ? updater(prev) : updater; saveKey("pz-tasks", next); return next; });
  }, []);
  const updateConfig = useCallback((updater) => {
    setConfig((prev) => { const next = typeof updater === "function" ? updater(prev) : updater; saveKey("pz-config", next); return next; });
  }, []);
  const updateRivals = useCallback((updater) => {
    setRivals((prev) => { const next = typeof updater === "function" ? updater(prev) : updater; saveKey("pz-rivals", next); return next; });
  }, []);
  const updateSeason = useCallback((updater) => {
    setSeason((prev) => { const next = typeof updater === "function" ? updater(prev) : updater; saveKey("pz-season", next); return next; });
  }, []);
  const updatePlanning = useCallback((updater) => {
    setPlanning((prev) => { const next = typeof updater === "function" ? updater(prev) : updater; saveKey("pz-planning", next); return next; });
  }, []);

  const ctx = { config, updateConfig, players, updatePlayers, matches, updateMatches, trainings, updateTrainings, tasks, updateTasks,
    rivals, updateRivals, season, updateSeason, planning, updatePlanning };

  const [selectedPlayerId, setSelectedPlayerId] = useState(null);

  const globalResults = useMemo(() => {
    if (!search.trim()) return null;
    const q = search.toLowerCase();
    return {
      jugadores: players.filter(p => p.nombre.toLowerCase().includes(q) || p.apodo.toLowerCase().includes(q)),
      partidos: matches.filter(m => m.rival.toLowerCase().includes(q) || (m.observaciones || "").toLowerCase().includes(q)),
      entrenamientos: trainings.filter(t => (t.objetivoGeneral || "").toLowerCase().includes(q) || (t.notas || "").toLowerCase().includes(q)),
      tareas: tasks.filter(t => t.nombre.toLowerCase().includes(q) || t.codigo.toLowerCase().includes(q)),
    };
  }, [search, players, matches, trainings, tasks]);

  if (!loaded) {
    return (
      <div className="h-screen w-full flex items-center justify-center" style={{ background: T.navy }}>
        <div className="flex flex-col items-center gap-3">
          <Shield size={40} style={{ color: T.red }} />
          <div className="text-white font-extrabold tracking-widest text-sm uppercase">Cargando plataforma PZ…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex overflow-hidden" style={{ background: T.bg, color: T.text, fontFamily: "ui-sans-serif, system-ui, -apple-system, sans-serif" }}>
      {/* Sidebar */}
      <aside className={`fixed sm:static z-40 h-full flex flex-col shrink-0 transition-transform duration-200 ${sidebarOpen ? "translate-x-0" : "-translate-x-full sm:translate-x-0"}`}
        style={{ width: 240, background: T.navy }}>
        <div className="px-5 py-5 flex items-center gap-2.5 border-b border-white/10">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center font-black text-sm shrink-0" style={{ background: T.red, color: "#fff" }}>PZ</div>
          <div className="min-w-0">
            <div className="text-white font-extrabold text-sm leading-tight truncate">{config.teamName}</div>
            <div className="text-white/50 text-[11px] font-semibold">{config.season}</div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-3 px-2.5 flex flex-col gap-1">
          {NAV.map((n) => {
            const active = view === n.key;
            return (
              <button key={n.key} onClick={() => { setView(n.key); setSidebarOpen(false); setSelectedPlayerId(null); }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition text-left"
                style={{ background: active ? T.red : "transparent", color: active ? "#fff" : "rgba(255,255,255,0.65)" }}>
                <n.icon size={17} />{n.label}
              </button>
            );
          })}
        </nav>
        <div className="px-4 py-4 border-t border-white/10 text-[11px] text-white/40 font-semibold uppercase tracking-wide">
          {config.category} · {config.footballType}
        </div>
      </aside>
      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-30 sm:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="flex items-center gap-3 px-4 sm:px-6 py-3 bg-white border-b shrink-0" style={{ borderColor: T.line }}>
          <button className="sm:hidden p-1.5" onClick={() => setSidebarOpen(true)}><Menu size={20} /></button>
          <div className="relative flex-1 max-w-md">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: T.muted }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar jugadores, partidos, tareas…"
              className="w-full rounded-xl border pl-9 pr-3 py-2 text-sm outline-none" style={{ borderColor: T.line }} />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {globalResults ? (
            <GlobalSearchResults results={globalResults} onClear={() => setSearch("")} />
          ) : view === "dashboard" ? (
            <Dashboard ctx={ctx} goto={setView} />
          ) : view === "plantilla" ? (
            selectedPlayerId ? (
              <PlayerDetail ctx={ctx} playerId={selectedPlayerId} onBack={() => setSelectedPlayerId(null)} />
            ) : (
              <Plantilla ctx={ctx} onSelect={setSelectedPlayerId} />
            )
          ) : view === "partidos" ? (
            <Partidos ctx={ctx} />
          ) : view === "entrenamientos" ? (
            <Entrenamientos ctx={ctx} />
          ) : view === "tareas" ? (
            <Tareas ctx={ctx} />
          ) : view === "calendario" ? (
            <CalendarioView ctx={ctx} />
          ) : view === "estadisticas" ? (
            <Estadisticas ctx={ctx} />
          ) : view === "rival" ? (
            <RivalModule ctx={ctx} />
          ) : view === "temporada" ? (
            <TemporadaModule ctx={ctx} />
          ) : view === "planificacion" ? (
            <PlanificacionModule ctx={ctx} />
          ) : view === "informes" ? (
            <InformesModule ctx={ctx} />
          ) : view === "configuracion" ? (
            <Configuracion ctx={ctx} />
          ) : null}
        </main>
      </div>
    </div>
  );
}

/* ============================================================
   DASHBOARD
   ============================================================ */

function computeTeamStats(matches) {
  let v = 0, e = 0, d = 0, gf = 0, gc = 0;
  matches.forEach((m) => {
    const [a, b] = (m.resultadoFinal || "0-0").split("-").map(Number);
    gf += a || 0; gc += b || 0;
    if (a > b) v++; else if (a === b) e++; else d++;
  });
  return { v, e, d, gf, gc, jugados: matches.length };
}

function Dashboard({ ctx, goto }) {
  const { config, players, matches, trainings } = ctx;
  const teamStats = useMemo(() => computeTeamStats(matches), [matches]);
  const disponibles = players.filter((p) => p.estado === "Disponible").length;
  const lesionados = players.filter((p) => p.estado === "Lesionado").length;
  const sancionados = players.filter((p) => p.estado === "Sancionado").length;
  const amarillas = players.reduce((s, p) => s + p.stats.amarillas, 0);
  const rojas = players.reduce((s, p) => s + p.stats.rojas, 0);
  const avgRating = players.length ? (players.reduce((s, p) => s + (p.manualRating ?? avgLast(p.stats.valoraciones)), 0) / players.length).toFixed(1) : "-";

  const sortedMatches = [...matches].sort((a, b) => a.fecha.localeCompare(b.fecha));
  const lastMatch = sortedMatches[sortedMatches.length - 1];
  const sortedTrainings = [...trainings].sort((a, b) => a.fecha.localeCompare(b.fecha));
  const nextTraining = sortedTrainings[sortedTrainings.length - 1];

  return (
    <div className="flex flex-col gap-6 max-w-6xl">
      <div>
        <Eyebrow>Panel de control</Eyebrow>
        <div className="flex items-baseline gap-3 flex-wrap">
          <h1 className="text-2xl sm:text-3xl font-extrabold" style={{ color: T.navy }}>{config.teamName}</h1>
          <Pill color={T.navy} bg="#EEF2F8">{config.category}</Pill>
          <Pill color={T.red} bg="#FCEAEC">{config.season}</Pill>
        </div>
        <div className="mt-3"><PitchDivider /></div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatTile label="Jugadores" value={players.length} icon={Users} sub={`${disponibles} disponibles`} />
        <StatTile label="Partidos jugados" value={teamStats.jugados} icon={Swords} />
        <StatTile label="Sesiones" value={trainings.length} icon={Dumbbell} />
        <StatTile label="Valoración media" value={avgRating} icon={Star} accent={T.yellow} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="p-4">
          <Eyebrow>Récord</Eyebrow>
          <div className="flex items-end gap-4 mt-2">
            <div><div className="text-2xl font-extrabold" style={{ color: T.green }}>{teamStats.v}</div><div className="text-[11px] font-bold uppercase" style={{ color: T.muted }}>Victorias</div></div>
            <div><div className="text-2xl font-extrabold" style={{ color: T.yellow }}>{teamStats.e}</div><div className="text-[11px] font-bold uppercase" style={{ color: T.muted }}>Empates</div></div>
            <div><div className="text-2xl font-extrabold" style={{ color: T.redLight }}>{teamStats.d}</div><div className="text-[11px] font-bold uppercase" style={{ color: T.muted }}>Derrotas</div></div>
          </div>
        </Card>
        <Card className="p-4">
          <Eyebrow>Goles</Eyebrow>
          <div className="flex items-end gap-4 mt-2">
            <div><div className="text-2xl font-extrabold" style={{ color: T.navy }}>{teamStats.gf}</div><div className="text-[11px] font-bold uppercase" style={{ color: T.muted }}>A favor</div></div>
            <div><div className="text-2xl font-extrabold" style={{ color: T.navy }}>{teamStats.gc}</div><div className="text-[11px] font-bold uppercase" style={{ color: T.muted }}>En contra</div></div>
            <div><div className="text-2xl font-extrabold" style={{ color: T.navy }}>{teamStats.gf - teamStats.gc >= 0 ? "+" : ""}{teamStats.gf - teamStats.gc}</div><div className="text-[11px] font-bold uppercase" style={{ color: T.muted }}>Diferencia</div></div>
          </div>
        </Card>
        <Card className="p-4">
          <Eyebrow>Disciplina</Eyebrow>
          <div className="flex items-end gap-4 mt-2">
            <div><div className="text-2xl font-extrabold" style={{ color: T.yellow }}>{amarillas}</div><div className="text-[11px] font-bold uppercase" style={{ color: T.muted }}>Amarillas</div></div>
            <div><div className="text-2xl font-extrabold" style={{ color: T.redLight }}>{rojas}</div><div className="text-[11px] font-bold uppercase" style={{ color: T.muted }}>Rojas</div></div>
            <div><div className="text-2xl font-extrabold" style={{ color: T.navy }}>{lesionados + sancionados}</div><div className="text-[11px] font-bold uppercase" style={{ color: T.muted }}>No disponibles</div></div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Card className="p-4">
          <Eyebrow>Último partido</Eyebrow>
          {lastMatch ? (
            <div className="mt-2">
              <div className="font-extrabold" style={{ color: T.navy }}>{config.teamName} {lastMatch.resultadoFinal} {lastMatch.rival}</div>
              <div className="text-xs mt-1" style={{ color: T.muted }}>{lastMatch.fecha} · Jornada {lastMatch.jornada} · {lastMatch.competicion}</div>
              <button onClick={() => goto("partidos")} className="text-xs font-bold mt-2 flex items-center gap-1" style={{ color: T.red }}>Ver partidos <ChevronRight size={14} /></button>
            </div>
          ) : <div className="text-sm mt-2" style={{ color: T.muted }}>Sin partidos registrados.</div>}
        </Card>
        <Card className="p-4">
          <Eyebrow>Próxima / última sesión</Eyebrow>
          {nextTraining ? (
            <div className="mt-2">
              <div className="font-extrabold" style={{ color: T.navy }}>{nextTraining.objetivoGeneral}</div>
              <div className="text-xs mt-1" style={{ color: T.muted }}>{nextTraining.fecha} · {nextTraining.hora} · {nextTraining.lugar}</div>
              <button onClick={() => goto("entrenamientos")} className="text-xs font-bold mt-2 flex items-center gap-1" style={{ color: T.red }}>Ver entrenamientos <ChevronRight size={14} /></button>
            </div>
          ) : <div className="text-sm mt-2" style={{ color: T.muted }}>Sin sesiones registradas.</div>}
        </Card>
      </div>

      <SmartAlerts ctx={ctx} />
    </div>
  );
}

function avgLast(arr) {
  if (!arr || !arr.length) return 0;
  return arr[arr.length - 1];
}

function SmartAlerts({ ctx }) {
  const { players, trainings, config } = ctx;
  const alerts = [];
  players.forEach((p) => {
    if (p.stats.amarillas >= 3) alerts.push({ type: "warn", text: `${p.nombre} acumula ${p.stats.amarillas} tarjetas amarillas.` });
    const pct = p.stats.entrenamientosTotales ? Math.round((p.stats.entrenamientosRealizados / p.stats.entrenamientosTotales) * 100) : 100;
    if (pct < 60) alerts.push({ type: "danger", text: `${p.nombre} tiene una asistencia a entrenamientos del ${pct}%.` });
    const v = p.stats.valoraciones;
    if (v && v.length >= 3) {
      const trend = v[v.length - 1] - v[v.length - 3];
      if (trend <= -1) alerts.push({ type: "danger", text: `${p.nombre} muestra una tendencia de rendimiento negativa.` });
      if (trend >= 1) alerts.push({ type: "good", text: `${p.nombre} muestra una tendencia de rendimiento muy positiva.` });
    }
  });
  const fCounts = {};
  Object.values(config.foundations).flat().forEach((f) => (fCounts[f] = 0));
  trainings.forEach((t) => { (t.objetivos?.tacticos || "").split(",").forEach((f) => { const k = f.trim(); if (fCounts[k] !== undefined) fCounts[k]++; }); });
  const forgotten = Object.entries(fCounts).filter(([, c]) => c === 0).map(([f]) => f).slice(0, 3);
  if (forgotten.length) alerts.push({ type: "warn", text: `Fundamentos poco trabajados últimamente: ${forgotten.join(", ")}.` });

  if (!alerts.length) return null;

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <Activity size={16} style={{ color: T.red }} />
        <span className="font-extrabold text-sm" style={{ color: T.navy }}>Sugerencias del sistema</span>
      </div>
      <div className="flex flex-col gap-2">
        {alerts.slice(0, 6).map((a, i) => {
          const c = a.type === "danger" ? T.redLight : a.type === "good" ? T.green : T.yellow;
          return (
            <div key={i} className="flex items-start gap-2 text-sm">
              <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: c }} />
              <span style={{ color: T.text }}>{a.text}</span>
            </div>
          );
        })}
      </div>
      <div className="text-[11px] mt-3" style={{ color: T.muted }}>Estas son sugerencias automáticas. La decisión final es siempre del cuerpo técnico.</div>
    </Card>
  );
}

/* ============================================================
   PLANTILLA
   ============================================================ */

function rankingScore(p, weights) {
  const rating = avgLast(p.stats.valoraciones) || 0;
  const g = p.stats.goles, a = p.stats.asistencias;
  const asis = p.stats.entrenamientosTotales ? (p.stats.entrenamientosRealizados / p.stats.entrenamientosTotales) * 10 : 5;
  const cards = p.stats.amarillas * 0.5 + p.stats.rojas * 2;
  const raw = (rating * weights.valoracion + g * weights.goles + a * weights.asistencias + asis * weights.asistenciaEntreno - cards * Math.abs(weights.tarjetas)) / 100;
  return p.manualRating ?? +raw.toFixed(2);
}

function Plantilla({ ctx, onSelect }) {
  const { players, updatePlayers, config } = ctx;
  const [sortBy, setSortBy] = useState("ranking");
  const [filterPos, setFilterPos] = useState("Todas");
  const [filterState, setFilterState] = useState("Todos");
  const [showNew, setShowNew] = useState(false);

  const ranked = players.map((p) => ({ ...p, ranking: rankingScore(p, config.rankingWeights) }));
  let list = ranked;
  if (filterPos !== "Todas") list = list.filter((p) => p.posicion === filterPos);
  if (filterState !== "Todos") list = list.filter((p) => p.estado === filterState);
  const sorters = {
    ranking: (a, b) => b.ranking - a.ranking,
    numero: (a, b) => a.numero - b.numero,
    goles: (a, b) => b.stats.goles - a.stats.goles,
    minutos: (a, b) => b.stats.minutos - a.stats.minutos,
    tarjetas: (a, b) => (b.stats.amarillas + b.stats.rojas * 2) - (a.stats.amarillas + a.stats.rojas * 2),
    asistencia: (a, b) => (b.stats.entrenamientosRealizados / b.stats.entrenamientosTotales) - (a.stats.entrenamientosRealizados / a.stats.entrenamientosTotales),
  };
  list = [...list].sort(sorters[sortBy]);

  return (
    <div className="flex flex-col gap-5 max-w-6xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <Eyebrow>Plantilla</Eyebrow>
          <h1 className="text-2xl font-extrabold" style={{ color: T.navy }}>{players.length} jugadores registrados</h1>
        </div>
        <Btn icon={Plus} variant="accent" onClick={() => setShowNew(true)}>Nuevo jugador</Btn>
      </div>

      <div className="flex flex-wrap gap-2">
        <Select value={filterPos} onChange={(e) => setFilterPos(e.target.value)} className="w-auto">
          <option>Todas</option>
          {config.positions.map((p) => <option key={p}>{p}</option>)}
        </Select>
        <Select value={filterState} onChange={(e) => setFilterState(e.target.value)} className="w-auto">
          <option>Todos</option>
          {config.playerStates.map((s) => <option key={s}>{s}</option>)}
        </Select>
        <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-auto">
          <option value="ranking">Ordenar: Ranking</option>
          <option value="numero">Ordenar: Número</option>
          <option value="goles">Ordenar: Goles</option>
          <option value="minutos">Ordenar: Minutos</option>
          <option value="tarjetas">Ordenar: Tarjetas</option>
          <option value="asistencia">Ordenar: Asistencia</option>
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {list.map((p) => {
          const sc = stateColor(p.estado);
          const pct = Math.round((p.stats.entrenamientosRealizados / p.stats.entrenamientosTotales) * 100);
          return (
            <Card key={p.id} className="p-4 cursor-pointer hover:shadow-md transition" onClick={() => onSelect(p.id)}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center font-extrabold text-white shrink-0" style={{ background: T.navy }}>{p.numero}</div>
                  <div>
                    <div className="font-extrabold leading-tight" style={{ color: T.navy }}>{p.apodo || p.nombre}</div>
                    <div className="text-xs" style={{ color: T.muted }}>{p.posicion}</div>
                  </div>
                </div>
                <Pill color={sc.color} bg={sc.bg}>{p.estado}</Pill>
              </div>
              <div className="grid grid-cols-4 gap-2 mt-3 text-center">
                <div><div className="font-extrabold tabular-nums" style={{ color: T.navy }}>{p.ranking}</div><div className="text-[10px] font-bold uppercase" style={{ color: T.muted }}>Rank</div></div>
                <div><div className="font-extrabold tabular-nums" style={{ color: T.navy }}>{p.stats.goles}</div><div className="text-[10px] font-bold uppercase" style={{ color: T.muted }}>Goles</div></div>
                <div><div className="font-extrabold tabular-nums" style={{ color: T.navy }}>{p.stats.minutos}</div><div className="text-[10px] font-bold uppercase" style={{ color: T.muted }}>Min</div></div>
                <div className="flex flex-col items-center"><Trend values={p.stats.valoraciones} /><div className="text-[10px] font-bold uppercase" style={{ color: T.muted }}>Tend.</div></div>
              </div>
              <div className="flex items-center gap-1 mt-3 text-xs" style={{ color: T.muted }}>
                <span className="w-2 h-2 rounded-full" style={{ background: p.stats.amarillas ? T.yellow : T.line }} />{p.stats.amarillas} amarillas
                <span className="w-2 h-2 rounded-full ml-2" style={{ background: p.stats.rojas ? T.redLight : T.line }} />{p.stats.rojas} rojas
                <span className="ml-auto font-bold">{pct}% asist.</span>
              </div>
            </Card>
          );
        })}
      </div>

      {showNew && <PlayerForm ctx={ctx} onClose={() => setShowNew(false)} onSave={(p) => { updatePlayers((prev) => [...prev, p]); setShowNew(false); }} />}
    </div>
  );
}

function PlayerForm({ ctx, initial, onClose, onSave }) {
  const { config } = ctx;
  const [f, setF] = useState(initial || {
    nombre: "", apodo: "", numero: "", posicion: config.positions[0], secundarias: [],
    categoria: config.category, dob: "", pie: "Diestro", altura: "", peso: "",
    estado: "Disponible", fechaIncorporacion: todayISO(), observaciones: "",
  });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const submit = () => {
    if (!f.nombre.trim()) return;
    const player = initial ? { ...initial, ...f } : {
      id: uid(), ...f, numero: Number(f.numero) || 0, altura: Number(f.altura) || null, peso: Number(f.peso) || null,
      manualRating: null,
      stats: { convocatorias: 0, titular: 0, suplente: 0, minutos: 0, goles: 0, asistencias: 0, amarillas: 0, rojas: 0, valoraciones: [], entrenamientosRealizados: 0, entrenamientosTotales: 0 },
      custom: {},
    };
    if (initial) { player.numero = Number(f.numero) || 0; player.altura = Number(f.altura) || null; player.peso = Number(f.peso) || null; }
    onSave(player);
  };
  return (
    <Modal title={initial ? "Editar jugador" : "Nuevo jugador"} onClose={onClose} wide>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Nombre y apellidos"><TextInput value={f.nombre} onChange={(e) => set("nombre", e.target.value)} /></Field>
        <Field label="Nombre deportivo / apodo"><TextInput value={f.apodo} onChange={(e) => set("apodo", e.target.value)} /></Field>
        <Field label="Número"><TextInput type="number" value={f.numero} onChange={(e) => set("numero", e.target.value)} /></Field>
        <Field label="Posición principal">
          <Select value={f.posicion} onChange={(e) => set("posicion", e.target.value)}>{config.positions.map((p) => <option key={p}>{p}</option>)}</Select>
        </Field>
        <Field label="Posiciones secundarias" className="sm:col-span-2">
          <div className="flex flex-wrap gap-1.5">
            {config.positions.map((p) => {
              const active = f.secundarias.includes(p);
              return (
                <button type="button" key={p} onClick={() => set("secundarias", active ? f.secundarias.filter((x) => x !== p) : [...f.secundarias, p])}
                  className="px-2.5 py-1 rounded-full text-xs font-bold border" style={{ borderColor: active ? T.navy : T.line, background: active ? T.navy : "#fff", color: active ? "#fff" : T.muted }}>{p}</button>
              );
            })}
          </div>
        </Field>
        <Field label="Fecha de nacimiento"><TextInput type="date" value={f.dob} onChange={(e) => set("dob", e.target.value)} /></Field>
        <Field label="Pie dominante">
          <Select value={f.pie} onChange={(e) => set("pie", e.target.value)}><option>Diestro</option><option>Zurdo</option><option>Ambidiestro</option></Select>
        </Field>
        <Field label="Altura (cm)"><TextInput type="number" value={f.altura} onChange={(e) => set("altura", e.target.value)} /></Field>
        <Field label="Peso (kg)"><TextInput type="number" value={f.peso} onChange={(e) => set("peso", e.target.value)} /></Field>
        <Field label="Estado actual">
          <Select value={f.estado} onChange={(e) => set("estado", e.target.value)}>{config.playerStates.map((s) => <option key={s}>{s}</option>)}</Select>
        </Field>
        <Field label="Fecha de incorporación"><TextInput type="date" value={f.fechaIncorporacion} onChange={(e) => set("fechaIncorporacion", e.target.value)} /></Field>
        <Field label="Observaciones" className="sm:col-span-2"><TextArea value={f.observaciones} onChange={(e) => set("observaciones", e.target.value)} /></Field>
      </div>
      <div className="flex justify-end gap-2 mt-5 sticky bottom-0 bg-white -mx-5 px-5 py-3 border-t" style={{ borderColor: T.line }}>
        <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
        <Btn variant="accent" icon={Save} onClick={submit}>Guardar jugador</Btn>
      </div>
    </Modal>
  );
}

function PlayerDetail({ ctx, playerId, onBack }) {
  const { players, updatePlayers, matches, trainings, config } = ctx;
  const p = players.find((x) => x.id === playerId);
  const [tab, setTab] = useState("general");
  const [editing, setEditing] = useState(false);
  const [manualEdit, setManualEdit] = useState(false);
  const [manualVal, setManualVal] = useState(p?.manualRating ?? "");
  if (!p) return null;

  const sc = stateColor(p.estado);
  const ranking = rankingScore(p, config.rankingWeights);

  const playerMatches = matches.filter((m) => m.convocatoria?.some((c) => c.jugadorId === p.id))
    .sort((a, b) => b.fecha.localeCompare(a.fecha));
  const playerTrainings = trainings.filter((t) => t.asistencia?.some((a) => a.jugadorId === p.id))
    .sort((a, b) => b.fecha.localeCompare(a.fecha));

  const remove = () => {
    if (confirm(`¿Eliminar a ${p.nombre}? Esta acción no se puede deshacer.`)) {
      updatePlayers((prev) => prev.filter((x) => x.id !== p.id));
      onBack();
    }
  };

  return (
    <div className="flex flex-col gap-5 max-w-4xl">
      <button onClick={onBack} className="flex items-center gap-1 text-sm font-bold w-fit" style={{ color: T.muted }}><ChevronLeft size={16} />Volver a la plantilla</button>

      <Card className="p-5">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl text-white shrink-0" style={{ background: T.navy }}>{p.numero}</div>
            <div>
              <h1 className="text-2xl font-extrabold" style={{ color: T.navy }}>{p.nombre}</h1>
              <div className="text-sm" style={{ color: T.muted }}>{p.posicion}{p.secundarias?.length ? ` · ${p.secundarias.join(", ")}` : ""}</div>
              <div className="flex gap-1.5 mt-1.5"><Pill color={sc.color} bg={sc.bg}>{p.estado}</Pill><Pill>{calcAge(p.dob)} años</Pill><Pill>{p.pie}</Pill></div>
            </div>
          </div>
          <div className="flex gap-2">
            <Btn variant="ghost" icon={Edit3} onClick={() => setEditing(true)}>Editar</Btn>
            <Btn variant="danger" icon={Trash2} onClick={remove}>Eliminar</Btn>
          </div>
        </div>
      </Card>

      <div className="flex gap-1.5 flex-wrap">
        {[["general", "General"], ["rendimiento", "Rendimiento"], ["entrenamiento", "Entrenamiento"], ["historial", "Historial"]].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className="px-3.5 py-2 rounded-xl text-sm font-bold"
            style={{ background: tab === k ? T.navy : "#fff", color: tab === k ? "#fff" : T.muted, border: `1px solid ${tab === k ? T.navy : T.line}` }}>{l}</button>
        ))}
      </div>

      {tab === "general" && (
        <Card className="p-5 grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[["Altura", p.altura ? `${p.altura} cm` : "-"], ["Peso", p.peso ? `${p.peso} kg` : "-"], ["Categoría", p.categoria],
            ["Fecha nacimiento", p.dob || "-"], ["Incorporación", p.fechaIncorporacion || "-"], ["Ranking interno", ranking]].map(([l, v]) => (
            <div key={l}><div className="text-[11px] font-bold uppercase" style={{ color: T.muted }}>{l}</div><div className="font-bold" style={{ color: T.navy }}>{v}</div></div>
          ))}
          <div className="col-span-2 sm:col-span-3">
            <div className="text-[11px] font-bold uppercase mb-1" style={{ color: T.muted }}>Observaciones</div>
            <div className="text-sm" style={{ color: T.text }}>{p.observaciones || "Sin observaciones."}</div>
          </div>
          <div className="col-span-2 sm:col-span-3 pt-3 border-t" style={{ borderColor: T.line }}>
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-bold uppercase" style={{ color: T.muted }}>Ranking manual (anula el cálculo automático)</div>
              {!manualEdit && <button className="text-xs font-bold" style={{ color: T.red }} onClick={() => setManualEdit(true)}>Ajustar</button>}
            </div>
            {manualEdit ? (
              <div className="flex gap-2 mt-2">
                <TextInput type="number" step="0.1" value={manualVal} onChange={(e) => setManualVal(e.target.value)} className="w-28" />
                <Btn variant="accent" onClick={() => { updatePlayers((prev) => prev.map((x) => x.id === p.id ? { ...x, manualRating: manualVal === "" ? null : Number(manualVal) } : x)); setManualEdit(false); }}>Aplicar</Btn>
                <Btn variant="ghost" onClick={() => { setManualVal(""); updatePlayers((prev) => prev.map((x) => x.id === p.id ? { ...x, manualRating: null } : x)); setManualEdit(false); }}>Quitar manual</Btn>
              </div>
            ) : <div className="text-sm mt-1" style={{ color: T.text }}>{p.manualRating != null ? p.manualRating : "Automático (según fórmula configurada)"}</div>}
          </div>
        </Card>
      )}

      {tab === "rendimiento" && (
        <Card className="p-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            {[["Convocatorias", p.stats.convocatorias], ["Titular", p.stats.titular], ["Suplente", p.stats.suplente], ["Minutos", p.stats.minutos],
              ["Goles", p.stats.goles], ["Asistencias", p.stats.asistencias], ["Amarillas", p.stats.amarillas], ["Rojas", p.stats.rojas]].map(([l, v]) => (
              <div key={l}><div className="text-2xl font-extrabold tabular-nums" style={{ color: T.navy }}>{v}</div><div className="text-[11px] font-bold uppercase" style={{ color: T.muted }}>{l}</div></div>
            ))}
          </div>
          <div className="text-[11px] font-bold uppercase mb-2" style={{ color: T.muted }}>Evolución de valoración</div>
          <div className="flex items-end gap-1.5 h-24">
            {p.stats.valoraciones.map((v, i) => (
              <div key={i} className="flex-1 rounded-t-md" style={{ height: `${(v / 10) * 100}%`, background: T.navy3, minWidth: 8 }} title={v} />
            ))}
          </div>
        </Card>
      )}

      {tab === "entrenamiento" && (
        <Card className="p-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div><div className="text-2xl font-extrabold" style={{ color: T.navy }}>{p.stats.entrenamientosRealizados}/{p.stats.entrenamientosTotales}</div><div className="text-[11px] font-bold uppercase" style={{ color: T.muted }}>Sesiones realizadas</div></div>
            <div><div className="text-2xl font-extrabold" style={{ color: T.green }}>{p.stats.entrenamientosTotales ? Math.round((p.stats.entrenamientosRealizados / p.stats.entrenamientosTotales) * 100) : 0}%</div><div className="text-[11px] font-bold uppercase" style={{ color: T.muted }}>% Asistencia</div></div>
            <div><div className="text-2xl font-extrabold" style={{ color: T.redLight }}>{p.stats.entrenamientosTotales - p.stats.entrenamientosRealizados}</div><div className="text-[11px] font-bold uppercase" style={{ color: T.muted }}>Ausencias</div></div>
          </div>
          <div className="text-sm mt-4" style={{ color: T.muted }}>La evolución física, técnica, táctica y psicológica se completa automáticamente a partir de los fundamentos trabajados en cada sesión donde participe este jugador.</div>
        </Card>
      )}

      {tab === "historial" && (
        <div className="flex flex-col gap-2">
          {[...playerMatches.map((m) => ({ tipo: "Partido", fecha: m.fecha, label: `vs ${m.rival} · ${m.resultadoFinal}` })),
            ...playerTrainings.map((t) => ({ tipo: "Entrenamiento", fecha: t.fecha, label: t.objetivoGeneral }))]
            .sort((a, b) => b.fecha.localeCompare(a.fecha)).map((h, i) => (
              <Card key={i} className="p-3 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: h.tipo === "Partido" ? T.red : T.green }} />
                <div className="text-xs font-bold w-28 shrink-0" style={{ color: T.muted }}>{h.fecha}</div>
                <div className="text-sm font-bold" style={{ color: T.navy }}>{h.tipo}</div>
                <div className="text-sm truncate" style={{ color: T.text }}>{h.label}</div>
              </Card>
            ))}
          {!playerMatches.length && !playerTrainings.length && <div className="text-sm" style={{ color: T.muted }}>Sin historial registrado todavía.</div>}
        </div>
      )}

      {editing && <PlayerForm ctx={ctx} initial={p} onClose={() => setEditing(false)} onSave={(np) => { updatePlayers((prev) => prev.map((x) => x.id === p.id ? np : x)); setEditing(false); }} />}
    </div>
  );
}

/* ============================================================
   PARTIDOS
   ============================================================ */

function Partidos({ ctx }) {
  const { matches, updateMatches, config } = ctx;
  const [openId, setOpenId] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const sorted = [...matches].sort((a, b) => b.fecha.localeCompare(a.fecha));
  const editing = matches.find((m) => m.id === openId);

  return (
    <div className="flex flex-col gap-5 max-w-5xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><Eyebrow>Partidos</Eyebrow><h1 className="text-2xl font-extrabold" style={{ color: T.navy }}>{matches.length} partidos registrados</h1></div>
        <Btn icon={Plus} variant="accent" onClick={() => setShowNew(true)}>Nuevo partido</Btn>
      </div>

      <div className="flex flex-col gap-2.5">
        {sorted.map((m) => {
          const [gf, gc] = (m.resultadoFinal || "0-0").split("-").map(Number);
          const res = gf > gc ? T.green : gf === gc ? T.yellow : T.redLight;
          return (
            <Card key={m.id} className="p-4 cursor-pointer hover:shadow-md transition" onClick={() => setOpenId(m.id)}>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-10 rounded-full" style={{ background: res }} />
                  <div>
                    <div className="font-extrabold" style={{ color: T.navy }}>{m.esLocal ? `${config.teamName} vs ${m.rival}` : `${m.rival} vs ${config.teamName}`}</div>
                    <div className="text-xs" style={{ color: T.muted }}>{m.fecha} · J{m.jornada} · {m.competicion} · {m.campo}</div>
                  </div>
                </div>
                <div className="text-xl font-black tabular-nums" style={{ color: T.navy }}>{m.resultadoFinal}</div>
              </div>
            </Card>
          );
        })}
        {!sorted.length && <div className="text-sm" style={{ color: T.muted }}>Todavía no hay partidos registrados.</div>}
      </div>

      {showNew && <MatchForm ctx={ctx} onClose={() => setShowNew(false)} onSave={(m) => { updateMatches((prev) => [...prev, m]); setShowNew(false); }} />}
      {editing && <MatchForm ctx={ctx} initial={editing}
        onClose={() => setOpenId(null)}
        onSave={(m) => { updateMatches((prev) => prev.map((x) => x.id === m.id ? m : x)); setOpenId(null); }}
        onDelete={() => { if (confirm("¿Eliminar este partido?")) { updateMatches((prev) => prev.filter((x) => x.id !== editing.id)); setOpenId(null); } }} />}
    </div>
  );
}

/* ---------------- Editor gráfico de alineación ---------------- */

function computeFormationSlots(systemStr) {
  const lines = (systemStr || "1-4-3-3").split("-").map(Number).filter((n) => !isNaN(n) && n > 0);
  if (!lines.length) return [{ x: 50, y: 90 }];
  const n = lines.length;
  const slots = [];
  lines.forEach((count, li) => {
    const y = n === 1 ? 50 : 88 - li * (78 / (n - 1));
    for (let i = 0; i < count; i++) {
      const x = ((i + 1) / (count + 1)) * 100;
      slots.push({ x, y });
    }
  });
  return slots;
}

function PitchEditor({ system, players, lineup, onChange }) {
  const containerRef = useRef(null);
  const dragIndex = useRef(null);
  const movedRef = useRef(false);
  const startRef = useRef({ x: 0, y: 0 });
  const [activeSlot, setActiveSlot] = useState(null);

  const baseSlots = useMemo(() => computeFormationSlots(system), [system]);
  const slots = baseSlots.map((s, i) => lineup[i] ? { ...s, ...lineup[i] } : { ...s, jugadorId: null });

  const setSlot = (i, patch) => {
    const next = slots.map((s, idx) => idx === i ? { ...s, ...patch } : s);
    onChange(next.map(({ x, y, jugadorId }) => ({ x, y, jugadorId })));
  };

  const onPointerDown = (i, e) => {
    dragIndex.current = i; movedRef.current = false;
    startRef.current = { x: e.clientX, y: e.clientY };
    e.target.setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (dragIndex.current == null || !containerRef.current) return;
    const dx = Math.abs(e.clientX - startRef.current.x), dy = Math.abs(e.clientY - startRef.current.y);
    if (dx > 3 || dy > 3) movedRef.current = true;
    if (!movedRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    let x = ((e.clientX - rect.left) / rect.width) * 100;
    let y = ((e.clientY - rect.top) / rect.height) * 100;
    x = Math.max(4, Math.min(96, x)); y = Math.max(4, Math.min(96, y));
    setSlot(dragIndex.current, { x, y });
  };
  const onPointerUp = (i) => {
    if (!movedRef.current) setActiveSlot(i === activeSlot ? null : i);
    dragIndex.current = null;
  };

  const assignedIds = slots.map((s) => s.jugadorId).filter(Boolean);

  return (
    <div>
      <div ref={containerRef} onPointerMove={onPointerMove}
        className="relative w-full rounded-xl overflow-hidden select-none touch-none"
        style={{ aspectRatio: "2/3", background: `linear-gradient(${T.green}, #22874C)`, border: `2px solid #1F7A44` }}>
        <div className="absolute inset-2 border-2 rounded-lg" style={{ borderColor: "rgba(255,255,255,0.5)" }} />
        <div className="absolute left-2 right-2 top-1/2 border-t-2" style={{ borderColor: "rgba(255,255,255,0.5)" }} />
        <div className="absolute left-1/2 top-1/2 w-16 h-16 -translate-x-1/2 -translate-y-1/2 border-2 rounded-full" style={{ borderColor: "rgba(255,255,255,0.5)" }} />
        <div className="absolute left-1/2 top-2 w-28 h-10 -translate-x-1/2 border-2 border-t-0" style={{ borderColor: "rgba(255,255,255,0.5)" }} />
        <div className="absolute left-1/2 bottom-2 w-28 h-10 -translate-x-1/2 border-2 border-b-0" style={{ borderColor: "rgba(255,255,255,0.5)" }} />
        {slots.map((s, i) => {
          const p = players.find((pl) => pl.id === s.jugadorId);
          return (
            <div key={i} onPointerDown={(e) => onPointerDown(i, e)} onPointerUp={() => onPointerUp(i)}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing flex flex-col items-center"
              style={{ left: `${s.x}%`, top: `${s.y}%` }}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-extrabold text-white shadow-md"
                style={{ background: p ? T.navy : "rgba(255,255,255,0.35)", border: activeSlot === i ? `2px solid ${T.yellow}` : "2px solid rgba(255,255,255,0.8)" }}>
                {p ? p.numero : "+"}
              </div>
              {p && <div className="text-[10px] font-bold text-white mt-0.5 whitespace-nowrap" style={{ textShadow: "0 1px 2px rgba(0,0,0,0.6)" }}>{p.apodo || p.nombre.split(" ")[0]}</div>}
            </div>
          );
        })}
      </div>
      <div className="text-xs mt-2" style={{ color: T.muted }}>Toca un jugador para asignarlo. Mantén pulsado y arrastra para moverlo sobre el campo.</div>
      {activeSlot != null && (
        <div className="flex items-center gap-2 mt-2 p-2 rounded-lg" style={{ background: "#F7F8FA" }}>
          <span className="text-xs font-bold" style={{ color: T.navy }}>Posición {activeSlot + 1}:</span>
          <Select value={slots[activeSlot].jugadorId || ""} onChange={(e) => setSlot(activeSlot, { jugadorId: e.target.value || null })} className="w-auto text-xs py-1">
            <option value="">Sin asignar</option>
            {players.filter((p) => !assignedIds.includes(p.id) || p.id === slots[activeSlot].jugadorId).map((p) => <option key={p.id} value={p.id}>{p.apodo || p.nombre}</option>)}
          </Select>
          <button className="text-xs font-bold ml-auto" style={{ color: T.red }} onClick={() => setActiveSlot(null)}>Cerrar</button>
        </div>
      )}
    </div>
  );
}

function MatchForm({ ctx, initial, onClose, onSave, onDelete }) {
  const { config, players } = ctx;
  const blank = {
    id: uid(), fecha: todayISO(), competicion: "", jornada: "", rival: "", esLocal: true, campo: "",
    resultadoDescanso: "", resultadoFinal: "0-0", tipoFutbol: config.footballType,
    sistema: config.tacticalSystems[config.footballType]?.[0] || "",
    convocatoria: players.map((p) => ({ jugadorId: p.id, estado: "No convocado" })),
    alineacion: [],
    cambios: [], goles: [], tarjetas: [],
    tactica: { modelo: "", funciono: "", noFunciono: "", ajustes: "" },
    rendimiento: { ataque: 5, defensa: 5, transicionOfensiva: 5, transicionDefensiva: 5, balonParadoOfensivo: 5, balonParadoDefensivo: 5, fortalezas: "", debilidades: "" },
    aprendizajes: { mantener: "", corregir: "", trabajar: "" },
    observaciones: "",
  };
  const [f, setF] = useState(initial ? {
    ...blank, ...initial,
    convocatoria: players.map((p) => initial.convocatoria?.find((c) => c.jugadorId === p.id) || { jugadorId: p.id, estado: "No convocado" }),
  } : blank);
  const [tab, setTab] = useState("datos");
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const setNested = (k, kk, v) => setF((p) => ({ ...p, [k]: { ...p[k], [kk]: v } }));

  const submit = () => onSave(f);

  const addRow = (key, row) => setF((p) => ({ ...p, [key]: [...p[key], { id: uid(), ...row }] }));
  const removeRow = (key, id) => setF((p) => ({ ...p, [key]: p[key].filter((r) => r.id !== id) }));
  const updateRow = (key, id, kk, v) => setF((p) => ({ ...p, [key]: p[key].map((r) => r.id === id ? { ...r, [kk]: v } : r) }));

  const tabs = [["datos", "Datos"], ["convocatoria", "Convocatoria"], ["alineacion", "Alineación"], ["eventos", "Cambios/Goles/Tarjetas"], ["tactica", "Táctica"], ["rendimiento", "Rendimiento"], ["aprendizajes", "Aprendizajes"], ["obs", "Observaciones"]];

  return (
    <Modal title={initial ? "Editar partido" : "Nuevo partido"} onClose={onClose} wide>
      <div className="flex gap-1.5 flex-wrap mb-4">
        {tabs.map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className="px-2.5 py-1.5 rounded-lg text-xs font-bold"
            style={{ background: tab === k ? T.navy : "#fff", color: tab === k ? "#fff" : T.muted, border: `1px solid ${tab === k ? T.navy : T.line}` }}>{l}</button>
        ))}
      </div>

      {tab === "datos" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Fecha"><TextInput type="date" value={f.fecha} onChange={(e) => set("fecha", e.target.value)} /></Field>
          <Field label="Competición"><TextInput value={f.competicion} onChange={(e) => set("competicion", e.target.value)} /></Field>
          <Field label="Jornada"><TextInput value={f.jornada} onChange={(e) => set("jornada", e.target.value)} /></Field>
          <Field label="Categoría"><TextInput value={f.categoria || config.category} onChange={(e) => set("categoria", e.target.value)} /></Field>
          <Field label="Rival"><TextInput value={f.rival} onChange={(e) => set("rival", e.target.value)} /></Field>
          <Field label="Condición">
            <Select value={f.esLocal ? "local" : "visitante"} onChange={(e) => set("esLocal", e.target.value === "local")}><option value="local">Local</option><option value="visitante">Visitante</option></Select>
          </Field>
          <Field label="Campo"><TextInput value={f.campo} onChange={(e) => set("campo", e.target.value)} /></Field>
          <Field label="Tipo de fútbol">
            <Select value={f.tipoFutbol} onChange={(e) => set("tipoFutbol", e.target.value)}>{Object.keys(config.tacticalSystems).map((t) => <option key={t}>{t}</option>)}</Select>
          </Field>
          <Field label="Sistema utilizado">
            <Select value={f.sistema} onChange={(e) => set("sistema", e.target.value)}>{(config.tacticalSystems[f.tipoFutbol] || []).map((s) => <option key={s}>{s}</option>)}</Select>
          </Field>
          <Field label="Resultado al descanso"><TextInput value={f.resultadoDescanso} onChange={(e) => set("resultadoDescanso", e.target.value)} placeholder="0-0" /></Field>
          <Field label="Resultado final"><TextInput value={f.resultadoFinal} onChange={(e) => set("resultadoFinal", e.target.value)} placeholder="0-0" /></Field>
        </div>
      )}

      {tab === "convocatoria" && (
        <div className="flex flex-col gap-1.5">
          {players.map((p) => {
            const row = f.convocatoria.find((c) => c.jugadorId === p.id);
            return (
              <div key={p.id} className="flex items-center gap-2 p-2 rounded-lg" style={{ background: "#F7F8FA" }}>
                <div className="w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-extrabold text-white shrink-0" style={{ background: T.navy }}>{p.numero}</div>
                <div className="text-sm font-bold flex-1 truncate" style={{ color: T.navy }}>{p.apodo || p.nombre}</div>
                <Select value={row.estado} onChange={(e) => setF((prev) => ({ ...prev, convocatoria: prev.convocatoria.map((c) => c.jugadorId === p.id ? { ...c, estado: e.target.value } : c) }))} className="w-auto text-xs py-1">
                  <option>No convocado</option><option>Titular</option><option>Suplente</option><option>Ausente</option>
                </Select>
              </div>
            );
          })}
        </div>
      )}

      {tab === "alineacion" && (
        <div>
          <div className="mb-3 text-sm" style={{ color: T.muted }}>Sistema: <strong style={{ color: T.navy }}>{f.sistema}</strong> ({f.tipoFutbol}). Cambia el sistema en la pestaña Datos para recalcular las posiciones.</div>
          <PitchEditor system={f.sistema} players={players} lineup={f.alineacion} onChange={(l) => set("alineacion", l)} />
        </div>
      )}

      {tab === "eventos" && (
        <div className="flex flex-col gap-6">
          <EventTable title="Cambios" rows={f.cambios} players={players}
            cols={[["saleId", "Sale", "player"], ["entraId", "Entra", "player"], ["minuto", "Min.", "text"]]}
            onAdd={() => addRow("cambios", { saleId: "", entraId: "", minuto: "" })}
            onRemove={(id) => removeRow("cambios", id)} onUpdate={(id, k, v) => updateRow("cambios", id, k, v)} />
          <EventTable title="Goles" rows={f.goles} players={players}
            cols={[["minuto", "Min.", "text"], ["jugadorId", "Jugador", "player"], ["asistenciaId", "Asistencia", "player"]]}
            onAdd={() => addRow("goles", { minuto: "", jugadorId: "", asistenciaId: "" })}
            onRemove={(id) => removeRow("goles", id)} onUpdate={(id, k, v) => updateRow("goles", id, k, v)} />
          <EventTable title="Tarjetas e incidencias" rows={f.tarjetas} players={players}
            cols={[["jugadorId", "Jugador", "player"], ["tipo", "Tipo", "cardtype"], ["minuto", "Min.", "text"]]}
            onAdd={() => addRow("tarjetas", { jugadorId: "", tipo: "Amarilla", minuto: "" })}
            onRemove={(id) => removeRow("tarjetas", id)} onUpdate={(id, k, v) => updateRow("tarjetas", id, k, v)} />
        </div>
      )}

      {tab === "tactica" && (
        <div className="flex flex-col gap-3">
          <Field label="Modelo de juego utilizado"><TextArea value={f.tactica.modelo} onChange={(e) => setNested("tactica", "modelo", e.target.value)} /></Field>
          <Field label="Qué funcionó"><TextArea value={f.tactica.funciono} onChange={(e) => setNested("tactica", "funciono", e.target.value)} /></Field>
          <Field label="Qué no funcionó"><TextArea value={f.tactica.noFunciono} onChange={(e) => setNested("tactica", "noFunciono", e.target.value)} /></Field>
          <Field label="Ajustes realizados durante el partido"><TextArea value={f.tactica.ajustes} onChange={(e) => setNested("tactica", "ajustes", e.target.value)} /></Field>
        </div>
      )}

      {tab === "rendimiento" && (
        <div className="flex flex-col gap-4">
          {[["ataque", "Ataque"], ["defensa", "Defensa"], ["transicionOfensiva", "Transición ofensiva"], ["transicionDefensiva", "Transición defensiva"], ["balonParadoOfensivo", "Balón parado ofensivo"], ["balonParadoDefensivo", "Balón parado defensivo"]].map(([k, l]) => (
            <Field key={k} label={`${l} (1-10)`}>
              <input type="range" min="1" max="10" value={f.rendimiento[k]} onChange={(e) => setNested("rendimiento", k, Number(e.target.value))} className="w-full" />
              <div className="text-xs font-bold text-right" style={{ color: T.navy }}>{f.rendimiento[k]}</div>
            </Field>
          ))}
          <Field label="Fortalezas"><TextArea value={f.rendimiento.fortalezas} onChange={(e) => setNested("rendimiento", "fortalezas", e.target.value)} /></Field>
          <Field label="Debilidades"><TextArea value={f.rendimiento.debilidades} onChange={(e) => setNested("rendimiento", "debilidades", e.target.value)} /></Field>
        </div>
      )}

      {tab === "aprendizajes" && (
        <div className="flex flex-col gap-3">
          <Field label="Qué debemos mantener"><TextArea value={f.aprendizajes.mantener} onChange={(e) => setNested("aprendizajes", "mantener", e.target.value)} /></Field>
          <Field label="Qué debemos corregir"><TextArea value={f.aprendizajes.corregir} onChange={(e) => setNested("aprendizajes", "corregir", e.target.value)} /></Field>
          <Field label="Qué debemos trabajar en los próximos entrenamientos"><TextArea value={f.aprendizajes.trabajar} onChange={(e) => setNested("aprendizajes", "trabajar", e.target.value)} /></Field>
        </div>
      )}

      {tab === "obs" && (
        <Field label="Observaciones del entrenador"><TextArea style={{ minHeight: 160 }} value={f.observaciones} onChange={(e) => set("observaciones", e.target.value)} /></Field>
      )}

      <div className="flex justify-between gap-2 mt-5 sticky bottom-0 bg-white -mx-5 px-5 py-3 border-t" style={{ borderColor: T.line }}>
        {onDelete ? <Btn variant="danger" icon={Trash2} onClick={onDelete}>Eliminar</Btn> : <div />}
        <div className="flex gap-2">
          <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
          <Btn variant="accent" icon={Save} onClick={submit}>Guardar partido</Btn>
        </div>
      </div>
    </Modal>
  );
}

function EventTable({ title, rows, players, cols, onAdd, onRemove, onUpdate }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-extrabold" style={{ color: T.navy }}>{title}</div>
        <Btn variant="ghost" icon={Plus} onClick={onAdd}>Añadir</Btn>
      </div>
      <div className="flex flex-col gap-2">
        {rows.map((r) => (
          <div key={r.id} className="flex items-center gap-2 flex-wrap">
            {cols.map(([key, label, type]) => (
              type === "player" ? (
                <Select key={key} value={r[key]} onChange={(e) => onUpdate(r.id, key, e.target.value)} className="w-auto text-xs py-1">
                  <option value="">{label}</option>
                  {players.map((p) => <option key={p.id} value={p.id}>{p.apodo || p.nombre}</option>)}
                </Select>
              ) : type === "cardtype" ? (
                <Select key={key} value={r[key]} onChange={(e) => onUpdate(r.id, key, e.target.value)} className="w-auto text-xs py-1">
                  <option>Amarilla</option><option>Roja</option><option>Lesión</option><option>Otro</option>
                </Select>
              ) : (
                <TextInput key={key} value={r[key]} onChange={(e) => onUpdate(r.id, key, e.target.value)} placeholder={label} className="w-20 text-xs py-1" />
              )
            ))}
            <button onClick={() => onRemove(r.id)} className="p-1 rounded-lg hover:bg-red-50"><Trash2 size={14} style={{ color: T.redLight }} /></button>
          </div>
        ))}
        {!rows.length && <div className="text-xs" style={{ color: T.muted }}>Sin registros.</div>}
      </div>
    </div>
  );
}

/* ============================================================
   ENTRENAMIENTOS
   ============================================================ */

function Entrenamientos({ ctx }) {
  const { trainings, updateTrainings, players } = ctx;
  const [openId, setOpenId] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const sorted = [...trainings].sort((a, b) => b.fecha.localeCompare(a.fecha));
  const editing = trainings.find((t) => t.id === openId);

  return (
    <div className="flex flex-col gap-5 max-w-5xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><Eyebrow>Entrenamientos</Eyebrow><h1 className="text-2xl font-extrabold" style={{ color: T.navy }}>{trainings.length} sesiones registradas</h1></div>
        <Btn icon={Plus} variant="accent" onClick={() => setShowNew(true)}>Nueva sesión</Btn>
      </div>

      <div className="flex flex-col gap-2.5">
        {sorted.map((t) => (
          <Card key={t.id} className="p-4 cursor-pointer hover:shadow-md transition" onClick={() => setOpenId(t.id)}>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-10 rounded-full" style={{ background: T.green }} />
                <div>
                  <div className="font-extrabold" style={{ color: T.navy }}>{t.objetivoGeneral}</div>
                  <div className="text-xs" style={{ color: T.muted }}>{t.fecha} · {t.hora} · {t.lugar} · {t.duracion} min</div>
                </div>
              </div>
              <Pill>{t.tareas?.length || 0} tareas</Pill>
            </div>
          </Card>
        ))}
        {!sorted.length && <div className="text-sm" style={{ color: T.muted }}>Todavía no hay sesiones registradas.</div>}
      </div>

      {showNew && <TrainingForm ctx={ctx} onClose={() => setShowNew(false)} onSave={(t) => { updateTrainings((prev) => [...prev, t]); setShowNew(false); }} />}
      {editing && <TrainingForm ctx={ctx} initial={editing}
        onClose={() => setOpenId(null)}
        onSave={(t) => { updateTrainings((prev) => prev.map((x) => x.id === t.id ? t : x)); setOpenId(null); }}
        onDelete={() => { if (confirm("¿Eliminar esta sesión?")) { updateTrainings((prev) => prev.filter((x) => x.id !== editing.id)); setOpenId(null); } }} />}
    </div>
  );
}

function TrainingForm({ ctx, initial, onClose, onSave, onDelete }) {
  const { players, tasks, config } = ctx;
  const blank = {
    id: uid(), fecha: todayISO(), hora: "19:00", lugar: "", duracion: 90, numJugadores: players.length,
    objetivoGeneral: "",
    objetivos: { fisicos: "", tecnicos: "", tacticos: "", estrategicos: "", psicologicos: "" },
    calentamiento: { actividad: "", objetivo: "", materiales: "", tiempo: 15, notas: "" },
    tareas: [],
    aplicacionJuego: { tipo: "Juego reducido", objetivo: "", tiempo: 20, observaciones: "" },
    vueltaCalma: { estiramientos: "", actividad: "", tiempo: 10, observaciones: "" },
    notas: "",
    asistencia: players.map((p) => ({ jugadorId: p.id, estado: "Presente" })),
  };
  const [f, setF] = useState(initial ? {
    ...blank, ...initial,
    asistencia: players.map((p) => initial.asistencia?.find((a) => a.jugadorId === p.id) || { jugadorId: p.id, estado: "Presente" }),
  } : blank);
  const [tab, setTab] = useState("info");
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const setNested = (k, kk, v) => setF((p) => ({ ...p, [k]: { ...p[k], [kk]: v } }));

  const addTaskFromLibrary = (taskId) => {
    const t = tasks.find((x) => x.id === taskId);
    if (!t) return;
    setF((p) => ({ ...p, tareas: [...p.tareas, { id: uid(), nombre: t.nombre, codigo: t.codigo, objetivo: t.objTactico || t.objTecnico, fundamento: t.objTecnico, materiales: t.materiales, tiempo: t.duracion, jugadores: t.minJugadores, espacio: t.espacio, reglas: t.reglas, organizacion: "", descripcion: t.descripcion, notas: "" }] }));
  };
  const addBlankTask = () => setF((p) => ({ ...p, tareas: [...p.tareas, { id: uid(), nombre: "", codigo: "", objetivo: "", fundamento: "", materiales: "", tiempo: 15, jugadores: "", espacio: "", reglas: "", organizacion: "", descripcion: "", notas: "" }] }));
  const updateTask = (id, k, v) => setF((p) => ({ ...p, tareas: p.tareas.map((t) => t.id === id ? { ...t, [k]: v } : t) }));
  const removeTask = (id) => setF((p) => ({ ...p, tareas: p.tareas.filter((t) => t.id !== id) }));

  const tabs = [["info", "Información"], ["objetivos", "Objetivos"], ["calentamiento", "Calentamiento"], ["tareas", "Parte principal"], ["juego", "Juego real"], ["calma", "Vuelta a la calma"], ["asistencia", "Asistencia"]];

  return (
    <Modal title={initial ? "Editar sesión" : "Nueva sesión de entrenamiento"} onClose={onClose} wide>
      <div className="flex gap-1.5 flex-wrap mb-4">
        {tabs.map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className="px-2.5 py-1.5 rounded-lg text-xs font-bold"
            style={{ background: tab === k ? T.navy : "#fff", color: tab === k ? "#fff" : T.muted, border: `1px solid ${tab === k ? T.navy : T.line}` }}>{l}</button>
        ))}
      </div>

      {tab === "info" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Fecha"><TextInput type="date" value={f.fecha} onChange={(e) => set("fecha", e.target.value)} /></Field>
          <Field label="Hora"><TextInput type="time" value={f.hora} onChange={(e) => set("hora", e.target.value)} /></Field>
          <Field label="Lugar"><TextInput value={f.lugar} onChange={(e) => set("lugar", e.target.value)} /></Field>
          <Field label="Duración (min)"><TextInput type="number" value={f.duracion} onChange={(e) => set("duracion", Number(e.target.value))} /></Field>
          <Field label="Número de jugadores"><TextInput type="number" value={f.numJugadores} onChange={(e) => set("numJugadores", Number(e.target.value))} /></Field>
          <Field label="Objetivo general" className="sm:col-span-2"><TextArea value={f.objetivoGeneral} onChange={(e) => set("objetivoGeneral", e.target.value)} /></Field>
        </div>
      )}

      {tab === "objetivos" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Físicos"><TextArea value={f.objetivos.fisicos} onChange={(e) => setNested("objetivos", "fisicos", e.target.value)} /></Field>
          <Field label="Técnicos"><TextArea value={f.objetivos.tecnicos} onChange={(e) => setNested("objetivos", "tecnicos", e.target.value)} /></Field>
          <Field label="Tácticos"><TextArea value={f.objetivos.tacticos} onChange={(e) => setNested("objetivos", "tacticos", e.target.value)} /></Field>
          <Field label="Estratégicos"><TextArea value={f.objetivos.estrategicos} onChange={(e) => setNested("objetivos", "estrategicos", e.target.value)} /></Field>
          <Field label="Psicológicos"><TextArea value={f.objetivos.psicologicos} onChange={(e) => setNested("objetivos", "psicologicos", e.target.value)} /></Field>
        </div>
      )}

      {tab === "calentamiento" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Actividad"><TextInput value={f.calentamiento.actividad} onChange={(e) => setNested("calentamiento", "actividad", e.target.value)} /></Field>
          <Field label="Objetivo"><TextInput value={f.calentamiento.objetivo} onChange={(e) => setNested("calentamiento", "objetivo", e.target.value)} /></Field>
          <Field label="Materiales"><TextInput value={f.calentamiento.materiales} onChange={(e) => setNested("calentamiento", "materiales", e.target.value)} /></Field>
          <Field label="Tiempo (min)"><TextInput type="number" value={f.calentamiento.tiempo} onChange={(e) => setNested("calentamiento", "tiempo", Number(e.target.value))} /></Field>
          <Field label="Notas / observaciones" className="sm:col-span-2"><TextArea value={f.calentamiento.notas} onChange={(e) => setNested("calentamiento", "notas", e.target.value)} /></Field>
        </div>
      )}

      {tab === "tareas" && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Select onChange={(e) => { if (e.target.value) addTaskFromLibrary(e.target.value); e.target.value = ""; }} className="w-auto">
              <option value="">+ Añadir desde biblioteca de tareas</option>
              {tasks.map((t) => <option key={t.id} value={t.id}>{t.nombre} ({t.codigo})</option>)}
            </Select>
            <Btn variant="ghost" icon={Plus} onClick={addBlankTask}>Tarea en blanco</Btn>
          </div>
          {f.tareas.map((t) => (
            <Card key={t.id} className="p-3" style={{ background: "#F7F8FA" }}>
              <div className="flex justify-end"><button onClick={() => removeTask(t.id)}><Trash2 size={14} style={{ color: T.redLight }} /></button></div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <TextInput placeholder="Nombre" value={t.nombre} onChange={(e) => updateTask(t.id, "nombre", e.target.value)} className="text-xs" />
                <TextInput placeholder="Código" value={t.codigo} onChange={(e) => updateTask(t.id, "codigo", e.target.value)} className="text-xs" />
                <TextInput placeholder="Fundamento" value={t.fundamento} onChange={(e) => updateTask(t.id, "fundamento", e.target.value)} className="text-xs" />
                <TextInput placeholder="Materiales" value={t.materiales} onChange={(e) => updateTask(t.id, "materiales", e.target.value)} className="text-xs" />
                <TextInput placeholder="Tiempo (min)" type="number" value={t.tiempo} onChange={(e) => updateTask(t.id, "tiempo", e.target.value)} className="text-xs" />
                <TextInput placeholder="Nº jugadores" value={t.jugadores} onChange={(e) => updateTask(t.id, "jugadores", e.target.value)} className="text-xs" />
                <TextInput placeholder="Espacio" value={t.espacio} onChange={(e) => updateTask(t.id, "espacio", e.target.value)} className="text-xs" />
                <TextInput placeholder="Reglas" value={t.reglas} onChange={(e) => updateTask(t.id, "reglas", e.target.value)} className="text-xs" />
                <TextInput placeholder="Organización" value={t.organizacion} onChange={(e) => updateTask(t.id, "organizacion", e.target.value)} className="text-xs" />
              </div>
              <TextArea placeholder="Descripción / notas" value={t.descripcion} onChange={(e) => updateTask(t.id, "descripcion", e.target.value)} className="text-xs mt-2" />
            </Card>
          ))}
          {!f.tareas.length && <div className="text-xs" style={{ color: T.muted }}>Añade al menos una tarea a la parte principal.</div>}
        </div>
      )}

      {tab === "juego" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Tipo">
            <Select value={f.aplicacionJuego.tipo} onChange={(e) => setNested("aplicacionJuego", "tipo", e.target.value)}>
              <option>Partido condicionado</option><option>Juego reducido</option><option>Situación táctica</option>
            </Select>
          </Field>
          <Field label="Tiempo (min)"><TextInput type="number" value={f.aplicacionJuego.tiempo} onChange={(e) => setNested("aplicacionJuego", "tiempo", Number(e.target.value))} /></Field>
          <Field label="Objetivo" className="sm:col-span-2"><TextInput value={f.aplicacionJuego.objetivo} onChange={(e) => setNested("aplicacionJuego", "objetivo", e.target.value)} /></Field>
          <Field label="Observaciones" className="sm:col-span-2"><TextArea value={f.aplicacionJuego.observaciones} onChange={(e) => setNested("aplicacionJuego", "observaciones", e.target.value)} /></Field>
        </div>
      )}

      {tab === "calma" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Estiramientos"><TextInput value={f.vueltaCalma.estiramientos} onChange={(e) => setNested("vueltaCalma", "estiramientos", e.target.value)} /></Field>
          <Field label="Actividad pasiva"><TextInput value={f.vueltaCalma.actividad} onChange={(e) => setNested("vueltaCalma", "actividad", e.target.value)} /></Field>
          <Field label="Tiempo (min)"><TextInput type="number" value={f.vueltaCalma.tiempo} onChange={(e) => setNested("vueltaCalma", "tiempo", Number(e.target.value))} /></Field>
          <Field label="Observaciones"><TextInput value={f.vueltaCalma.observaciones} onChange={(e) => setNested("vueltaCalma", "observaciones", e.target.value)} /></Field>
          <Field label="Notas del entrenador" className="sm:col-span-2"><TextArea value={f.notas} onChange={(e) => set("notas", e.target.value)} /></Field>
        </div>
      )}

      {tab === "asistencia" && (
        <div className="flex flex-col gap-1.5">
          {players.map((p) => {
            const row = f.asistencia.find((a) => a.jugadorId === p.id);
            return (
              <div key={p.id} className="flex items-center gap-2 p-2 rounded-lg" style={{ background: "#F7F8FA" }}>
                <div className="text-sm font-bold flex-1 truncate" style={{ color: T.navy }}>{p.apodo || p.nombre}</div>
                <Select value={row.estado} onChange={(e) => setF((prev) => ({ ...prev, asistencia: prev.asistencia.map((a) => a.jugadorId === p.id ? { ...a, estado: e.target.value } : a) }))} className="w-auto text-xs py-1">
                  <option>Presente</option><option>Ausente justificado</option><option>Ausente no justificado</option>
                </Select>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex justify-between gap-2 mt-5 sticky bottom-0 bg-white -mx-5 px-5 py-3 border-t" style={{ borderColor: T.line }}>
        {onDelete ? <Btn variant="danger" icon={Trash2} onClick={onDelete}>Eliminar</Btn> : <div />}
        <div className="flex gap-2">
          <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
          <Btn variant="accent" icon={Save} onClick={() => onSave(f)}>Guardar sesión</Btn>
        </div>
      </div>
    </Modal>
  );
}

/* ============================================================
   TAREAS (biblioteca)
   ============================================================ */

function Tareas({ ctx }) {
  const { tasks, updateTasks, config } = ctx;
  const [showNew, setShowNew] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("Todas");
  const [maxTime, setMaxTime] = useState("");
  const [minPlayers, setMinPlayers] = useState("");

  const filtered = tasks.filter((t) => {
    if (q && !`${t.nombre} ${t.codigo} ${t.objTactico} ${t.objTecnico}`.toLowerCase().includes(q.toLowerCase())) return false;
    if (cat !== "Todas" && t.categoria !== cat) return false;
    if (maxTime && Number(t.duracion) > Number(maxTime)) return false;
    if (minPlayers && Number(t.maxJugadores) < Number(minPlayers)) return false;
    return true;
  });

  return (
    <div className="flex flex-col gap-5 max-w-5xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><Eyebrow>Biblioteca de tareas</Eyebrow><h1 className="text-2xl font-extrabold" style={{ color: T.navy }}>{tasks.length} tareas guardadas</h1></div>
        <Btn icon={Plus} variant="accent" onClick={() => setShowNew(true)}>Nueva tarea</Btn>
      </div>

      <div className="flex flex-wrap gap-2">
        <TextInput placeholder="Buscar por nombre, código u objetivo…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
        <Select value={cat} onChange={(e) => setCat(e.target.value)} className="w-auto"><option>Todas</option>{config.taskCategories.map((c) => <option key={c}>{c}</option>)}</Select>
        <TextInput placeholder="Duración máx (min)" type="number" value={maxTime} onChange={(e) => setMaxTime(e.target.value)} className="w-40" />
        <TextInput placeholder="Nº jugadores mín." type="number" value={minPlayers} onChange={(e) => setMinPlayers(e.target.value)} className="w-40" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filtered.map((t) => (
          <Card key={t.id} className="p-4 cursor-pointer hover:shadow-md transition" onClick={() => setEditTask(t)}>
            <div className="flex items-start justify-between">
              <div>
                <div className="font-extrabold" style={{ color: T.navy }}>{t.nombre}</div>
                <div className="text-xs" style={{ color: T.muted }}>{t.codigo} · {t.categoria}</div>
              </div>
              <Pill>{t.duracion} min</Pill>
            </div>
            <div className="text-xs mt-2 line-clamp-2" style={{ color: T.text }}>{t.descripcion}</div>
            <div className="flex gap-1.5 flex-wrap mt-2">
              <Pill color={T.green} bg="#E7F6ED">{t.minJugadores}-{t.maxJugadores} jug.</Pill>
              <Pill>{t.espacio}</Pill>
            </div>
          </Card>
        ))}
        {!filtered.length && <div className="text-sm" style={{ color: T.muted }}>No se encontraron tareas con estos filtros.</div>}
      </div>

      {showNew && <TaskForm ctx={ctx} onClose={() => setShowNew(false)} onSave={(t) => { updateTasks((prev) => [...prev, t]); setShowNew(false); }} />}
      {editTask && <TaskForm ctx={ctx} initial={editTask} onClose={() => setEditTask(null)}
        onSave={(t) => { updateTasks((prev) => prev.map((x) => x.id === t.id ? t : x)); setEditTask(null); }}
        onDelete={() => { if (confirm("¿Eliminar esta tarea?")) { updateTasks((prev) => prev.filter((x) => x.id !== editTask.id)); setEditTask(null); } }} />}
    </div>
  );
}

function TaskForm({ ctx, initial, onClose, onSave, onDelete }) {
  const { config } = ctx;
  const [f, setF] = useState(initial || {
    id: uid(), nombre: "", codigo: "", categoria: config.taskCategories[0], edad: "", minJugadores: "", maxJugadores: "",
    espacio: "", duracion: "", objFisico: "", objTecnico: "", objTactico: "", objPsicologico: "", materiales: "",
    descripcion: "", reglas: "", variantes: "", progresiones: "", regresiones: "", observaciones: "",
  });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  return (
    <Modal title={initial ? "Editar tarea" : "Nueva tarea"} onClose={onClose} wide>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Nombre"><TextInput value={f.nombre} onChange={(e) => set("nombre", e.target.value)} /></Field>
        <Field label="Código"><TextInput value={f.codigo} onChange={(e) => set("codigo", e.target.value)} /></Field>
        <Field label="Categoría"><Select value={f.categoria} onChange={(e) => set("categoria", e.target.value)}>{config.taskCategories.map((c) => <option key={c}>{c}</option>)}</Select></Field>
        <Field label="Edad / categoría recomendada"><TextInput value={f.edad} onChange={(e) => set("edad", e.target.value)} /></Field>
        <Field label="Nº mínimo jugadores"><TextInput type="number" value={f.minJugadores} onChange={(e) => set("minJugadores", e.target.value)} /></Field>
        <Field label="Nº máximo jugadores"><TextInput type="number" value={f.maxJugadores} onChange={(e) => set("maxJugadores", e.target.value)} /></Field>
        <Field label="Espacio"><TextInput value={f.espacio} onChange={(e) => set("espacio", e.target.value)} /></Field>
        <Field label="Duración (min)"><TextInput type="number" value={f.duracion} onChange={(e) => set("duracion", e.target.value)} /></Field>
        <Field label="Objetivo físico"><TextInput value={f.objFisico} onChange={(e) => set("objFisico", e.target.value)} /></Field>
        <Field label="Objetivo técnico"><TextInput value={f.objTecnico} onChange={(e) => set("objTecnico", e.target.value)} /></Field>
        <Field label="Objetivo táctico"><TextInput value={f.objTactico} onChange={(e) => set("objTactico", e.target.value)} /></Field>
        <Field label="Objetivo psicológico"><TextInput value={f.objPsicologico} onChange={(e) => set("objPsicologico", e.target.value)} /></Field>
        <Field label="Materiales" className="sm:col-span-2"><TextInput value={f.materiales} onChange={(e) => set("materiales", e.target.value)} /></Field>
        <Field label="Descripción" className="sm:col-span-2"><TextArea value={f.descripcion} onChange={(e) => set("descripcion", e.target.value)} /></Field>
        <Field label="Reglas"><TextArea value={f.reglas} onChange={(e) => set("reglas", e.target.value)} /></Field>
        <Field label="Variantes"><TextArea value={f.variantes} onChange={(e) => set("variantes", e.target.value)} /></Field>
        <Field label="Progresiones"><TextArea value={f.progresiones} onChange={(e) => set("progresiones", e.target.value)} /></Field>
        <Field label="Regresiones"><TextArea value={f.regresiones} onChange={(e) => set("regresiones", e.target.value)} /></Field>
        <Field label="Observaciones" className="sm:col-span-2"><TextArea value={f.observaciones} onChange={(e) => set("observaciones", e.target.value)} /></Field>
      </div>
      <div className="flex justify-between gap-2 mt-5 sticky bottom-0 bg-white -mx-5 px-5 py-3 border-t" style={{ borderColor: T.line }}>
        {onDelete ? <Btn variant="danger" icon={Trash2} onClick={onDelete}>Eliminar</Btn> : <div />}
        <div className="flex gap-2"><Btn variant="ghost" onClick={onClose}>Cancelar</Btn><Btn variant="accent" icon={Save} onClick={() => onSave(f)}>Guardar tarea</Btn></div>
      </div>
    </Modal>
  );
}

/* ============================================================
   CALENDARIO
   ============================================================ */

function CalendarioView({ ctx }) {
  const { matches, trainings } = ctx;
  const events = [
    ...matches.map((m) => ({ fecha: m.fecha, tipo: "Partido", label: `vs ${m.rival} (${m.resultadoFinal})`, color: T.red })),
    ...trainings.map((t) => ({ fecha: t.fecha, tipo: "Entrenamiento", label: t.objetivoGeneral, color: T.green })),
  ].sort((a, b) => a.fecha.localeCompare(b.fecha));

  return (
    <div className="flex flex-col gap-5 max-w-3xl">
      <div><Eyebrow>Calendario</Eyebrow><h1 className="text-2xl font-extrabold" style={{ color: T.navy }}>Próximos eventos</h1></div>
      <div className="flex flex-col gap-2">
        {events.map((e, i) => (
          <Card key={i} className="p-3 flex items-center gap-3">
            <div className="w-2 h-8 rounded-full shrink-0" style={{ background: e.color }} />
            <div className="text-xs font-bold w-28 shrink-0" style={{ color: T.muted }}>{e.fecha}</div>
            <Pill color={e.color} bg={e.color === T.red ? "#FCEAEC" : "#E7F6ED"}>{e.tipo}</Pill>
            <div className="text-sm truncate" style={{ color: T.text }}>{e.label}</div>
          </Card>
        ))}
        {!events.length && <div className="text-sm" style={{ color: T.muted }}>Sin eventos programados.</div>}
      </div>
    </div>
  );
}

/* ============================================================
   ESTADÍSTICAS
   ============================================================ */

function Estadisticas({ ctx }) {
  const { players, matches } = ctx;
  const ts = computeTeamStats(matches);
  const topScorers = [...players].sort((a, b) => b.stats.goles - a.stats.goles).slice(0, 5);
  const topAssists = [...players].sort((a, b) => b.stats.asistencias - a.stats.asistencias).slice(0, 5);
  const sortedMatches = [...matches].sort((a, b) => a.fecha.localeCompare(b.fecha));

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <div><Eyebrow>Estadísticas</Eyebrow><h1 className="text-2xl font-extrabold" style={{ color: T.navy }}>Resumen del equipo</h1></div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <StatTile label="Jugados" value={ts.jugados} />
        <StatTile label="% Victorias" value={ts.jugados ? `${Math.round((ts.v / ts.jugados) * 100)}%` : "-"} accent={T.green} />
        <StatTile label="Goles/partido" value={ts.jugados ? (ts.gf / ts.jugados).toFixed(1) : "-"} />
        <StatTile label="Goles favor" value={ts.gf} />
        <StatTile label="Goles contra" value={ts.gc} />
      </div>

      <Card className="p-4">
        <Eyebrow>Evolución de resultados por jornada</Eyebrow>
        <div className="flex items-end gap-2 h-28 mt-3">
          {sortedMatches.map((m, i) => {
            const [gf, gc] = (m.resultadoFinal || "0-0").split("-").map(Number);
            const c = gf > gc ? T.green : gf === gc ? T.yellow : T.redLight;
            return <div key={i} className="flex-1 rounded-t-md" style={{ height: `${Math.max(gf, gc, 1) * 18}px`, background: c }} title={`${m.rival}: ${m.resultadoFinal}`} />;
          })}
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Card className="p-4">
          <Eyebrow>Máximos goleadores</Eyebrow>
          <div className="flex flex-col gap-2 mt-3">
            {topScorers.map((p) => (
              <div key={p.id} className="flex items-center justify-between text-sm">
                <span className="font-bold" style={{ color: T.navy }}>{p.apodo || p.nombre}</span>
                <span className="font-extrabold tabular-nums" style={{ color: T.red }}>{p.stats.goles}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-4">
          <Eyebrow>Máximos asistentes</Eyebrow>
          <div className="flex flex-col gap-2 mt-3">
            {topAssists.map((p) => (
              <div key={p.id} className="flex items-center justify-between text-sm">
                <span className="font-bold" style={{ color: T.navy }}>{p.apodo || p.nombre}</span>
                <span className="font-extrabold tabular-nums" style={{ color: T.green }}>{p.stats.asistencias}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ============================================================
   CONFIGURACIÓN
   ============================================================ */

function TagEditor({ items, onChange, placeholder }) {
  const [val, setVal] = useState("");
  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {items.map((it, i) => (
          <span key={i} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: "#EEF2F8", color: T.navy }}>
            {it}<button onClick={() => onChange(items.filter((_, idx) => idx !== i))}><X size={12} /></button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <TextInput value={val} onChange={(e) => setVal(e.target.value)} placeholder={placeholder}
          onKeyDown={(e) => { if (e.key === "Enter" && val.trim()) { onChange([...items, val.trim()]); setVal(""); } }} />
        <Btn variant="ghost" onClick={() => { if (val.trim()) { onChange([...items, val.trim()]); setVal(""); } }}>Añadir</Btn>
      </div>
    </div>
  );
}

function Configuracion({ ctx }) {
  const { config, updateConfig } = ctx;
  const [tab, setTab] = useState("equipo");
  const set = (k, v) => updateConfig((p) => ({ ...p, [k]: v }));

  const tabs = [["equipo", "Equipo"], ["posiciones", "Posiciones"], ["sistemas", "Sistemas tácticos"], ["ranking", "Fórmula ranking"], ["estados", "Estados jugador"], ["campos", "Campos personalizados"], ["datos", "Copia de seguridad"]];

  return (
    <div className="flex flex-col gap-5 max-w-3xl">
      <div><Eyebrow>Configuración</Eyebrow><h1 className="text-2xl font-extrabold" style={{ color: T.navy }}>Ajustes de la plataforma</h1>
        <p className="text-sm mt-1" style={{ color: T.muted }}>Todo lo que ves aquí puede modificarse en cualquier momento. Nada está bloqueado de forma permanente.</p>
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {tabs.map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className="px-3 py-1.5 rounded-xl text-xs font-bold"
            style={{ background: tab === k ? T.navy : "#fff", color: tab === k ? "#fff" : T.muted, border: `1px solid ${tab === k ? T.navy : T.line}` }}>{l}</button>
        ))}
      </div>

      {tab === "equipo" && (
        <Card className="p-5 flex flex-col gap-3">
          <Field label="Nombre del equipo"><TextInput value={config.teamName} onChange={(e) => set("teamName", e.target.value)} /></Field>
          <Field label="Categoría"><TextInput value={config.category} onChange={(e) => set("category", e.target.value)} /></Field>
          <Field label="Temporada activa"><TextInput value={config.season} onChange={(e) => set("season", e.target.value)} /></Field>
          <Field label="Tipo de fútbol">
            <Select value={config.footballType} onChange={(e) => set("footballType", e.target.value)}>{Object.keys(config.tacticalSystems).map((t) => <option key={t}>{t}</option>)}</Select>
          </Field>
        </Card>
      )}

      {tab === "posiciones" && (
        <Card className="p-5">
          <div className="text-sm mb-3" style={{ color: T.muted }}>Estas posiciones aparecen en las fichas de jugador y en las convocatorias.</div>
          <TagEditor items={config.positions} onChange={(v) => set("positions", v)} placeholder="Nueva posición…" />
        </Card>
      )}

      {tab === "sistemas" && (
        <Card className="p-5 flex flex-col gap-4">
          {Object.entries(config.tacticalSystems).map(([type, systems]) => (
            <div key={type}>
              <div className="text-xs font-bold uppercase mb-2" style={{ color: T.muted }}>{type}</div>
              <TagEditor items={systems} onChange={(v) => set("tacticalSystems", { ...config.tacticalSystems, [type]: v })} placeholder="Nuevo sistema (ej. 1-4-3-3)…" />
            </div>
          ))}
        </Card>
      )}

      {tab === "ranking" && (
        <Card className="p-5 flex flex-col gap-4">
          <div className="text-sm" style={{ color: T.muted }}>Ajusta el peso (%) de cada variable en el cálculo automático del ranking interno. El entrenador siempre puede sobrescribir manualmente el valor de un jugador concreto.</div>
          {Object.entries(config.rankingWeights).map(([k, v]) => (
            <Field key={k} label={k}>
              <div className="flex items-center gap-3">
                <input type="range" min="-50" max="100" value={v} onChange={(e) => set("rankingWeights", { ...config.rankingWeights, [k]: Number(e.target.value) })} className="flex-1" />
                <span className="font-bold tabular-nums w-12 text-right" style={{ color: T.navy }}>{v}%</span>
              </div>
            </Field>
          ))}
        </Card>
      )}

      {tab === "estados" && (
        <Card className="p-5">
          <div className="text-sm mb-3" style={{ color: T.muted }}>Estados disponibles para la ficha de disponibilidad de cada jugador.</div>
          <TagEditor items={config.playerStates} onChange={(v) => set("playerStates", v)} placeholder="Nuevo estado…" />
        </Card>
      )}

      {tab === "campos" && (
        <Card className="p-5 flex flex-col gap-4">
          <div className="text-sm" style={{ color: T.muted }}>Añade campos personalizados sin modificar el código. Estos campos quedan disponibles como referencia para ampliar fichas de jugador en el futuro (por ejemplo: dominancia, perfil, velocidad punta).</div>
          <TagEditor items={config.customFields} onChange={(v) => set("customFields", v)} placeholder="Nuevo campo personalizado…" />
        </Card>
      )}

      {tab === "datos" && <BackupPanel ctx={ctx} />}
    </div>
  );
}

function BackupPanel({ ctx }) {
  const { config, players, matches, trainings, tasks, rivals, season, planning,
    updateConfig, updatePlayers, updateMatches, updateTrainings, updateTasks, updateRivals, updateSeason, updatePlanning } = ctx;
  const fileInputRef = useRef(null);
  const [msg, setMsg] = useState("");

  const exportData = () => {
    const data = { config, players, matches, trainings, tasks, rivals, season, planning, exportadoEl: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `pz-backup-${todayISO()}.json`; a.click();
    URL.revokeObjectURL(url);
    setMsg("Copia exportada. Guarda el archivo donde lo encuentres fácil.");
  };

  const importData = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.config) updateConfig(data.config);
        if (data.players) updatePlayers(data.players);
        if (data.matches) updateMatches(data.matches);
        if (data.trainings) updateTrainings(data.trainings);
        if (data.tasks) updateTasks(data.tasks);
        if (data.rivals) updateRivals(data.rivals);
        if (data.season) updateSeason(data.season);
        if (data.planning) updatePlanning(data.planning);
        setMsg("Datos importados correctamente en este dispositivo.");
      } catch {
        setMsg("Ese archivo no es una copia de seguridad válida de PZ.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <Card className="p-5 flex flex-col gap-4">
      <div className="text-sm" style={{ color: T.muted }}>
        Los datos se guardan únicamente en este navegador/dispositivo. Usa esta copia de seguridad para
        pasar tu información de un dispositivo a otro (por ejemplo, del móvil a la tablet) o para no perder
        nada si cambias de equipo o navegador.
      </div>
      <div className="flex flex-wrap gap-2">
        <Btn variant="accent" icon={Save} onClick={exportData}>Exportar copia de seguridad</Btn>
        <Btn variant="ghost" icon={Plus} onClick={() => fileInputRef.current?.click()}>Importar copia de seguridad</Btn>
        <input ref={fileInputRef} type="file" accept="application/json" className="hidden"
          onChange={(e) => { if (e.target.files?.[0]) importData(e.target.files[0]); e.target.value = ""; }} />
      </div>
      {msg && <div className="text-xs font-bold" style={{ color: T.green }}>{msg}</div>}
      <div className="text-[11px] mt-1" style={{ color: T.muted }}>
        Importar una copia reemplaza los datos actuales de este dispositivo por los del archivo. Exporta antes si no estás seguro.
      </div>
    </Card>
  );
}

/* ============================================================
   ANÁLISIS DEL RIVAL
   ============================================================ */

function RivalModule({ ctx }) {
  const { rivals, updateRivals, matches } = ctx;
  const [openId, setOpenId] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const editing = rivals.find((r) => r.id === openId);

  return (
    <div className="flex flex-col gap-5 max-w-4xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><Eyebrow>Análisis del rival</Eyebrow><h1 className="text-2xl font-extrabold" style={{ color: T.navy }}>{rivals.length} rivales registrados</h1></div>
        <Btn icon={Plus} variant="accent" onClick={() => setShowNew(true)}>Nuevo rival</Btn>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {rivals.map((r) => {
          const hist = matches.filter((m) => m.rival === r.nombre);
          return (
            <Card key={r.id} className="p-4 cursor-pointer hover:shadow-md transition" onClick={() => setOpenId(r.id)}>
              <div className="font-extrabold" style={{ color: T.navy }}>{r.nombre}</div>
              <div className="text-xs mt-0.5" style={{ color: T.muted }}>Sistema habitual: {r.sistemas || "-"}</div>
              <div className="text-xs mt-2 line-clamp-2" style={{ color: T.text }}>{r.fortalezas}</div>
              <Pill className="mt-2">{hist.length} enfrentamiento(s) registrado(s)</Pill>
            </Card>
          );
        })}
        {!rivals.length && <div className="text-sm" style={{ color: T.muted }}>Todavía no hay rivales registrados.</div>}
      </div>
      {showNew && <RivalForm onClose={() => setShowNew(false)} onSave={(r) => { updateRivals((prev) => [...prev, r]); setShowNew(false); }} />}
      {editing && <RivalForm initial={editing} matches={matches.filter((m) => m.rival === editing.nombre)}
        onClose={() => setOpenId(null)}
        onSave={(r) => { updateRivals((prev) => prev.map((x) => x.id === r.id ? r : x)); setOpenId(null); }}
        onDelete={() => { if (confirm("¿Eliminar este rival?")) { updateRivals((prev) => prev.filter((x) => x.id !== editing.id)); setOpenId(null); } }} />}
    </div>
  );
}

function RivalForm({ initial, matches, onClose, onSave, onDelete }) {
  const [f, setF] = useState(initial || {
    id: uid(), nombre: "", sistemas: "", fortalezas: "", debilidades: "", jugadoresRelevantes: "",
    ofensivo: "", defensivo: "", transiciones: "", balonParado: "", observaciones: "", historial: "",
  });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  return (
    <Modal title={initial ? "Editar rival" : "Nuevo rival"} onClose={onClose} wide>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Rival" className="sm:col-span-2"><TextInput value={f.nombre} onChange={(e) => set("nombre", e.target.value)} /></Field>
        <Field label="Sistemas utilizados"><TextInput value={f.sistemas} onChange={(e) => set("sistemas", e.target.value)} /></Field>
        <Field label="Jugadores relevantes"><TextInput value={f.jugadoresRelevantes} onChange={(e) => set("jugadoresRelevantes", e.target.value)} /></Field>
        <Field label="Fortalezas"><TextArea value={f.fortalezas} onChange={(e) => set("fortalezas", e.target.value)} /></Field>
        <Field label="Debilidades"><TextArea value={f.debilidades} onChange={(e) => set("debilidades", e.target.value)} /></Field>
        <Field label="Comportamientos ofensivos"><TextArea value={f.ofensivo} onChange={(e) => set("ofensivo", e.target.value)} /></Field>
        <Field label="Comportamientos defensivos"><TextArea value={f.defensivo} onChange={(e) => set("defensivo", e.target.value)} /></Field>
        <Field label="Transiciones"><TextArea value={f.transiciones} onChange={(e) => set("transiciones", e.target.value)} /></Field>
        <Field label="Balón parado"><TextArea value={f.balonParado} onChange={(e) => set("balonParado", e.target.value)} /></Field>
        <Field label="Observaciones" className="sm:col-span-2"><TextArea value={f.observaciones} onChange={(e) => set("observaciones", e.target.value)} /></Field>
      </div>
      {matches && matches.length > 0 && (
        <div className="mt-4">
          <Eyebrow>Historial de enfrentamientos (automático, según partidos registrados)</Eyebrow>
          <div className="flex flex-col gap-1.5 mt-2">
            {matches.map((m) => <div key={m.id} className="text-sm" style={{ color: T.text }}>{m.fecha} · {m.resultadoFinal}</div>)}
          </div>
        </div>
      )}
      <div className="flex justify-between gap-2 mt-5 sticky bottom-0 bg-white -mx-5 px-5 py-3 border-t" style={{ borderColor: T.line }}>
        {onDelete ? <Btn variant="danger" icon={Trash2} onClick={onDelete}>Eliminar</Btn> : <div />}
        <div className="flex gap-2"><Btn variant="ghost" onClick={onClose}>Cancelar</Btn><Btn variant="accent" icon={Save} onClick={() => onSave(f)}>Guardar rival</Btn></div>
      </div>
    </Modal>
  );
}

/* ============================================================
   TEMPORADA — anual → mensual → semanal
   ============================================================ */

function TemporadaModule({ ctx }) {
  const { season, updateSeason, matches, trainings } = ctx;
  const [tab, setTab] = useState("info");
  const [editWeek, setEditWeek] = useState(null);
  if (!season) return null;
  const set = (k, v) => updateSeason((p) => ({ ...p, [k]: v }));

  const weekMatches = (w) => {
    const start = new Date(w.fechaInicio), end = new Date(start); end.setDate(end.getDate() + 7);
    return matches.filter((m) => { const d = new Date(m.fecha); return d >= start && d < end; });
  };
  const weekTrainings = (w) => {
    const start = new Date(w.fechaInicio), end = new Date(start); end.setDate(end.getDate() + 7);
    return trainings.filter((t) => { const d = new Date(t.fecha); return d >= start && d < end; });
  };

  const addWeek = () => updateSeason((p) => ({ ...p, weeks: [...p.weeks, { id: uid(), numero: p.weeks.length + 1, fechaInicio: todayISO(), objetivo: "", contenidoFisico: "", contenidoTecnico: "", contenidoTactico: "", contenidoPsicologico: "", cargaPrevista: "Media" }] }));
  const saveWeek = (w) => updateSeason((p) => ({ ...p, weeks: p.weeks.map((x) => x.id === w.id ? w : x) }));
  const removeWeek = (id) => updateSeason((p) => ({ ...p, weeks: p.weeks.filter((x) => x.id !== id) }));

  return (
    <div className="flex flex-col gap-5 max-w-4xl">
      <div><Eyebrow>Temporada</Eyebrow><h1 className="text-2xl font-extrabold" style={{ color: T.navy }}>{season.competicion} · {season.categoria}</h1></div>
      <div className="flex gap-1.5">
        {[["info", "Anual"], ["semanas", "Mensual / Semanal"]].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className="px-3.5 py-2 rounded-xl text-sm font-bold"
            style={{ background: tab === k ? T.navy : "#fff", color: tab === k ? "#fff" : T.muted, border: `1px solid ${tab === k ? T.navy : T.line}` }}>{l}</button>
        ))}
      </div>

      {tab === "info" && (
        <Card className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Equipo"><TextInput value={season.equipo} onChange={(e) => set("equipo", e.target.value)} /></Field>
          <Field label="Categoría"><TextInput value={season.categoria} onChange={(e) => set("categoria", e.target.value)} /></Field>
          <Field label="Competición"><TextInput value={season.competicion} onChange={(e) => set("competicion", e.target.value)} /></Field>
          <Field label="Fecha de inicio"><TextInput type="date" value={season.fechaInicio} onChange={(e) => set("fechaInicio", e.target.value)} /></Field>
          <Field label="Fecha de finalización"><TextInput type="date" value={season.fechaFin} onChange={(e) => set("fechaFin", e.target.value)} /></Field>
          <Field label="Objetivos generales" className="sm:col-span-2"><TextArea value={season.objetivosGenerales} onChange={(e) => set("objetivosGenerales", e.target.value)} /></Field>
          <Field label="Objetivos deportivos"><TextArea value={season.objetivosDeportivos} onChange={(e) => set("objetivosDeportivos", e.target.value)} /></Field>
          <Field label="Objetivos formativos"><TextArea value={season.objetivosFormativos} onChange={(e) => set("objetivosFormativos", e.target.value)} /></Field>
        </Card>
      )}

      {tab === "semanas" && (
        <div className="flex flex-col gap-3">
          <div className="flex justify-end"><Btn variant="accent" icon={Plus} onClick={addWeek}>Añadir semana</Btn></div>
          {season.weeks.map((w) => (
            <Card key={w.id} className="p-4 cursor-pointer hover:shadow-md transition" onClick={() => setEditWeek(w)}>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <div className="font-extrabold" style={{ color: T.navy }}>Semana {w.numero} · {w.fechaInicio}</div>
                  <div className="text-xs" style={{ color: T.muted }}>{w.objetivo}</div>
                </div>
                <div className="flex gap-1.5"><Pill>{weekMatches(w).length} partido(s)</Pill><Pill color={T.green} bg="#E7F6ED">{weekTrainings(w).length} sesión(es)</Pill><Pill color={T.yellow} bg="#FFF6DE">Carga: {w.cargaPrevista}</Pill></div>
              </div>
            </Card>
          ))}
          {!season.weeks.length && <div className="text-sm" style={{ color: T.muted }}>Sin semanas planificadas todavía.</div>}
        </div>
      )}

      {editWeek && (
        <Modal title={`Semana ${editWeek.numero}`} onClose={() => setEditWeek(null)}>
          <div className="flex flex-col gap-3">
            <Field label="Fecha de inicio"><TextInput type="date" value={editWeek.fechaInicio} onChange={(e) => setEditWeek({ ...editWeek, fechaInicio: e.target.value })} /></Field>
            <Field label="Objetivo semanal"><TextInput value={editWeek.objetivo} onChange={(e) => setEditWeek({ ...editWeek, objetivo: e.target.value })} /></Field>
            <Field label="Contenido físico"><TextInput value={editWeek.contenidoFisico} onChange={(e) => setEditWeek({ ...editWeek, contenidoFisico: e.target.value })} /></Field>
            <Field label="Contenido técnico"><TextInput value={editWeek.contenidoTecnico} onChange={(e) => setEditWeek({ ...editWeek, contenidoTecnico: e.target.value })} /></Field>
            <Field label="Contenido táctico"><TextInput value={editWeek.contenidoTactico} onChange={(e) => setEditWeek({ ...editWeek, contenidoTactico: e.target.value })} /></Field>
            <Field label="Contenido psicológico"><TextInput value={editWeek.contenidoPsicologico} onChange={(e) => setEditWeek({ ...editWeek, contenidoPsicologico: e.target.value })} /></Field>
            <Field label="Carga prevista">
              <Select value={editWeek.cargaPrevista} onChange={(e) => setEditWeek({ ...editWeek, cargaPrevista: e.target.value })}><option>Baja</option><option>Media</option><option>Media-alta</option><option>Alta</option></Select>
            </Field>
          </div>
          <div className="flex justify-between gap-2 mt-5 sticky bottom-0 bg-white -mx-5 px-5 py-3 border-t" style={{ borderColor: T.line }}>
            <Btn variant="danger" icon={Trash2} onClick={() => { removeWeek(editWeek.id); setEditWeek(null); }}>Eliminar semana</Btn>
            <div className="flex gap-2"><Btn variant="ghost" onClick={() => setEditWeek(null)}>Cancelar</Btn><Btn variant="accent" icon={Save} onClick={() => { saveWeek(editWeek); setEditWeek(null); }}>Guardar</Btn></div>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ============================================================
   PLANIFICACIÓN — física / técnica / táctica / psicológica
   ============================================================ */

function PlanificacionModule({ ctx }) {
  const { planning, updatePlanning, config } = ctx;
  const [tab, setTab] = useState("fisica");
  const [modal, setModal] = useState(null); // {area, item|null}

  const areaLabels = { fisica: "Física", tecnica: "Técnica", tactica: "Táctica", psicologica: "Psicológica" };
  const areaIcons = { fisica: Zap, tecnica: Target, tactica: ClipboardList, psicologica: Brain };

  const addItem = (area, item) => updatePlanning((p) => ({ ...p, [area]: [...p[area], item] }));
  const saveItem = (area, item) => updatePlanning((p) => ({ ...p, [area]: p[area].map((x) => x.id === item.id ? item : x) }));
  const removeItem = (area, id) => updatePlanning((p) => ({ ...p, [area]: p[area].filter((x) => x.id !== id) }));

  return (
    <div className="flex flex-col gap-5 max-w-4xl">
      <div><Eyebrow>Planificación</Eyebrow><h1 className="text-2xl font-extrabold" style={{ color: T.navy }}>Física · Técnica · Táctica · Psicológica</h1>
        <p className="text-sm mt-1" style={{ color: T.muted }}>Herramienta de seguimiento y planificación deportiva del cuerpo técnico. No constituye ni sustituye un diagnóstico médico o psicológico.</p>
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {Object.entries(areaLabels).map(([k, l]) => {
          const Icon = areaIcons[k];
          return (
            <button key={k} onClick={() => setTab(k)} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-bold"
              style={{ background: tab === k ? T.navy : "#fff", color: tab === k ? "#fff" : T.muted, border: `1px solid ${tab === k ? T.navy : T.line}` }}>
              <Icon size={15} />{l}
            </button>
          );
        })}
      </div>

      <div className="flex justify-end"><Btn variant="accent" icon={Plus} onClick={() => setModal({ area: tab, item: null })}>Añadir registro</Btn></div>

      {tab === "fisica" && (
        <div className="flex flex-col gap-2.5">
          {planning.fisica.slice().sort((a, b) => b.fecha.localeCompare(a.fecha)).map((it) => (
            <Card key={it.id} className="p-3.5 flex items-center gap-3 cursor-pointer hover:shadow-md transition" onClick={() => setModal({ area: "fisica", item: it })}>
              <div className="text-xs font-bold w-24 shrink-0" style={{ color: T.muted }}>{it.fecha}</div>
              <Pill color={T.navy}>{it.capacidad}</Pill>
              <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden"><div className="h-full" style={{ width: `${it.carga * 10}%`, background: T.red }} /></div>
              <span className="text-xs font-bold" style={{ color: T.navy }}>{it.carga}/10</span>
            </Card>
          ))}
          {!planning.fisica.length && <div className="text-sm" style={{ color: T.muted }}>Sin registros físicos todavía.</div>}
        </div>
      )}

      {tab === "tecnica" && (
        <div className="flex flex-col gap-2.5">
          {planning.tecnica.map((it) => (
            <Card key={it.id} className="p-3.5 cursor-pointer hover:shadow-md transition" onClick={() => setModal({ area: "tecnica", item: it })}>
              <div className="flex items-center justify-between">
                <div className="font-extrabold" style={{ color: T.navy }}>{it.fundamento}</div>
                <span className="text-xs font-bold" style={{ color: T.muted }}>{it.nivelActual} → {it.nivelObjetivo}</span>
              </div>
              <div className="text-xs mt-1" style={{ color: T.muted }}>{it.objetivo}</div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden mt-2"><div className="h-full" style={{ width: `${(it.nivelActual / (it.nivelObjetivo || 10)) * 100}%`, background: T.green }} /></div>
            </Card>
          ))}
          {!planning.tecnica.length && <div className="text-sm" style={{ color: T.muted }}>Sin registros técnicos todavía.</div>}
        </div>
      )}

      {tab === "tactica" && (
        <div className="flex flex-col gap-2.5">
          {planning.tactica.map((it) => (
            <Card key={it.id} className="p-3.5 cursor-pointer hover:shadow-md transition" onClick={() => setModal({ area: "tactica", item: it })}>
              <div className="font-extrabold" style={{ color: T.navy }}>{it.nombre}</div>
              <div className="text-xs" style={{ color: T.muted }}>{it.sistema} · {it.modelo}</div>
            </Card>
          ))}
          {!planning.tactica.length && <div className="text-sm" style={{ color: T.muted }}>Sin esquemas tácticos guardados.</div>}
        </div>
      )}

      {tab === "psicologica" && (
        <div className="flex flex-col gap-2.5">
          {planning.psicologica.slice().sort((a, b) => b.fecha.localeCompare(a.fecha)).map((it) => (
            <Card key={it.id} className="p-3.5 cursor-pointer hover:shadow-md transition" onClick={() => setModal({ area: "psicologica", item: it })}>
              <div className="flex items-center justify-between">
                <Pill color={T.navy}>{it.area}</Pill>
                <span className="text-xs font-bold" style={{ color: T.muted }}>{it.fecha}</span>
              </div>
              <div className="text-sm mt-1.5" style={{ color: T.text }}>{it.observaciones}</div>
            </Card>
          ))}
          {!planning.psicologica.length && <div className="text-sm" style={{ color: T.muted }}>Sin registros psicológicos todavía.</div>}
        </div>
      )}

      {modal && (
        <PlanningItemForm ctx={ctx} area={modal.area} initial={modal.item} onClose={() => setModal(null)}
          onSave={(item) => { modal.item ? saveItem(modal.area, item) : addItem(modal.area, item); setModal(null); }}
          onDelete={modal.item ? () => { if (confirm("¿Eliminar este registro?")) { removeItem(modal.area, modal.item.id); setModal(null); } } : null} />
      )}
    </div>
  );
}

function PlanningItemForm({ ctx, area, initial, onClose, onSave, onDelete }) {
  const { config, players } = ctx;
  const blanks = {
    fisica: { id: uid(), fecha: todayISO(), capacidad: config.foundations["Físicos"][0], carga: 5, observaciones: "" },
    tecnica: { id: uid(), fundamento: config.foundations["Técnicos"][0], objetivo: "", nivelActual: 5, nivelObjetivo: 8, tareas: "", evolucion: [5] },
    tactica: { id: uid(), nombre: "", sistema: config.tacticalSystems[config.footballType]?.[0] || "", modelo: "", principios: "", faseOfensiva: "", faseDefensiva: "", transiciones: "", balonParado: "", comportamientos: "", slots: [] },
    psicologica: { id: uid(), fecha: todayISO(), area: config.foundations["Psicológicos"][0], observaciones: "" },
  };
  const [f, setF] = useState(initial || blanks[area]);
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));

  return (
    <Modal title={`Registro ${area === "fisica" ? "físico" : area === "tecnica" ? "técnico" : area === "tactica" ? "táctico" : "psicológico"}`} onClose={onClose} wide>
      {area === "fisica" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Fecha"><TextInput type="date" value={f.fecha} onChange={(e) => set("fecha", e.target.value)} /></Field>
          <Field label="Capacidad"><Select value={f.capacidad} onChange={(e) => set("capacidad", e.target.value)}>{config.foundations["Físicos"].map((c) => <option key={c}>{c}</option>)}</Select></Field>
          <Field label={`Carga de entrenamiento (1-10): ${f.carga}`} className="sm:col-span-2"><input type="range" min="1" max="10" value={f.carga} onChange={(e) => set("carga", Number(e.target.value))} /></Field>
          <Field label="Observaciones" className="sm:col-span-2"><TextArea value={f.observaciones} onChange={(e) => set("observaciones", e.target.value)} /></Field>
        </div>
      )}
      {area === "tecnica" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Fundamento"><Select value={f.fundamento} onChange={(e) => set("fundamento", e.target.value)}>{config.foundations["Técnicos"].map((c) => <option key={c}>{c}</option>)}</Select></Field>
          <Field label="Tareas utilizadas"><TextInput value={f.tareas} onChange={(e) => set("tareas", e.target.value)} /></Field>
          <Field label="Nivel actual (1-10)"><TextInput type="number" min="1" max="10" value={f.nivelActual} onChange={(e) => set("nivelActual", Number(e.target.value))} /></Field>
          <Field label="Nivel objetivo (1-10)"><TextInput type="number" min="1" max="10" value={f.nivelObjetivo} onChange={(e) => set("nivelObjetivo", Number(e.target.value))} /></Field>
          <Field label="Objetivo" className="sm:col-span-2"><TextArea value={f.objetivo} onChange={(e) => set("objetivo", e.target.value)} /></Field>
        </div>
      )}
      {area === "tactica" && (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Nombre del esquema"><TextInput value={f.nombre} onChange={(e) => set("nombre", e.target.value)} /></Field>
            <Field label="Sistema">
              <Select value={f.sistema} onChange={(e) => set("sistema", e.target.value)}>{Object.values(config.tacticalSystems).flat().map((s) => <option key={s}>{s}</option>)}</Select>
            </Field>
            <Field label="Modelo de juego" className="sm:col-span-2"><TextInput value={f.modelo} onChange={(e) => set("modelo", e.target.value)} /></Field>
            <Field label="Principios de juego" className="sm:col-span-2"><TextArea value={f.principios} onChange={(e) => set("principios", e.target.value)} /></Field>
            <Field label="Fase ofensiva"><TextArea value={f.faseOfensiva} onChange={(e) => set("faseOfensiva", e.target.value)} /></Field>
            <Field label="Fase defensiva"><TextArea value={f.faseDefensiva} onChange={(e) => set("faseDefensiva", e.target.value)} /></Field>
            <Field label="Transiciones"><TextArea value={f.transiciones} onChange={(e) => set("transiciones", e.target.value)} /></Field>
            <Field label="Balón parado"><TextArea value={f.balonParado} onChange={(e) => set("balonParado", e.target.value)} /></Field>
            <Field label="Comportamientos específicos" className="sm:col-span-2"><TextArea value={f.comportamientos} onChange={(e) => set("comportamientos", e.target.value)} /></Field>
          </div>
          <div>
            <Eyebrow>Esquema sobre el campo</Eyebrow>
            <div className="mt-2"><PitchEditor system={f.sistema} players={players} lineup={f.slots} onChange={(l) => set("slots", l)} /></div>
          </div>
        </div>
      )}
      {area === "psicologica" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Fecha"><TextInput type="date" value={f.fecha} onChange={(e) => set("fecha", e.target.value)} /></Field>
          <Field label="Área"><Select value={f.area} onChange={(e) => set("area", e.target.value)}>{config.foundations["Psicológicos"].map((c) => <option key={c}>{c}</option>)}</Select></Field>
          <Field label="Observaciones" className="sm:col-span-2"><TextArea value={f.observaciones} onChange={(e) => set("observaciones", e.target.value)} /></Field>
        </div>
      )}
      <div className="flex justify-between gap-2 mt-5 sticky bottom-0 bg-white -mx-5 px-5 py-3 border-t" style={{ borderColor: T.line }}>
        {onDelete ? <Btn variant="danger" icon={Trash2} onClick={onDelete}>Eliminar</Btn> : <div />}
        <div className="flex gap-2"><Btn variant="ghost" onClick={onClose}>Cancelar</Btn><Btn variant="accent" icon={Save} onClick={() => onSave(f)}>Guardar</Btn></div>
      </div>
    </Modal>
  );
}

/* ============================================================
   INFORMES
   ============================================================ */

function InformesModule({ ctx }) {
  const { matches, players, trainings, season, config } = ctx;
  const [tipo, setTipo] = useState("partido");
  const [entityId, setEntityId] = useState("");

  const tipos = [["partido", "Informe de partido"], ["jugador", "Informe de jugador"], ["entrenamiento", "Informe de entrenamiento"], ["temporada", "Informe de temporada"]];

  const entity = tipo === "partido" ? matches.find((m) => m.id === entityId)
    : tipo === "jugador" ? players.find((p) => p.id === entityId)
    : tipo === "entrenamiento" ? trainings.find((t) => t.id === entityId)
    : season;

  const doPrint = () => window.print();

  return (
    <div className="flex flex-col gap-5 max-w-3xl">
      <style>{`@media print { .no-print { display: none !important; } body * { visibility: hidden; } #informe-print, #informe-print * { visibility: visible; } #informe-print { position: absolute; left: 0; top: 0; width: 100%; } }`}</style>
      <div className="no-print"><Eyebrow>Informes</Eyebrow><h1 className="text-2xl font-extrabold" style={{ color: T.navy }}>Generar informe</h1></div>

      <div className="flex gap-1.5 flex-wrap no-print">
        {tipos.map(([k, l]) => (
          <button key={k} onClick={() => { setTipo(k); setEntityId(""); }} className="px-3 py-1.5 rounded-xl text-xs font-bold"
            style={{ background: tipo === k ? T.navy : "#fff", color: tipo === k ? "#fff" : T.muted, border: `1px solid ${tipo === k ? T.navy : T.line}` }}>{l}</button>
        ))}
      </div>

      {tipo !== "temporada" && (
        <div className="no-print">
          <Select value={entityId} onChange={(e) => setEntityId(e.target.value)}>
            <option value="">Selecciona…</option>
            {tipo === "partido" && matches.map((m) => <option key={m.id} value={m.id}>{m.fecha} · vs {m.rival}</option>)}
            {tipo === "jugador" && players.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            {tipo === "entrenamiento" && trainings.map((t) => <option key={t.id} value={t.id}>{t.fecha} · {t.objetivoGeneral}</option>)}
          </Select>
        </div>
      )}

      {entity && (
        <>
          <div className="no-print"><Btn variant="accent" icon={Printer} onClick={doPrint}>Imprimir / Exportar PDF</Btn></div>
          <Card className="p-6" id="informe-print">
            <div className="flex items-center gap-2 mb-4"><Shield size={20} style={{ color: T.red }} /><span className="font-extrabold" style={{ color: T.navy }}>{config.teamName}</span></div>
            {tipo === "partido" && (
              <div className="flex flex-col gap-3 text-sm">
                <h2 className="text-xl font-extrabold" style={{ color: T.navy }}>Informe de partido · vs {entity.rival}</h2>
                <div>{entity.fecha} · Jornada {entity.jornada} · {entity.competicion} · {entity.campo}</div>
                <div className="text-2xl font-black">{entity.resultadoFinal}</div>
                <div><strong>Sistema:</strong> {entity.sistema} ({entity.tipoFutbol})</div>
                <div><strong>Modelo de juego:</strong> {entity.tactica?.modelo}</div>
                <div><strong>Qué funcionó:</strong> {entity.tactica?.funciono}</div>
                <div><strong>Qué no funcionó:</strong> {entity.tactica?.noFunciono}</div>
                <div><strong>Fortalezas:</strong> {entity.rendimiento?.fortalezas}</div>
                <div><strong>Debilidades:</strong> {entity.rendimiento?.debilidades}</div>
                <div><strong>Mantener:</strong> {entity.aprendizajes?.mantener}</div>
                <div><strong>Corregir:</strong> {entity.aprendizajes?.corregir}</div>
                <div><strong>Trabajar:</strong> {entity.aprendizajes?.trabajar}</div>
                <div><strong>Observaciones:</strong> {entity.observaciones}</div>
              </div>
            )}
            {tipo === "jugador" && (
              <div className="flex flex-col gap-3 text-sm">
                <h2 className="text-xl font-extrabold" style={{ color: T.navy }}>Informe de jugador · {entity.nombre}</h2>
                <div>{entity.posicion} · Nº {entity.numero} · {calcAge(entity.dob)} años</div>
                <div className="grid grid-cols-4 gap-3 mt-2">
                  {[["Convocatorias", entity.stats.convocatorias], ["Minutos", entity.stats.minutos], ["Goles", entity.stats.goles], ["Asistencias", entity.stats.asistencias]].map(([l, v]) => (
                    <div key={l}><div className="text-lg font-extrabold">{v}</div><div className="text-[11px] uppercase font-bold" style={{ color: T.muted }}>{l}</div></div>
                  ))}
                </div>
                <div><strong>Observaciones:</strong> {entity.observaciones || "Sin observaciones."}</div>
              </div>
            )}
            {tipo === "entrenamiento" && (
              <div className="flex flex-col gap-3 text-sm">
                <h2 className="text-xl font-extrabold" style={{ color: T.navy }}>Informe de entrenamiento</h2>
                <div>{entity.fecha} · {entity.hora} · {entity.lugar} · {entity.duracion} min</div>
                <div><strong>Objetivo general:</strong> {entity.objetivoGeneral}</div>
                <div><strong>Tareas realizadas:</strong> {entity.tareas?.map((t) => t.nombre).join(", ") || "-"}</div>
                <div><strong>Notas del entrenador:</strong> {entity.notas}</div>
              </div>
            )}
            {tipo === "temporada" && (
              <div className="flex flex-col gap-3 text-sm">
                <h2 className="text-xl font-extrabold" style={{ color: T.navy }}>Informe de temporada · {entity.competicion}</h2>
                <div>{entity.fechaInicio} — {entity.fechaFin}</div>
                <div><strong>Objetivos generales:</strong> {entity.objetivosGenerales}</div>
                <div><strong>Objetivos deportivos:</strong> {entity.objetivosDeportivos}</div>
                <div><strong>Objetivos formativos:</strong> {entity.objetivosFormativos}</div>
                <div><strong>Semanas planificadas:</strong> {entity.weeks.length}</div>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}

/* ============================================================
   BUSCADOR GLOBAL
   ============================================================ */

function GlobalSearchResults({ results, onClear }) {
  return (
    <div className="flex flex-col gap-5 max-w-4xl">
      <div className="flex items-center justify-between">
        <div><Eyebrow>Búsqueda</Eyebrow><h1 className="text-2xl font-extrabold" style={{ color: T.navy }}>Resultados</h1></div>
        <Btn variant="ghost" icon={X} onClick={onClear}>Limpiar</Btn>
      </div>
      {[["Jugadores", results.jugadores, (x) => x.nombre], ["Partidos", results.partidos, (x) => `vs ${x.rival} (${x.resultadoFinal})`],
        ["Entrenamientos", results.entrenamientos, (x) => x.objetivoGeneral], ["Tareas", results.tareas, (x) => `${x.nombre} (${x.codigo})`]].map(([label, arr, fmt]) => (
        arr.length > 0 && (
          <Card key={label} className="p-4">
            <Eyebrow>{label}</Eyebrow>
            <div className="flex flex-col gap-1.5 mt-2">
              {arr.map((x) => <div key={x.id} className="text-sm font-bold" style={{ color: T.navy }}>{fmt(x)}</div>)}
            </div>
          </Card>
        )
      ))}
      {!results.jugadores.length && !results.partidos.length && !results.entrenamientos.length && !results.tareas.length && (
        <div className="text-sm" style={{ color: T.muted }}>Sin resultados para esta búsqueda.</div>
      )}
    </div>
  );
}
