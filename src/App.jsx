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
  logo: null,
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
  taskCategories: ["Calentamiento", "Parte principal", "Vuelta a la calma", "Técnico", "Táctico", "Físico", "Psicológico"],
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
  { nombre: "Sergio Muñoz Prat", apodo: "Sergio", numero: 12, posicion: "Defensa Central", secundarias: [], dob: "2008-05-22", pie: "Diestro", altura: 184, peso: 77, estado: "Disponible" },
  { nombre: "Aitor Lozano Sanz", apodo: "Aitor", numero: 14, posicion: "Lateral Derecho", secundarias: [], dob: "2008-10-11", pie: "Diestro", altura: 173, peso: 67, estado: "Disponible" },
  { nombre: "Gonzalo Serra Roig", apodo: "Gonzalo", numero: 15, posicion: "Lateral Izquierdo", secundarias: [], dob: "2009-02-17", pie: "Zurdo", altura: 175, peso: 68, estado: "Disponible" },
  { nombre: "Raúl Pardo Esteve", apodo: "Raúl", numero: 16, posicion: "Mediocentro Defensivo", secundarias: [], dob: "2008-07-04", pie: "Diestro", altura: 177, peso: 71, estado: "Sancionado" },
  { nombre: "Óscar Bravo Camino", apodo: "Óscar", numero: 17, posicion: "Mediocentro", secundarias: ["Mediocentro Ofensivo"], dob: "2008-03-29", pie: "Zurdo", altura: 174, peso: 69, estado: "Disponible" },
  { nombre: "Javier Cano Ibáñez", apodo: "Javi", numero: 18, posicion: "Extremo Derecho", secundarias: [], dob: "2009-06-06", pie: "Diestro", altura: 169, peso: 62, estado: "Disponible" },
  { nombre: "Dani Rey Folch", apodo: "Dani", numero: 19, posicion: "Extremo Izquierdo", secundarias: [], dob: "2008-11-27", pie: "Zurdo", altura: 171, peso: 64, estado: "Disponible" },
  { nombre: "Carlos Mendoza Puig", apodo: "Carlos", numero: 20, posicion: "Delantero Centro", secundarias: [], dob: "2008-01-30", pie: "Diestro", altura: 185, peso: 78, estado: "Disponible" },
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
    pruebasFisicas: [
      {
        id: uid(), fecha: "2026-08-05",
        velocidad20m: +(3.0 + Math.random() * 0.6).toFixed(2),
        velocidadZigzag20m: +(4.2 + Math.random() * 0.8).toFixed(2),
        controlBalon: Math.floor(20 + Math.random() * 60),
        vo2max: Math.floor(42 + Math.random() * 12),
        abdominalesMin: Math.floor(30 + Math.random() * 20),
        flexionesMin: Math.floor(20 + Math.random() * 20),
        golpeoDistancia: +(25 + Math.random() * 15).toFixed(1),
        flexibilidad: [-2, -1, 0, 1, 2, 3][Math.floor(Math.random() * 6)],
        observaciones: "Test inicial de pretemporada.",
      },
    ],
  }));
}

function buildDemoMatches(players) {
  const DEMO_LINEUP_1433 = [
    { x: 50, y: 92 },
    { x: 18, y: 72 }, { x: 40, y: 76 }, { x: 60, y: 76 }, { x: 82, y: 72 },
    { x: 30, y: 52 }, { x: 50, y: 48 }, { x: 70, y: 52 },
    { x: 22, y: 24 }, { x: 50, y: 16 }, { x: 78, y: 24 },
  ];
  const rivales = ["CF Montealto", "UD San Rafael", "Atlético Vega", "Real Costa", "EF Norte"];
  const scores = [[3, 0], [1, 1], [2, 3], [1, 2], [2, 1]];
  const sistema = "1-4-3-3";
  return rivales.map((rival, i) => {
    const esLocal = i % 2 === 0;
    const [gf, gc] = scores[i];
    const disponibles = players.filter((p) => p.estado === "Disponible");
    const noDisponibles = players.filter((p) => p.estado !== "Disponible");
    const convocados = disponibles.slice(0, 18);
    const noConvocados = [...disponibles.slice(18), ...noDisponibles];
    const titulares = convocados.slice(0, 11);
    const suplentes = convocados.slice(11);
    const capitan = players.find((p) => p.numero === 4) || convocados[1];
    const golePos = ["Delantero Centro", "Extremo Derecho", "Extremo Izquierdo", "Mediocentro Ofensivo"];
    const goleadores = convocados.filter((p) => golePos.includes(p.posicion));
    const goles = Array.from({ length: gf }, (_, gIdx) => {
      const autor = goleadores[gIdx % goleadores.length] || titulares[gIdx % titulares.length];
      const asistente = titulares[(gIdx + 3) % titulares.length];
      return { id: uid(), minuto: 12 + gIdx * 19, jugadorId: autor.id, asistenciaId: asistente.id !== autor.id ? asistente.id : null };
    });
    const sale = titulares[9], entra = suplentes[0];
    return {
      id: uid(),
      fecha: `2026-0${9 + Math.floor(i / 3)}-1${i}`,
      competicion: "Liga",
      jornada: i + 1,
      rival, esLocal,
      campo: esLocal ? "Campo Municipal PZ" : `Campo de ${rival}`,
      resultadoDescanso: `${Math.floor(gf / 2)}-${Math.floor(gc / 2)}`,
      resultadoFinal: `${gf}-${gc}`,
      tipoFutbol: "Fútbol 11",
      sistema,
      convocatoria: [
        ...convocados.map((p) => ({ jugadorId: p.id, estado: "Convocado" })),
        ...noConvocados.map((p) => ({ jugadorId: p.id, estado: p.estado === "Lesionado" ? "Lesionado" : p.estado === "Sancionado" ? "Sancionado" : "No convocado" })),
      ],
      capitanId: capitan.id,
      vestimenta: { camiseta: esLocal ? "Rojo" : "Blanco", pantaloneta: "Negro", medias: "Rojo" },
      alineacion: titulares.map((p, idx) => ({ x: DEMO_LINEUP_1433[idx]?.x ?? 50, y: DEMO_LINEUP_1433[idx]?.y ?? 50, jugadorId: p.id })),
      cambios: entra ? [{ id: uid(), minuto: 68, saleId: sale.id, entraId: entra.id }] : [],
      goles,
      tarjetas: [{ id: uid(), minuto: 55, jugadorId: titulares[3].id, tipo: "Amarilla" }],
      tactica: { modelo: "Presión alta y salida en corto", funciono: "Circulación en primera fase", noFunciono: "Pérdida de profundidad en banda", ajustes: "Cambio a 1-4-4-2 en el minuto 60" },
      rendimiento: {
        ataque: 7, defensa: 6, transicionOfensiva: 7, transicionDefensiva: 6,
        balonParadoOfensivo: 5, balonParadoDefensivo: 6,
        fortalezas: "Buena presión tras pérdida", debilidades: "Concesión de espacios a la espalda",
      },
      valoracionesJugadores: Object.fromEntries(titulares.map((p) => [p.id, 5 + Math.floor(Math.random() * 5)])),
      aprendizajes: { mantener: "Intensidad en el presing", corregir: "Cobertura defensiva en transición", trabajar: "Salida de balón bajo presión" },
      observaciones: "Buen partido en líneas generales. Revisar bloque medio para el próximo encuentro.",
    };
  });
}

function buildDemoTrainings(players) {
  const nombresObjetivo = [
    "Mejorar la circulación de balón en fase de construcción",
    "Mejorar la circulación de balón en fase de construcción",
    "Mejorar la circulación de balón en fase de construcción",
    "Mejorar la circulación de balón en fase de construcción",
    "Mejorar la circulación de balón en fase de construcción",
  ];
  return Array.from({ length: 5 }, (_, i) => {
    const asistencia = players.map((p, idx) => ({ jugadorId: p.id, estado: p.estado === "Lesionado" ? "Lesionado" : (idx === (i + 2) % players.length ? "No asiste" : "Asiste") }));
    return {
      id: uid(),
      numeroSesion: String(i + 1),
      fecha: `2026-08-${10 + i}`, hora: "19:00", lugar: "Campo Municipal PZ",
      duracion: 90, numJugadores: asistencia.filter((a) => a.estado === "Asiste").length,
      objetivoGeneral: nombresObjetivo[i],
      objetivos: { fisicos: "Resistencia aeróbica de base", tecnicos: "Pase y control orientado", tacticos: "Salida de balón en 3 líneas", estrategicos: "Córner al primer palo", psicologicos: "Comunicación entre líneas" },
      calentamiento: {
        tareas: [{ id: uid(), libraryTaskId: null, nombre: "Movilidad articular + rondo 4v1", codigo: "CAL-0" + (i + 1), objetivo: "Activación general", fundamento: "Primer contacto con balón", materiales: "Conos, petos", tiempo: 15, jugadores: 5, espacio: "10x10m", reglas: "2 toques", organizacion: "Círculo con 1 defensor central", descripcion: "Rondo con apoyos exteriores y movilidad previa", notas: "" }],
        actividad: "Movilidad articular + rondos 4v1", objetivo: "Activación y primer contacto con el balón", materiales: "Conos, petos", tiempo: 15, notas: "Intensidad progresiva.",
      },
      tareas: [
        { id: uid(), libraryTaskId: null, nombre: "Rondo posicional 6v3", codigo: "TEC-04", objetivo: "Conservación de balón", fundamento: "Pase, control orientado", materiales: "Conos, petos", tiempo: 20, jugadores: 9, espacio: "15x15m", reglas: "2 toques máximo", organizacion: "Círculo con 3 defensores centrales", descripcion: "Rondo con apoyos exteriores", notas: "" },
        { id: uid(), libraryTaskId: null, nombre: "Circuito de velocidad y cambios de ritmo", codigo: "FIS-02", objetivo: "Velocidad y agilidad", fundamento: "Técnica de carrera", materiales: "Conos, vallas", tiempo: 15, jugadores: 12, espacio: "30m lineales", reglas: "Series de 4x30m", organizacion: "Filas paralelas", descripcion: "Circuito de esprines con cambios de dirección", notas: "" },
      ],
      aplicacionJuego: {
        tareas: [
          { id: uid(), libraryTaskId: null, nombre: "Partido condicionado 8v8 a 2 toques", codigo: "PC-0" + (i + 1), objetivo: "Circulación rápida y amplitud", fundamento: "Pase y toma de decisiones", materiales: "Petos, porterías", tiempo: 20, jugadores: 16, espacio: "Medio campo", reglas: "Máximo 2 toques", organizacion: "8v8 en campo reducido", descripcion: "Partido condicionado con transiciones rápidas", notas: "" },
          { id: uid(), libraryTaskId: null, nombre: "Juego real 11v11", codigo: "JR-0" + (i + 1), objetivo: "Aplicación del modelo de juego", fundamento: "Integración táctica", materiales: "Petos, porterías", tiempo: 15, jugadores: 22, espacio: "Campo completo", reglas: "Sin restricciones", organizacion: "11v11", descripcion: "Juego libre para fijar los automatismos trabajados", notas: "" },
        ],
        tipo: "Partido condicionado", objetivo: "Transición ofensiva rápida", tiempo: 35, observaciones: "8v8 en campo reducido con transiciones, luego juego real para fijar conceptos.",
      },
      vueltaCalma: {
        tareas: [{ id: uid(), libraryTaskId: null, nombre: "Estiramiento global guiado", codigo: "VC-0" + (i + 1), objetivo: "Recuperación", fundamento: "Flexibilidad", materiales: "Colchonetas", tiempo: 10, jugadores: 20, espacio: "Círculo central", reglas: "-", organizacion: "Círculo grupal", descripcion: "Estiramiento guiado por el cuerpo técnico", notas: "" }],
        estiramientos: "Estiramiento global", actividad: "Movilidad pasiva", tiempo: 10, observaciones: "Grupo receptivo, buena disposición al cierre.",
        balonParado: [{ id: uid(), libraryTaskId: null, nombre: "Córner al primer palo", codigo: "BP-0" + (i + 1), objetivo: "Definición de jugada ensayada", fundamento: "Balón parado ofensivo", materiales: "Balones, porterías", tiempo: 10, jugadores: 11, espacio: "Área de penal", reglas: "-", organizacion: "Jugadores en posiciones fijas", descripcion: "Repetición de córner ensayado al primer palo", notas: "" }],
      },
      notas: "Sesión con buena intensidad general; revisar la concentración en el último cuarto de hora.",
      asistencia,
    };
  });
}

function buildDemoRivals() {
  return [
    { id: uid(), nombre: "CF Montealto", sistemas: "1-4-4-2", fortalezas: "Juego aéreo en balón parado, laterales ofensivos", debilidades: "Pérdida de intensidad tras el minuto 70", jugadoresRelevantes: "9 - Delantero centro, referencia física", ofensivo: "Ataques directos por banda derecha", defensivo: "Línea de 4 alta con fuera de juego provocado", transiciones: "Rápidas al espacio tras robo", balonParado: "Central alto en córners, primer palo", observaciones: "Suelen presionar arriba en el saque de puerta.", historial: "1 enfrentamiento previo: victoria 3-0." },
    { id: uid(), nombre: "UD San Rafael", sistemas: "1-4-3-3", fortalezas: "Posesión y circulación en campo propio", debilidades: "Vulnerable a la presión alta tras pérdida", jugadoresRelevantes: "10 - Mediocentro organizador", ofensivo: "Construcción en corto desde portero", defensivo: "Bloque medio, presión por zonas", transiciones: "Lentas, priorizan la posesión", balonParado: "Jugadas ensayadas de córner al segundo palo", observaciones: "Rival exigente técnicamente, cuidar pérdidas en salida.", historial: "1 enfrentamiento previo: empate 1-1." },
    { id: uid(), nombre: "Atlético Vega", sistemas: "1-4-2-3-1", fortalezas: "Intensidad física y duelos individuales", debilidades: "Poca precisión en el último pase", jugadoresRelevantes: "8 - Mediocentro box-to-box muy físico", ofensivo: "Transiciones rápidas tras recuperación en campo propio", defensivo: "Presión hombre a hombre en campo contrario", transiciones: "Muy rápidas, buscan el contragolpe directo", balonParado: "Lanzadores potentes, disparo directo de falta", observaciones: "Equipo físicamente exigente; cuidar segundas jugadas.", historial: "1 enfrentamiento previo: derrota 2-3." },
    { id: uid(), nombre: "Real Costa", sistemas: "1-4-4-2", fortalezas: "Solidez defensiva y juego directo", debilidades: "Poca circulación de balón en salida", jugadoresRelevantes: "5 - Central zurdo, buen juego aéreo", ofensivo: "Balones largos a la espalda de la defensa", defensivo: "Bloque bajo muy compacto", transiciones: "Directas, saltan líneas con pase largo", balonParado: "Especialistas en saques de banda largos como centro", observaciones: "Rival incómodo por su planteamiento defensivo; paciencia en la circulación.", historial: "1 enfrentamiento previo: derrota 1-2 (como visitante)." },
  ];
}

function buildDemoSeason() {
  return {
    equipo: DEFAULT_CONFIG.teamName, categoria: DEFAULT_CONFIG.category, competicion: "Liga Regional Juvenil",
    localidad: "",
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
    cuerpoTecnico: [],
  };
}

const DEFAULT_SEASON_PLANNING = {
  pretemporada: { fechaInicio: "", fechaFin: "", objetivos: "", dias: [], amistosos: [] },
  mensual: [],
  macrociclo: [],
  partidoNoProgramado: [],
  torneoRapido: [],
};

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

const DEFAULT_STANDINGS = {
  posicion: null, totalEquipos: null, puntos: null,
  jugados: null, ganados: null, empatados: null, perdidos: null,
  golesFavor: null, golesContra: null,
  casa: { jugados: null, ganados: null, empatados: null, perdidos: null },
  fuera: { jugados: null, ganados: null, empatados: null, perdidos: null },
  enlace: "", actualizadoEl: null,
};

const TIPO_EJERCICIO = ["Vacío", "Ejercicio integral", "Ejercicio analítico", "Ejercicio sistémico"];
const ZONA_TRABAJO = ["Vacío", "Calentamiento o regenerativo", "Aeróbica extensiva", "Aeróbica intensiva", "Umbral o zona mixta", "Anaeróbica", "Velocidad máxima"];
const FASE_JUEGO = ["Vacío", "Iniciación", "Creación en cobertura", "Creación ofensiva", "Finalización"];
const MOMENTO_JUEGO = ["Vacío", "Defensa", "Ataque", "Transición defensiva", "Transición ataque"];
const TIPO_TAREA = ["Actividades lúdicas", "Ruedas de pase", "Rondos", "Espacios reducidos", "Juegos de posesión", "Situaciones tácticas de juego y táctica fija", "Partidos condicionados", "Juego real"];

const DEMO_TASKS = [
  { id: uid(), nombre: "Rondo posicional 6v3", codigo: "TEC-04", categoria: "Técnico", tipoEjercicio: "Ejercicio sistémico", zonaTrabajo: "Aeróbica intensiva", faseJuego: "Creación ofensiva", momentoJuego: "Ataque", tipoTarea: "Rondos", edad: "Juvenil", minJugadores: 9, maxJugadores: 9, espacio: "15x15m", duracion: 20, objFisico: "Resistencia", objTecnico: "Pase, control orientado", objTactico: "Conservación", objPsicologico: "Comunicación", materiales: "Conos, petos", descripcion: "Rondo con 6 jugadores exteriores y 3 defensores en el centro.", reglas: "2 toques máximo", movimientosObservar: "Orientación corporal antes de recibir; apoyos en diagonal; velocidad de circulación del balón.", observaciones: "" },
  { id: uid(), nombre: "Presión tras pérdida 8v8", codigo: "TAC-11", categoria: "Táctico", tipoEjercicio: "Ejercicio sistémico", zonaTrabajo: "Umbral o zona mixta", faseJuego: "Creación en cobertura", momentoJuego: "Transición defensiva", tipoTarea: "Situaciones tácticas de juego y táctica fija", edad: "Juvenil/Senior", minJugadores: 16, maxJugadores: 16, espacio: "40x30m", duracion: 20, objFisico: "Potencia", objTecnico: "Entrada, cobertura", objTactico: "Transición ofensiva/defensiva", objPsicologico: "Toma de decisiones", materiales: "Conos, petos, porterías", descripcion: "Juego 8v8 con objetivo de recuperación en menos de 5 segundos tras pérdida.", reglas: "Recuperar en 5s o el rival juega libre", movimientosObservar: "Basculación del bloque tras la pérdida; distancia entre líneas; agresividad en el primer contacto.", observaciones: "", videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
  { id: uid(), nombre: "Circuito de velocidad y cambios de ritmo", codigo: "FIS-02", categoria: "Físico", tipoEjercicio: "Ejercicio analítico", zonaTrabajo: "Velocidad máxima", faseJuego: "Iniciación", momentoJuego: "Ataque", tipoTarea: "Actividades lúdicas", edad: "Todas", minJugadores: 4, maxJugadores: 20, espacio: "30m lineales", duracion: 15, objFisico: "Velocidad, agilidad", objTecnico: "", objTactico: "", objPsicologico: "Concentración", materiales: "Conos, vallas", descripcion: "Circuito de esprines con cambios de dirección.", reglas: "Series de 4x30m", movimientosObservar: "Técnica de carrera; ángulo de apoyo en cambios de dirección; recuperación entre series.", observaciones: "" },
  { id: uid(), nombre: "Movilidad articular y activación general", codigo: "CAL-01", categoria: "Calentamiento", tipoEjercicio: "Ejercicio integral", zonaTrabajo: "Calentamiento o regenerativo", faseJuego: "Vacío", momentoJuego: "Vacío", tipoTarea: "Actividades lúdicas", edad: "Todas", minJugadores: 10, maxJugadores: 22, espacio: "Medio campo", duracion: 15, objFisico: "Activación articular y muscular progresiva", objTecnico: "Primer contacto con el balón", objTactico: "", objPsicologico: "Concentración inicial del grupo", materiales: "Conos, petos, balones", descripcion: "Trote suave con movilidad de tobillos, rodillas y cadera, seguido de un rondo 4v1 de baja intensidad para el primer contacto con el balón.", reglas: "2 toques máximo en el rondo final", movimientosObservar: "Amplitud de movimiento en las articulaciones; postura correcta en los desplazamientos; actitud y concentración del grupo.", observaciones: "Ideal como primer bloque de cualquier sesión." },
  { id: uid(), nombre: "Posesión 7v7 más 3 comodines", codigo: "TAC-15", categoria: "Táctico", tipoEjercicio: "Ejercicio sistémico", zonaTrabajo: "Umbral o zona mixta", faseJuego: "Creación ofensiva", momentoJuego: "Ataque", tipoTarea: "Juegos de posesión", edad: "Juvenil/Senior", minJugadores: 17, maxJugadores: 17, espacio: "35x25m", duracion: 20, objFisico: "Resistencia a la intensidad intermitente", objTecnico: "Pase y control bajo presión", objTactico: "Superioridad numérica y ocupación de espacios", objPsicologico: "Paciencia en la circulación del balón", materiales: "Conos, petos de 3 colores, balones", descripcion: "Dos equipos de 7 jugadores más 3 comodines que juegan siempre con el equipo en posesión, generando superioridad numérica constante.", reglas: "Los comodines solo pueden dar 1 toque", movimientosObservar: "Apoyos en diagonal de los comodines; amplitud del equipo con balón; presión coordinada del equipo sin balón.", observaciones: "Variante: reducir a 2 toques para todos si se domina bien la tarea." },
  { id: uid(), nombre: "Finalización tras centro lateral", codigo: "TEC-09", categoria: "Técnico", tipoEjercicio: "Ejercicio analítico", zonaTrabajo: "Anaeróbica", faseJuego: "Finalización", momentoJuego: "Ataque", tipoTarea: "Espacios reducidos", edad: "Juvenil/Senior", minJugadores: 8, maxJugadores: 12, espacio: "Área y medialuna", duracion: 20, objFisico: "Potencia en el salto y el remate", objTecnico: "Centro y definición de cabeza o volea", objTactico: "Ocupación de espacios en el área (primer palo, segundo palo, punto de penalti)", objPsicologico: "Decisión y confianza en el remate", materiales: "Conos, balones, porterías", descripcion: "Los extremos centran alternando desde banda derecha e izquierda; los delanteros y mediocentros ofensivos atacan el área en oleadas para definir.", reglas: "Máximo 2 toques antes de rematar", movimientosObservar: "Timing de llegada al área; ocupación de las 3 zonas de remate; calidad y altura del centro.", observaciones: "Rotar las posiciones de centrador y rematador cada 5 minutos." },
  { id: uid(), nombre: "Vuelta a la calma con estiramiento guiado", codigo: "VC-01", categoria: "Vuelta a la calma", tipoEjercicio: "Ejercicio integral", zonaTrabajo: "Calentamiento o regenerativo", faseJuego: "Vacío", momentoJuego: "Vacío", tipoTarea: "Actividades lúdicas", edad: "Todas", minJugadores: 10, maxJugadores: 22, espacio: "Círculo central", duracion: 10, objFisico: "Recuperación y vuelta a la calma progresiva", objTecnico: "", objTactico: "", objPsicologico: "Cierre grupal y reflexión sobre la sesión", materiales: "Colchonetas o toallas", descripcion: "Trote suave de 2 minutos seguido de estiramiento estático guiado por el cuerpo técnico en círculo, cerrando con una breve puesta en común de la sesión.", reglas: "-", movimientosObservar: "Calidad del estiramiento (sin rebotes); actitud de escucha en el cierre grupal.", observaciones: "Aprovechar el cierre para dar feedback breve del entrenamiento." },
];

/* ---------------- Storage helpers ---------------- */

/* VERSIÓN DE DEMOSTRACIÓN: no hay guardado real.
   Se puede probar todo libremente (crear, editar, borrar) dentro de la
   sesión, pero nada se escribe en el dispositivo: al recargar la página
   siempre vuelve a partir de los datos de ejemplo. */
async function loadKey() { return null; }
async function saveKey() { return null; }

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
    <Card className="p-4 flex flex-col items-center gap-2 min-w-0 text-center">
      <div className="flex items-center justify-center gap-1.5 w-full">
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
  return <select {...props} className={`${inputCls} bg-white ${props.className || ""}`} style={{ ...inputStyle, fontSize: 14, ...(props.style || {}) }}>{children}</select>;
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
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.scrollTo(0, 0);
    return () => { document.body.style.overflow = prevOverflow; };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4">
      <div className={`bg-white w-full ${wide ? "sm:max-w-3xl" : "sm:max-w-lg"} sm:rounded-2xl rounded-t-2xl`}
        style={{ maxHeight: "92vh", display: "flex", flexDirection: "column" }}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: T.line, flex: "0 0 auto" }}>
          <h3 className="font-extrabold text-lg" style={{ color: T.navy }}>{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100"><X size={18} /></button>
        </div>
        <div className="px-5 py-4" style={{ flex: "1 1 auto", minHeight: 0, overflowY: "auto", WebkitOverflowScrolling: "touch" }}>{children}</div>
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
  { key: "dashboard", label: "Panel informativo", icon: LayoutGrid },
  { key: "temporada", label: "Temporada y Planificación", icon: Target },
  { key: "plantilla", label: "Plantilla", icon: Users },
  { key: "tareas", label: "Biblioteca de tareas", icon: BookOpen },
  { key: "entrenamientos", label: "Entrenamientos", icon: Dumbbell },
  { key: "partidos", label: "Partidos", icon: Swords },
  { key: "rival", label: "Análisis del rival", icon: Eye },
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
  const [seasonPlanning, setSeasonPlanning] = useState(null);
  const [planning, setPlanning] = useState(null);
  const [standings, setStandings] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      const [c, p, m, t, tk, rv, se, pl2, st, spl] = await Promise.all([
        loadKey("pz-config", null),
        loadKey("pz-players", null),
        loadKey("pz-matches", null),
        loadKey("pz-trainings", null),
        loadKey("pz-tasks", null),
        loadKey("pz-rivals", null),
        loadKey("pz-season", null),
        loadKey("pz-planning", null),
        loadKey("pz-standings", null),
        loadKey("pz-season-planning", null),
      ]);
      if (c) setConfig(c); 
      let pl = p;
      if (!pl) { pl = buildDemoPlayers(); await saveKey("pz-players", pl); }
      setPlayers(pl);
      let mt = m;
      if (!mt) { mt = buildDemoMatches(pl); await saveKey("pz-matches", mt); }
      setMatches(mt);
      let tr = t;
      if (!tr) { tr = buildDemoTrainings(pl); await saveKey("pz-trainings", tr); }
      setTrainings(tr);
      let tks = tk;
      if (!tks) { tks = DEMO_TASKS; await saveKey("pz-tasks", tks); }
      setTasks(tks);
      let rvv = rv;
      if (!rvv) { rvv = buildDemoRivals(); await saveKey("pz-rivals", rvv); }
      setRivals(rvv);
      let sev = se;
      if (!sev) { sev = buildDemoSeason(); await saveKey("pz-season", sev); }
      sev = { localidad: "", ...sev };
      setSeason(sev);
      let plv = pl2;
      if (!plv) { plv = DEFAULT_PLANNING; await saveKey("pz-planning", plv); }
      setPlanning(plv);
      let stv = st;
      if (!stv) { stv = DEFAULT_STANDINGS; await saveKey("pz-standings", stv); }
      setStandings(stv);
      let splv = spl;
      if (!splv) { splv = DEFAULT_SEASON_PLANNING; await saveKey("pz-season-planning", splv); }
      splv = { ...splv, pretemporada: { objetivos: "", ...splv.pretemporada } };
      setSeasonPlanning(splv);
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
  const updateStandings = useCallback((updater) => {
    setStandings((prev) => { const next = typeof updater === "function" ? updater(prev) : updater; saveKey("pz-standings", next); return next; });
  }, []);
  const updateSeasonPlanning = useCallback((updater) => {
    setSeasonPlanning((prev) => { const next = typeof updater === "function" ? updater(prev) : updater; saveKey("pz-season-planning", next); return next; });
  }, []);

  // Estadísticas de jugador siempre recalculadas en vivo desde partidos y entrenamientos reales,
  // para que Plantilla, Estadísticas e Informes queden todos conectados a una sola fuente de verdad.
  const playersWithStats = useMemo(() => players.map((p) => ({
    ...p,
    stats: {
      ...p.stats,
      ...computeMatchStatsForPlayer(p.id, matches),
      ...computeTrainingAttendanceForPlayer(p.id, trainings),
    },
  })), [players, matches, trainings]);

  const ctx = { config, updateConfig, players: playersWithStats, updatePlayers, matches, updateMatches, trainings, updateTrainings, tasks, updateTasks,
    rivals, updateRivals, season, updateSeason, planning, updatePlanning, standings, updateStandings, seasonPlanning, updateSeasonPlanning };

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
    <div className="h-screen w-full flex flex-col overflow-hidden" style={{ background: T.bg, color: T.text, fontFamily: "ui-sans-serif, system-ui, -apple-system, sans-serif" }}>
      {/* Banner de versión de demostración */}
      <div className="w-full shrink-0 px-3 py-1.5 text-center text-[11px] sm:text-xs font-bold tracking-wide" style={{ background: T.red, color: "#fff" }}>
        VERSIÓN DE DEMOSTRACIÓN · Puedes probar todo libremente — nada se guarda y se reinicia al recargar la página
      </div>
    <div className="w-full flex overflow-hidden flex-1 min-h-0">
      {/* Sidebar */}
      <aside className={`fixed lg:static z-40 h-full flex flex-col shrink-0 transition-transform duration-200 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
        style={{ width: 240, background: T.navy }}>
        <div className="px-5 py-5 flex items-center gap-2.5 border-b border-white/10">
          {config.logo ? (
            <img src={config.logo} alt="Escudo del equipo" className="w-9 h-9 rounded-lg object-cover shrink-0" style={{ background: "#fff" }} />
          ) : (
            <div className="w-9 h-9 rounded-lg flex items-center justify-center font-black text-sm shrink-0" style={{ background: T.red, color: "#fff" }}>PZ</div>
          )}
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
      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="flex items-center gap-3 px-4 sm:px-6 py-3 bg-white border-b shrink-0" style={{ borderColor: T.line }}>
          <button className="lg:hidden p-1.5" onClick={() => setSidebarOpen(true)}><Menu size={20} /></button>
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
          ) : view === "informes" ? (
            <InformesModule ctx={ctx} />
          ) : view === "configuracion" ? (
            <Configuracion ctx={ctx} />
          ) : null}
        </main>
      </div>
    </div>
    </div>
  );
}

/* ============================================================
   DASHBOARD
   ============================================================ */

/* Interpreta el marcador de un partido considerando si jugamos de local o visitante,
   ya que el resultadoFinal siempre se guarda como "local-visitante". */
function resultadoPropio(m) {
  const [a, b] = (m.resultadoFinal || "0-0").split("-").map(Number);
  const golesPropios = m.esLocal ? (a || 0) : (b || 0);
  const golesRival = m.esLocal ? (b || 0) : (a || 0);
  const resultado = golesPropios > golesRival ? "V" : golesPropios === golesRival ? "E" : "D";
  return { golesPropios, golesRival, resultado };
}

function computeTeamStats(matches) {
  let v = 0, e = 0, d = 0, gf = 0, gc = 0;
  matches.forEach((m) => {
    const { golesPropios, golesRival, resultado } = resultadoPropio(m);
    gf += golesPropios; gc += golesRival;
    if (resultado === "V") v++; else if (resultado === "E") e++; else d++;
  });
  return { v, e, d, gf, gc, jugados: matches.length };
}

const MATCH_DURATION_BY_TIPO = { "Fútbol 5": 40, "Fútbol 7": 50, "Fútbol 8": 60, "Fútbol 11": 90 };

/* Recalcula, a partir del historial real de partidos, las estadísticas de un jugador:
   convocatorias, titularidades, suplencias, minutos jugados (considerando cambios),
   goles, asistencias y tarjetas. Así todo queda alimentado desde un único lugar. */
function computeMatchStatsForPlayer(playerId, matches) {
  let convocatorias = 0, titular = 0, suplente = 0, minutos = 0, goles = 0, asistencias = 0, amarillas = 0, rojas = 0, capitanias = 0;
  const valoraciones = [];
  matches.slice().sort((a, b) => a.fecha.localeCompare(b.fecha)).forEach((m) => {
    const conv = (m.convocatoria || []).find((c) => c.jugadorId === playerId);
    if (!conv || conv.estado !== "Convocado") return;
    convocatorias++;
    if (m.capitanId === playerId) capitanias++;
    if (m.valoracionesJugadores && m.valoracionesJugadores[playerId] != null) valoraciones.push(m.valoracionesJugadores[playerId]);
    const duracion = MATCH_DURATION_BY_TIPO[m.tipoFutbol] || 90;
    const eraTitular = (m.alineacion || []).some((s) => s.jugadorId === playerId);
    const cambios = m.cambios || [];
    if (eraTitular) {
      titular++;
      const sale = cambios.find((c) => c.saleId === playerId);
      minutos += sale ? Number(sale.minuto) || 0 : duracion;
    } else {
      const entra = cambios.find((c) => c.entraId === playerId);
      if (entra) {
        suplente++;
        const minutoEntra = Number(entra.minuto) || 0;
        const saleDespues = cambios.find((c) => c.saleId === playerId && Number(c.minuto) > minutoEntra);
        minutos += (saleDespues ? Number(saleDespues.minuto) : duracion) - minutoEntra;
      } else {
        suplente++; // convocado, no jugó
      }
    }
    (m.goles || []).forEach((g) => {
      if (g.jugadorId === playerId) goles++;
      if (g.asistenciaId === playerId) asistencias++;
    });
    (m.tarjetas || []).forEach((t) => {
      if (t.jugadorId !== playerId) return;
      if ((t.tipo || "").toLowerCase().includes("roja")) rojas++;
      else if ((t.tipo || "").toLowerCase().includes("amarilla")) amarillas++;
    });
  });
  return { convocatorias, titular, suplente, minutos, goles, asistencias, amarillas, rojas, capitanias, valoraciones };
}

/* Recalcula el % de asistencia a entrenamientos desde el historial real de sesiones.
   Nunca puede superar el 100%: se basa en cuántas sesiones tenían al jugador registrado
   y en cuántas de esas realmente asistió (baja si faltó o estuvo lesionado). */
function computeTrainingAttendanceForPlayer(playerId, trainings) {
  let entrenamientosTotales = 0, entrenamientosRealizados = 0;
  trainings.forEach((t) => {
    const row = (t.asistencia || []).find((a) => a.jugadorId === playerId);
    if (!row) return;
    entrenamientosTotales++;
    if (row.estado === "Asiste") entrenamientosRealizados++;
  });
  return { entrenamientosTotales, entrenamientosRealizados };
}

function StandingsCard({ standings, onEdit, teamStats, casaStats, fueraStats, puntosCasa, puntosFuera }) {
  const s = standings || DEFAULT_STANDINGS;
  const hasData = s.posicion != null;
  const puntos = teamStats.v * 3 + teamStats.e;
  const Cell = ({ value, label, color, big }) => (
    <div className="flex-1 min-w-[64px] flex flex-col items-center justify-center text-center rounded-xl py-2.5 px-1" style={{ background: "#F5F7FA", border: `1px solid ${T.line}` }}>
      <div className={big ? "text-2xl font-black" : "text-xl font-extrabold"} style={{ color }}>{value}</div>
      <div className="text-[10px] font-bold uppercase tracking-wide mt-0.5 text-center" style={{ color: T.muted }}>{label}</div>
    </div>
  );
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <Eyebrow>Clasificación en la liga</Eyebrow>
        <div className="flex gap-2">
          {s.enlace && (
            <a href={s.enlace} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
              <Btn variant="ghost">Ver tabla completa ↗</Btn>
            </a>
          )}
          <Btn variant="ghost" icon={Edit3} onClick={onEdit}>{hasData ? "Actualizar" : "Cargar datos"}</Btn>
        </div>
      </div>
      {!hasData ? (
        <div className="text-sm" style={{ color: T.muted }}>Todavía no has cargado la posición del equipo. Toca "Cargar datos" e indica tu posición y el total de equipos de la liga — el resto de las estadísticas se calculan solas a partir de los partidos de Liga que registres.</div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="text-[11px] mb-1" style={{ color: T.muted }}>Posición cargada a mano; el resto se calcula automáticamente desde los partidos de competición Liga.</div>
          <div className="flex gap-2 flex-wrap">
            <Cell big value={<>{s.posicion}º{s.totalEquipos ? <span className="text-sm font-bold" style={{ color: T.muted }}>/{s.totalEquipos}</span> : ""}</>} label="Posición" color={T.navy} />
            <Cell value={puntos} label="Puntos" color={T.red} />
            <Cell value={teamStats.jugados} label="Jugados" color={T.navy} />
            <Cell value={teamStats.v} label="Ganados" color={T.green} />
            <Cell value={teamStats.e} label="Empatados" color={T.yellow} />
            <Cell value={teamStats.d} label="Perdidos" color={T.redLight} />
            <Cell value={`${teamStats.gf}:${teamStats.gc}`} label="Goles" color={T.navy} />
          </div>
          <div className="grid grid-cols-2 gap-3 pt-3 border-t" style={{ borderColor: T.line }}>
            <div className="rounded-xl p-2.5" style={{ background: "#F5F7FA", border: `1px solid ${T.line}` }}>
              <div className="text-[11px] font-bold uppercase mb-1.5 text-center" style={{ color: T.muted }}>En casa</div>
              <div className="flex justify-center gap-1.5 flex-wrap">
                <Cell value={casaStats.jugados} label="PJ" color={T.navy} />
                <Cell value={casaStats.v} label="G" color={T.green} />
                <Cell value={casaStats.e} label="E" color={T.yellow} />
                <Cell value={casaStats.d} label="P" color={T.redLight} />
                <Cell value={puntosCasa} label="Pts" color={T.red} />
              </div>
            </div>
            <div className="rounded-xl p-2.5" style={{ background: "#F5F7FA", border: `1px solid ${T.line}` }}>
              <div className="text-[11px] font-bold uppercase mb-1.5 text-center" style={{ color: T.muted }}>Fuera de casa</div>
              <div className="flex justify-center gap-1.5 flex-wrap">
                <Cell value={fueraStats.jugados} label="PJ" color={T.navy} />
                <Cell value={fueraStats.v} label="G" color={T.green} />
                <Cell value={fueraStats.e} label="E" color={T.yellow} />
                <Cell value={fueraStats.d} label="P" color={T.redLight} />
                <Cell value={puntosFuera} label="Pts" color={T.red} />
              </div>
            </div>
          </div>
          {s.actualizadoEl && <div className="text-[11px]" style={{ color: T.muted }}>Actualizado el {s.actualizadoEl}</div>}
        </div>
      )}
    </Card>
  );
}

function StandingsForm({ initial, onClose, onSave }) {
  const [f, setF] = useState(initial || DEFAULT_STANDINGS);
  const set = (k, v) => setF((p) => ({ ...p, [k]: v === "" ? null : v }));
  const setNum = (k, v) => setF((p) => ({ ...p, [k]: v === "" ? null : Number(v) }));
  const setHomeAway = (group, k, v) => setF((p) => ({ ...p, [group]: { ...p[group], [k]: v === "" ? null : Number(v) } }));

  return (
    <Modal title="Clasificación en la liga" onClose={onClose} wide>
      <div className="text-sm mb-4" style={{ color: T.muted }}>Solo necesitas indicar tu posición y el total de equipos de la liga — el resto de las estadísticas (puntos, jugados, ganados, goles, casa/fuera) se calculan solas a partir de los partidos de competición "Liga" que registres.</div>
      <div className="flex flex-col gap-4">
        <Field label="Enlace a la tabla de posiciones oficial (opcional)">
          <TextInput type="url" placeholder="https://..." value={f.enlace || ""} onChange={(e) => set("enlace", e.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Posición"><TextInput type="number" value={f.posicion ?? ""} onChange={(e) => setNum("posicion", e.target.value)} /></Field>
          <Field label="Total equipos"><TextInput type="number" value={f.totalEquipos ?? ""} onChange={(e) => setNum("totalEquipos", e.target.value)} /></Field>
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-5 sticky bottom-0 bg-white -mx-5 px-5 py-3 border-t" style={{ borderColor: T.line }}>
        <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
        <Btn variant="accent" icon={Save} onClick={() => onSave({ ...f, actualizadoEl: todayISO() })}>Guardar</Btn>
      </div>
    </Modal>
  );
}

function Dashboard({ ctx, goto }) {
  const { config, players, matches, trainings, standings, updateStandings, updateMatches } = ctx;
  const [editingStandings, setEditingStandings] = useState(false);
  const [viewingMatch, setViewingMatch] = useState(null);
  const ligaMatches = useMemo(() => matches.filter((m) => m.competicion === "Liga"), [matches]);
  const amistosoMatches = useMemo(() => matches.filter((m) => m.competicion === "Amistoso"), [matches]);
  const torneoMatches = useMemo(() => matches.filter((m) => m.competicion === "Torneo"), [matches]);
  const teamStats = useMemo(() => computeTeamStats(ligaMatches), [ligaMatches]);
  const amistosoStats = useMemo(() => computeTeamStats(amistosoMatches), [amistosoMatches]);
  const torneoStats = useMemo(() => computeTeamStats(torneoMatches), [torneoMatches]);
  const disponibles = players.filter((p) => p.estado === "Disponible").length;
  const lesionados = players.filter((p) => p.estado === "Lesionado").length;
  const sancionados = players.filter((p) => p.estado === "Sancionado").length;
  const amarillas = players.reduce((s, p) => s + p.stats.amarillas, 0);
  const rojas = players.reduce((s, p) => s + p.stats.rojas, 0);
  const avgRating = players.length ? (players.reduce((s, p) => s + (p.manualRating ?? avgLast(p.stats.valoraciones)), 0) / players.length).toFixed(1) : "-";

  const today = todayISO();
  const sortedMatchesAsc = [...matches].sort((a, b) => a.fecha.localeCompare(b.fecha));
  const pastMatches = sortedMatchesAsc.filter((m) => m.fecha <= today);
  const futureMatches = sortedMatchesAsc.filter((m) => m.fecha > today);
  const lastMatch = pastMatches[pastMatches.length - 1];
  const nextMatch = futureMatches[0];

  const sortedTrainingsAsc = [...trainings].sort((a, b) => a.fecha.localeCompare(b.fecha));
  const pastTrainings = sortedTrainingsAsc.filter((t) => t.fecha <= today);
  const futureTrainings = sortedTrainingsAsc.filter((t) => t.fecha > today);
  const lastTraining = pastTrainings[pastTrainings.length - 1];
  const nextTraining = futureTrainings[0] || sortedTrainingsAsc[sortedTrainingsAsc.length - 1];

  // La clasificación (posición y total de equipos) se carga a mano; el resto de estadísticas
  // de Liga se calculan siempre en automático a partir de los partidos de competición oficial.
  const s = standings || {};
  const { v, e, d, gf, gc } = teamStats;
  const jugadosRecord = v + e + d;
  const pctVictorias = jugadosRecord ? Math.round((v / jugadosRecord) * 100) : 0;

  const casaMatches = ligaMatches.filter((m) => m.esLocal);
  const fueraMatches = ligaMatches.filter((m) => !m.esLocal);
  const casaStats = computeTeamStats(casaMatches);
  const fueraStats = computeTeamStats(fueraMatches);
  const puntosCasa = casaStats.v * 3 + casaStats.e;
  const puntosFuera = fueraStats.v * 3 + fueraStats.e;

  return (
    <div className="flex flex-col gap-6 max-w-6xl">
      <div>
        <Eyebrow>Panel informativo</Eyebrow>
        <div className="flex items-baseline gap-3 flex-wrap">
          <h1 className="text-2xl sm:text-3xl font-extrabold" style={{ color: T.navy }}>{config.teamName}</h1>
          <Pill color={T.navy} bg="#EEF2F8">{config.category}</Pill>
          <Pill color={T.red} bg="#FCEAEC">{config.season}</Pill>
        </div>
        <div className="mt-3"><PitchDivider /></div>
      </div>

      <StandingsCard standings={standings} onEdit={() => setEditingStandings(true)} teamStats={teamStats} casaStats={casaStats} fueraStats={fueraStats} puntosCasa={puntosCasa} puntosFuera={puntosFuera} />
      {editingStandings && <StandingsForm initial={standings} onClose={() => setEditingStandings(false)}
        onSave={(s2) => { updateStandings(s2); setEditingStandings(false); }} />}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatTile label="Jugadores" value={players.length} icon={Users} sub={`${disponibles} disponibles`} />
        <StatTile label="Sesiones" value={trainings.length} icon={Dumbbell} />
        <StatTile label="Valoración media" value={avgRating} icon={Star} accent={T.yellow} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="p-4">
          <Eyebrow>Récord de Liga</Eyebrow>
          <div className="flex items-end justify-center gap-4 mt-2 flex-wrap text-center">
            <div><div className="text-2xl font-extrabold" style={{ color: T.green }}>{v}</div><div className="text-[11px] font-bold uppercase" style={{ color: T.muted }}>Victorias</div></div>
            <div><div className="text-2xl font-extrabold" style={{ color: T.yellow }}>{e}</div><div className="text-[11px] font-bold uppercase" style={{ color: T.muted }}>Empates</div></div>
            <div><div className="text-2xl font-extrabold" style={{ color: T.redLight }}>{d}</div><div className="text-[11px] font-bold uppercase" style={{ color: T.muted }}>Derrotas</div></div>
            <div><div className="text-2xl font-extrabold" style={{ color: T.navy }}>{pctVictorias}%</div><div className="text-[11px] font-bold uppercase" style={{ color: T.muted }}>% Victorias</div></div>
          </div>
        </Card>
        <Card className="p-4">
          <Eyebrow>Goles de Liga</Eyebrow>
          <div className="flex items-end justify-center gap-4 mt-2 text-center">
            <div><div className="text-2xl font-extrabold" style={{ color: T.navy }}>{gf}</div><div className="text-[11px] font-bold uppercase" style={{ color: T.muted }}>A favor</div></div>
            <div><div className="text-2xl font-extrabold" style={{ color: T.navy }}>{gc}</div><div className="text-[11px] font-bold uppercase" style={{ color: T.muted }}>En contra</div></div>
            <div><div className="text-2xl font-extrabold" style={{ color: T.navy }}>{gf - gc >= 0 ? "+" : ""}{gf - gc}</div><div className="text-[11px] font-bold uppercase" style={{ color: T.muted }}>Diferencia</div></div>
          </div>
        </Card>
        <Card className="p-4">
          <Eyebrow>Disciplina</Eyebrow>
          <div className="flex items-end justify-center gap-4 mt-2 text-center">
            <div><div className="text-2xl font-extrabold" style={{ color: T.yellow }}>{amarillas}</div><div className="text-[11px] font-bold uppercase" style={{ color: T.muted }}>Amarillas</div></div>
            <div><div className="text-2xl font-extrabold" style={{ color: T.redLight }}>{rojas}</div><div className="text-[11px] font-bold uppercase" style={{ color: T.muted }}>Rojas</div></div>
            <div><div className="text-2xl font-extrabold" style={{ color: T.navy }}>{lesionados + sancionados}</div><div className="text-[11px] font-bold uppercase" style={{ color: T.muted }}>No disponibles</div></div>
          </div>
        </Card>
      </div>

      {(amistosoMatches.length > 0 || torneoMatches.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {amistosoMatches.length > 0 && (
            <Card className="p-4">
              <Eyebrow>Palmarés de amistosos</Eyebrow>
              <div className="flex items-end justify-center gap-4 mt-2 flex-wrap text-center">
                <div><div className="text-2xl font-extrabold" style={{ color: T.green }}>{amistosoStats.v}</div><div className="text-[11px] font-bold uppercase" style={{ color: T.muted }}>Victorias</div></div>
                <div><div className="text-2xl font-extrabold" style={{ color: T.yellow }}>{amistosoStats.e}</div><div className="text-[11px] font-bold uppercase" style={{ color: T.muted }}>Empates</div></div>
                <div><div className="text-2xl font-extrabold" style={{ color: T.redLight }}>{amistosoStats.d}</div><div className="text-[11px] font-bold uppercase" style={{ color: T.muted }}>Derrotas</div></div>
                <div><div className="text-2xl font-extrabold" style={{ color: T.navy }}>{amistosoStats.gf}:{amistosoStats.gc}</div><div className="text-[11px] font-bold uppercase" style={{ color: T.muted }}>Goles</div></div>
              </div>
            </Card>
          )}
          {torneoMatches.length > 0 && (
            <Card className="p-4">
              <Eyebrow>Torneos rápidos</Eyebrow>
              <div className="flex items-end justify-center gap-4 mt-2 flex-wrap text-center">
                <div><div className="text-2xl font-extrabold" style={{ color: T.green }}>{torneoStats.v}</div><div className="text-[11px] font-bold uppercase" style={{ color: T.muted }}>Victorias</div></div>
                <div><div className="text-2xl font-extrabold" style={{ color: T.yellow }}>{torneoStats.e}</div><div className="text-[11px] font-bold uppercase" style={{ color: T.muted }}>Empates</div></div>
                <div><div className="text-2xl font-extrabold" style={{ color: T.redLight }}>{torneoStats.d}</div><div className="text-[11px] font-bold uppercase" style={{ color: T.muted }}>Derrotas</div></div>
                <div><div className="text-2xl font-extrabold" style={{ color: T.navy }}>{torneoStats.gf}:{torneoStats.gc}</div><div className="text-[11px] font-bold uppercase" style={{ color: T.muted }}>Goles</div></div>
              </div>
            </Card>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Card className="p-4">
          <Eyebrow>Último partido</Eyebrow>
          {lastMatch ? (
            <div className="mt-2">
              <div className="font-extrabold" style={{ color: T.navy }}>{config.teamName} {lastMatch.resultadoFinal} {lastMatch.rival}</div>
              <div className="text-xs mt-1" style={{ color: T.muted }}>{lastMatch.fecha} · Jornada {lastMatch.jornada} · {lastMatch.competicion}</div>
              <button onClick={() => setViewingMatch(lastMatch)} className="text-xs font-bold mt-2 flex items-center gap-1" style={{ color: T.red }}>Ver detalle del partido <ChevronRight size={14} /></button>
            </div>
          ) : <div className="text-sm mt-2" style={{ color: T.muted }}>Sin partidos jugados todavía.</div>}
        </Card>
        <Card className="p-4">
          <Eyebrow>Próximo partido</Eyebrow>
          {nextMatch ? (
            <div className="mt-2">
              <div className="font-extrabold" style={{ color: T.navy }}>vs {nextMatch.rival}</div>
              <div className="text-xs mt-1" style={{ color: T.muted }}>{nextMatch.fecha} · {nextMatch.campo || "Campo por confirmar"}</div>
              <button onClick={() => setViewingMatch(nextMatch)} className="text-xs font-bold mt-2 flex items-center gap-1" style={{ color: T.red }}>Ver detalle del partido <ChevronRight size={14} /></button>
            </div>
          ) : <div className="text-sm mt-2" style={{ color: T.muted }}>Sin próximo partido programado.</div>}
        </Card>
        <Card className="p-4">
          <Eyebrow>Última sesión realizada</Eyebrow>
          {lastTraining ? (
            <div className="mt-2">
              <div className="font-extrabold" style={{ color: T.navy }}>{lastTraining.objetivoGeneral}</div>
              <div className="text-xs mt-1" style={{ color: T.muted }}>{lastTraining.fecha} · {lastTraining.hora} · {lastTraining.lugar}</div>
              <button onClick={() => goto("entrenamientos")} className="text-xs font-bold mt-2 flex items-center gap-1" style={{ color: T.red }}>Ver entrenamientos <ChevronRight size={14} /></button>
            </div>
          ) : <div className="text-sm mt-2" style={{ color: T.muted }}>Sin sesiones realizadas todavía.</div>}
        </Card>
        <Card className="p-4">
          <Eyebrow>Próxima sesión</Eyebrow>
          {nextTraining ? (
            <div className="mt-2">
              <div className="font-extrabold" style={{ color: T.navy }}>{nextTraining.objetivoGeneral}</div>
              <div className="text-xs mt-1 flex items-center gap-1" style={{ color: T.muted }}><MapPin size={12} />{nextTraining.lugar || "Lugar por confirmar"} · {nextTraining.fecha} · {nextTraining.hora}</div>
              <button onClick={() => goto("entrenamientos")} className="text-xs font-bold mt-2 flex items-center gap-1" style={{ color: T.red }}>Ver entrenamientos <ChevronRight size={14} /></button>
            </div>
          ) : <div className="text-sm mt-2" style={{ color: T.muted }}>Sin sesiones programadas.</div>}
        </Card>
      </div>

      <SmartAlerts ctx={ctx} />

      {viewingMatch && (
        <MatchDetailView match={viewingMatch} players={players} config={config}
          onClose={() => setViewingMatch(null)}
          onEdit={() => { setViewingMatch(null); goto("partidos"); }}
          onDelete={() => { if (confirm("¿Eliminar este partido?")) { updateMatches((prev) => prev.filter((x) => x.id !== viewingMatch.id)); setViewingMatch(null); } }} />
      )}
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
  const [viewMode, setViewMode] = useState("grid");
  const [editingPlayer, setEditingPlayer] = useState(null);

  const deletePlayer = (p) => {
    if (confirm(`¿Eliminar a ${p.nombre}? Esta acción no se puede deshacer.`)) {
      updatePlayers((prev) => prev.filter((x) => x.id !== p.id));
    }
  };

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

      <div className="flex flex-wrap items-center gap-2">
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
        <div className="flex items-center rounded-xl border overflow-hidden ml-auto" style={{ borderColor: T.line }}>
          <button onClick={() => setViewMode("grid")} className="px-3 py-2 text-xs font-bold flex items-center gap-1.5"
            style={{ background: viewMode === "grid" ? T.navy : "#fff", color: viewMode === "grid" ? "#fff" : T.muted }}>
            <LayoutGrid size={14} />Tarjetas
          </button>
          <button onClick={() => setViewMode("list")} className="px-3 py-2 text-xs font-bold flex items-center gap-1.5 border-l"
            style={{ background: viewMode === "list" ? T.navy : "#fff", color: viewMode === "list" ? "#fff" : T.muted, borderColor: T.line }}>
            <ClipboardList size={14} />Listado
          </button>
        </div>
      </div>

      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {list.map((p) => {
            const sc = stateColor(p.estado);
            const pct = Math.round((p.stats.entrenamientosRealizados / p.stats.entrenamientosTotales) * 100);
            return (
              <Card key={p.id} className="p-4 cursor-pointer hover:shadow-md transition relative" onClick={() => onSelect(p.id)}>
                <div className="absolute top-3 right-3 flex gap-1 z-10">
                  <button onClick={(e) => { e.stopPropagation(); setEditingPlayer(p); }} className="p-1.5 rounded-lg hover:bg-slate-100" title="Editar">
                    <Edit3 size={14} style={{ color: T.muted }} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); deletePlayer(p); }} className="p-1.5 rounded-lg hover:bg-red-50" title="Eliminar">
                    <Trash2 size={14} style={{ color: T.redLight }} />
                  </button>
                </div>
                <div className="flex items-start justify-between pr-14">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center font-extrabold text-white shrink-0" style={{ background: T.navy }}>{p.numero}</div>
                    <div>
                      <div className="font-extrabold leading-tight" style={{ color: T.navy }}>{p.apodo || p.nombre}</div>
                      <div className="text-xs" style={{ color: T.muted }}>{p.posicion}</div>
                    </div>
                  </div>
                </div>
                <div className="mt-1"><Pill color={sc.color} bg={sc.bg}>{p.estado}</Pill></div>
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
      ) : (
        <Card className="overflow-hidden">
          <div className="hidden sm:grid grid-cols-[2.5rem_1fr_6rem_5rem_5rem_5rem_5rem_4rem] gap-2 px-4 py-2.5 text-[11px] font-bold uppercase" style={{ color: T.muted, background: "#F7F8FA" }}>
            <span>#</span><span>Jugador</span><span>Estado</span><span>Rank</span><span>Goles</span><span>Min</span><span>Asist.</span><span></span>
          </div>
          <div className="divide-y" style={{ borderColor: T.line }}>
            {list.map((p) => {
              const sc = stateColor(p.estado);
              const pct = Math.round((p.stats.entrenamientosRealizados / p.stats.entrenamientosTotales) * 100);
              return (
                <div key={p.id} onClick={() => onSelect(p.id)}
                  className="grid grid-cols-[2.5rem_1fr_6rem_5rem_5rem_5rem_5rem_4rem] gap-2 px-4 py-2.5 items-center cursor-pointer hover:bg-slate-50 transition text-sm">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center font-extrabold text-white text-xs" style={{ background: T.navy }}>{p.numero}</div>
                  <div className="min-w-0">
                    <div className="font-bold truncate" style={{ color: T.navy }}>{p.apodo || p.nombre}</div>
                    <div className="text-[11px] truncate" style={{ color: T.muted }}>{p.posicion}</div>
                  </div>
                  <div><Pill color={sc.color} bg={sc.bg}>{p.estado}</Pill></div>
                  <div className="font-bold tabular-nums" style={{ color: T.navy }}>{p.ranking}</div>
                  <div className="tabular-nums">{p.stats.goles}</div>
                  <div className="tabular-nums">{p.stats.minutos}</div>
                  <div className="font-bold tabular-nums">{pct}%</div>
                  <div className="flex gap-1 justify-end">
                    <button onClick={(e) => { e.stopPropagation(); setEditingPlayer(p); }} className="p-1.5 rounded-lg hover:bg-slate-100" title="Editar">
                      <Edit3 size={14} style={{ color: T.muted }} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); deletePlayer(p); }} className="p-1.5 rounded-lg hover:bg-red-50" title="Eliminar">
                      <Trash2 size={14} style={{ color: T.redLight }} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {showNew && <PlayerForm ctx={ctx} onClose={() => setShowNew(false)} onSave={(p) => { updatePlayers((prev) => [...prev, p]); setShowNew(false); }} />}
      {editingPlayer && <PlayerForm ctx={ctx} initial={editingPlayer} onClose={() => setEditingPlayer(null)}
        onSave={(np) => { updatePlayers((prev) => prev.map((x) => x.id === np.id ? np : x)); setEditingPlayer(null); }} />}
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
      custom: {}, pruebasFisicas: [],
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
        {[["general", "General"], ["rendimiento", "Rendimiento"], ["fisico", "Físico"], ["entrenamiento", "Entrenamiento"], ["historial", "Historial"]].map(([k, l]) => (
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
              ["Goles", p.stats.goles], ["Asistencias", p.stats.asistencias], ["Amarillas", p.stats.amarillas], ["Rojas", p.stats.rojas], ["Capitanías", p.stats.capitanias]].map(([l, v]) => (
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

      {tab === "fisico" && <PhysicalTestsPanel ctx={ctx} player={p} />}

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

/* ---------------- Pruebas físicas (con evolución) ---------------- */

const FLEX_LABELS = { "-2": "-2 · Muy limitada", "-1": "-1 · Limitada", "0": "0 · Normal", "1": "+1 · Buena", "2": "+2 · Muy buena", "3": "+3 · Excelente" };

function PhysicalTestsPanel({ ctx, player }) {
  const { updatePlayers } = ctx;
  const [showForm, setShowForm] = useState(false);
  const [editTest, setEditTest] = useState(null);
  const tests = [...(player.pruebasFisicas || [])].sort((a, b) => a.fecha.localeCompare(b.fecha));
  const last = tests[tests.length - 1];
  const first = tests[0];

  const saveTests = (nextTests) => updatePlayers((prev) => prev.map((x) => x.id === player.id ? { ...x, pruebasFisicas: nextTests } : x));
  const addTest = (t) => { saveTests([...tests, t]); setShowForm(false); };
  const editSave = (t) => { saveTests(tests.map((x) => x.id === t.id ? t : x)); setEditTest(null); };
  const removeTest = (id) => { if (confirm("¿Eliminar este test?")) saveTests(tests.filter((x) => x.id !== id)); setEditTest(null); };

  const metrics = [
    ["velocidad20m", "Velocidad 20m recta (s)", true],
    ["velocidadZigzag20m", "Velocidad 20m zigzag (s)", true],
    ["controlBalon", "Control de balón (seg. sin caída)", false],
    ["vo2max", "VO₂ máx. estimado (ml/kg/min)", false],
    ["abdominalesMin", "Abdominales / min", false],
    ["flexionesMin", "Flexiones de pecho / min", false],
    ["golpeoDistancia", "Golpeo / chut (metros)", false],
  ];

  return (
    <div className="flex flex-col gap-4">
      <Card className="p-5">
        <div className="flex items-center justify-between mb-1">
          <Eyebrow>Pruebas físicas — punto de partida y evolución</Eyebrow>
          <Btn variant="accent" icon={Plus} onClick={() => setShowForm(true)}>Registrar test</Btn>
        </div>
        <div className="text-xs mb-4" style={{ color: T.muted }}>Herramienta de seguimiento deportivo. No sustituye una valoración médica.</div>

        {!tests.length ? (
          <div className="text-sm" style={{ color: T.muted }}>Todavía no hay tests registrados. Registra el primero como punto de partida del jugador.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {metrics.map(([key, label, lowerIsBetter]) => {
              const lastVal = last?.[key];
              const firstVal = first?.[key];
              let diff = null;
              if (lastVal != null && firstVal != null && tests.length > 1) {
                diff = +(lastVal - firstVal).toFixed(2);
              }
              const improved = diff != null && (lowerIsBetter ? diff < 0 : diff > 0);
              const worsened = diff != null && (lowerIsBetter ? diff > 0 : diff < 0);
              return (
                <div key={key} className="p-3 rounded-xl" style={{ background: "#F7F8FA" }}>
                  <div className="text-[11px] font-bold uppercase" style={{ color: T.muted }}>{label}</div>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-xl font-extrabold tabular-nums" style={{ color: T.navy }}>{lastVal ?? "-"}</span>
                    {diff != null && (
                      <span className="text-xs font-bold flex items-center gap-0.5" style={{ color: improved ? T.green : worsened ? T.redLight : T.muted }}>
                        {improved ? <TrendingUp size={12} /> : worsened ? <TrendingDown size={12} /> : <Minus size={12} />}
                        {diff > 0 ? "+" : ""}{diff}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
            <div className="p-3 rounded-xl sm:col-span-2" style={{ background: "#F7F8FA" }}>
              <div className="text-[11px] font-bold uppercase" style={{ color: T.muted }}>Flexibilidad</div>
              <div className="text-xl font-extrabold" style={{ color: T.navy }}>{last?.flexibilidad != null ? FLEX_LABELS[String(last.flexibilidad)] : "-"}</div>
            </div>
          </div>
        )}
      </Card>

      {tests.length > 0 && (
        <Card className="p-5">
          <Eyebrow>Historial de tests</Eyebrow>
          <div className="flex flex-col gap-2 mt-3">
            {[...tests].reverse().map((t) => (
              <div key={t.id} onClick={() => setEditTest(t)} className="flex items-center justify-between p-3 rounded-xl cursor-pointer hover:shadow-sm transition" style={{ background: "#F7F8FA" }}>
                <div>
                  <div className="text-sm font-bold" style={{ color: T.navy }}>{t.fecha}</div>
                  <div className="text-xs" style={{ color: T.muted }}>{t.observaciones || "Sin observaciones"}</div>
                </div>
                <ChevronRight size={16} style={{ color: T.muted }} />
              </div>
            ))}
          </div>
        </Card>
      )}

      {showForm && <PhysicalTestForm onClose={() => setShowForm(false)} onSave={addTest} onDelete={null} />}
      {editTest && <PhysicalTestForm initial={editTest} onClose={() => setEditTest(null)} onSave={editSave} onDelete={() => removeTest(editTest.id)} />}
    </div>
  );
}

function PhysicalTestForm({ initial, onClose, onSave, onDelete }) {
  const [f, setF] = useState(initial || {
    id: uid(), fecha: todayISO(), velocidad20m: "", velocidadZigzag20m: "", controlBalon: "",
    vo2max: "", abdominalesMin: "", flexionesMin: "", golpeoDistancia: "", flexibilidad: 0, observaciones: "",
  });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const submit = () => onSave({
    ...f,
    velocidad20m: f.velocidad20m === "" ? null : Number(f.velocidad20m),
    velocidadZigzag20m: f.velocidadZigzag20m === "" ? null : Number(f.velocidadZigzag20m),
    controlBalon: f.controlBalon === "" ? null : Number(f.controlBalon),
    vo2max: f.vo2max === "" ? null : Number(f.vo2max),
    abdominalesMin: f.abdominalesMin === "" ? null : Number(f.abdominalesMin),
    flexionesMin: f.flexionesMin === "" ? null : Number(f.flexionesMin),
    golpeoDistancia: f.golpeoDistancia === "" ? null : Number(f.golpeoDistancia),
    flexibilidad: Number(f.flexibilidad),
  });

  return (
    <Modal title={initial ? "Editar test físico" : "Nuevo test físico"} onClose={onClose} wide>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Fecha del test"><TextInput type="date" value={f.fecha} onChange={(e) => set("fecha", e.target.value)} /></Field>
        <Field label="Flexibilidad">
          <Select value={f.flexibilidad} onChange={(e) => set("flexibilidad", e.target.value)}>
            {Object.entries(FLEX_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </Select>
        </Field>
        <Field label="Velocidad 20m línea recta (segundos)"><TextInput type="number" step="0.01" value={f.velocidad20m} onChange={(e) => set("velocidad20m", e.target.value)} /></Field>
        <Field label="Velocidad 20m zigzag (segundos)"><TextInput type="number" step="0.01" value={f.velocidadZigzag20m} onChange={(e) => set("velocidadZigzag20m", e.target.value)} /></Field>
        <Field label="Control de balón (segundos sin que caiga)"><TextInput type="number" value={f.controlBalon} onChange={(e) => set("controlBalon", e.target.value)} /></Field>
        <Field label="VO₂ máx. estimado (ml/kg/min)"><TextInput type="number" value={f.vo2max} onChange={(e) => set("vo2max", e.target.value)} /></Field>
        <Field label="Abdominales en 1 minuto"><TextInput type="number" value={f.abdominalesMin} onChange={(e) => set("abdominalesMin", e.target.value)} /></Field>
        <Field label="Flexiones de pecho en 1 minuto"><TextInput type="number" value={f.flexionesMin} onChange={(e) => set("flexionesMin", e.target.value)} /></Field>
        <Field label="Golpeo / chut (metros de alcance)"><TextInput type="number" step="0.1" value={f.golpeoDistancia} onChange={(e) => set("golpeoDistancia", e.target.value)} /></Field>
        <Field label="Observaciones" className="sm:col-span-2"><TextArea value={f.observaciones} onChange={(e) => set("observaciones", e.target.value)} /></Field>
      </div>
      <div className="flex justify-between gap-2 mt-5 sticky bottom-0 bg-white -mx-5 px-5 py-3 border-t" style={{ borderColor: T.line }}>
        {onDelete ? <Btn variant="danger" icon={Trash2} onClick={onDelete}>Eliminar</Btn> : <div />}
        <div className="flex gap-2">
          <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
          <Btn variant="accent" icon={Save} onClick={submit}>Guardar test</Btn>
        </div>
      </div>
    </Modal>
  );
}

/* ============================================================
   PARTIDOS
   ============================================================ */

function printMatch(m, config, players) {
  const esc = (s) => (s || "").toString().replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c]));
  const playerName = (id) => { const p = players.find((x) => x.id === id); return p ? (p.apodo || p.nombre) : "?"; };
  const { resultado: resTag1 } = resultadoPropio(m);
  const resColor = resTag1 === "V" ? "#2A9D5C" : resTag1 === "E" ? "#F4B400" : "#FF6B6B";
  const convocados = (m.convocatoria || []).filter((c) => c.estado !== "No convocado");
  const titularIds = new Set((m.alineacion || []).filter((s) => s.jugadorId).map((s) => s.jugadorId));
  const titulares = convocados.filter((c) => c.estado === "Convocado" && titularIds.has(c.jugadorId));
  const banquillo = convocados.filter((c) => c.estado === "Convocado" && !titularIds.has(c.jugadorId));
  const kv = (label, value) => `<div class="kv"><span class="kvLabel">${esc(label)}</span><span class="kvValue">${esc(value) || "—"}</span></div>`;
  const list = (title, color, arr, render) => arr?.length ? `<div class="section"><div class="sectionTitle" style="background:${color};">${esc(title)}</div>${arr.map(render).join("")}</div>` : "";
  const line = (text) => `<div class="lineItem">${text}</div>`;

  const barChart = (label, value) => `
    <div class="barRow">
      <span class="barLabel">${esc(label)}</span>
      <div class="barTrack"><div class="barFill" style="width:${(value || 0) * 10}%;"></div></div>
      <span class="barVal">${value ?? "-"}</span>
    </div>`;

  let pitchHtml = "";
  if (m.alineacion?.some((s) => s.jugadorId)) {
    const dots = m.alineacion.filter((s) => s.jugadorId).map((s) => {
      const p = players.find((pl) => pl.id === s.jugadorId);
      if (!p) return "";
      return `<div class="dot" style="left:${s.x}%; top:${s.y}%;"><div class="dotCircle">${esc(p.numero)}</div><div class="dotName">${esc(p.apodo || p.nombre?.split(" ")[0])}</div></div>`;
    }).join("");
    pitchHtml = `<div class="pitch">${dots}</div>`;
  }

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>vs ${esc(m.rival)}</title>
  <style>
    @page { size: A4; margin: 10mm; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    html, body { background: #E9EDF3; margin: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; color-adjust: exact; }
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
    body { font-family: -apple-system, Segoe UI, Roboto, Arial, sans-serif; color: #1B2733; padding: 14px; font-size: 11px; }
    .toolbar { position: sticky; top: 0; display: flex; justify-content: center; gap: 10px; padding: 8px 0 14px; z-index: 50; }
    .toolbar button { font-family: inherit; font-size: 13px; font-weight: 800; border: none; border-radius: 12px; padding: 10px 20px; cursor: pointer; box-shadow: 0 4px 14px rgba(0,0,0,0.18); }
    .btnPrint { background: #E63946; color: #fff; }
    .btnClose { background: #fff; color: #0B1F3A; border: 1.5px solid #CBD5E1 !important; }
    .sheet { max-width: 210mm; margin: 0 auto; background: #fff; border-radius: 14px; padding: 16px 22px 20px; box-shadow: 0 6px 24px rgba(11,31,58,0.15); }
    .header { display: flex; align-items: center; gap: 10px; border-bottom: 3px solid #0B1F3A; padding-bottom: 10px; margin-bottom: 12px; }
    .header img { width: 42px; height: 42px; object-fit: contain; border-radius: 10px; }
    .headerInfo { flex: 1; }
    .teamName { font-size: 14px; font-weight: 800; color: #0B1F3A; }
    .teamMeta { font-size: 9.5px; color: #64748B; margin-top: 1px; }
    .matchTitle { text-align: center; margin-bottom: 12px; }
    .matchTitle .vs { font-size: 18px; font-weight: 900; color: #0B1F3A; }
    .matchTitle .meta { font-size: 10px; color: #64748B; margin-top: 2px; }
    .score { text-align: center; font-size: 30px; font-weight: 900; color: #fff; background: ${resColor}; display: inline-block; padding: 4px 22px; border-radius: 12px; margin-top: 6px; }
    .scoreWrap { text-align: center; margin-bottom: 14px; }
    .scoreHalf { font-size: 10px; color: #64748B; margin-top: 4px; }
    .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 20px; }
    .grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px 16px; }
    .kv { display: flex; flex-direction: column; }
    .kvLabel { font-size: 9px; font-weight: 800; text-transform: uppercase; color: #94A3B8; }
    .kvValue { font-size: 11px; color: #1B2733; font-weight: 600; }
    .section { margin-top: 12px; }
    .sectionTitle { font-size: 10px; font-weight: 800; text-transform: uppercase; color: #fff; padding: 3px 10px; border-radius: 999px; display: inline-block; margin-bottom: 6px; letter-spacing: 0.3px; }
    .lineItem { font-size: 10px; color: #334155; background: #FAFBFC; border: 1px solid #E2E8F0; border-radius: 6px; padding: 3px 8px; margin-bottom: 3px; }
    .pill { display: inline-block; font-size: 9.5px; font-weight: 700; padding: 2px 8px; border-radius: 999px; background: #F5F7FA; border: 1px solid #E2E8F0; margin: 0 3px 3px 0; }
    .twoCol { display: grid; grid-template-columns: 1fr 220px; gap: 18px; align-items: start; }
    .pitch { position: relative; width: 100%; aspect-ratio: 2/3; background: linear-gradient(#2A9D5C, #22874C); border-radius: 10px; border: 2px solid #1F7A44; }
    .dot { position: absolute; transform: translate(-50%,-50%); text-align: center; }
    .dotCircle { width: 22px; height: 22px; border-radius: 999px; background: #0B1F3A; color: #fff; font-size: 9px; font-weight: 800; display: flex; align-items: center; justify-content: center; border: 1.5px solid #fff; margin: 0 auto; }
    .dotName { font-size: 7px; font-weight: 700; color: #fff; text-shadow: 0 1px 2px rgba(0,0,0,0.6); margin-top: 1px; white-space: nowrap; }
    .barRow { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }
    .barLabel { font-size: 9px; color: #64748B; width: 90px; flex-shrink: 0; }
    .barTrack { flex: 1; height: 6px; border-radius: 999px; background: #F1F5F9; overflow: hidden; }
    .barFill { height: 100%; background: #0B1F3A; }
    .barVal { font-size: 9.5px; font-weight: 800; color: #0B1F3A; width: 16px; text-align: right; }
    .footer { margin-top: 14px; text-align: center; font-size: 8.5px; color: #94A3B8; border-top: 1px solid #E2E8F0; padding-top: 8px; }
    @media print {
      html, body { background: #fff; }
      .toolbar { display: none !important; }
      .sheet { box-shadow: none; border-radius: 0; padding: 0; max-width: 100%; }
      body { padding: 0; }
    }
  </style></head>
  <body>
    <div class="toolbar">
      <button class="btnPrint" onclick="window.print()">🖨️ Imprimir / Guardar PDF</button>
      <button class="btnClose" onclick="window.close()">Cerrar vista previa</button>
    </div>
    <div class="sheet">
      <div class="header">
        ${config.logo ? `<img src="${config.logo}" />` : ""}
        <div class="headerInfo">
          <div class="teamName">${esc(config.teamName || "Equipo")}</div>
          <div class="teamMeta">${esc(config.category || "")}${config.category && config.season ? " · " : ""}${esc(config.season || "")}</div>
        </div>
      </div>

      <div class="matchTitle">
        <div class="vs">${m.esLocal ? `${esc(config.teamName)} vs ${esc(m.rival)}` : `${esc(m.rival)} vs ${esc(config.teamName)}`}</div>
        <div class="meta">${esc(m.fecha)} · Jornada ${esc(m.jornada)} · ${esc(m.competicion)} · ${esc(m.campo)}</div>
      </div>
      <div class="scoreWrap">
        <div class="score">${esc(m.resultadoFinal)}</div>
        <div class="scoreHalf">Descanso: ${esc(m.resultadoDescanso) || "-"}</div>
      </div>

      <div class="grid3" style="margin-bottom:10px;">
        ${kv("Tipo de fútbol", m.tipoFutbol)}
        ${kv("Sistema", m.sistema)}
        ${kv("Condición", m.esLocal ? "Local" : "Visitante")}
      </div>

      <div class="grid3" style="margin-bottom:2px;">
        ${kv("Camiseta", m.vestimenta?.camiseta)}
        ${kv("Pantaloneta", m.vestimenta?.pantaloneta)}
        ${kv("Medias", m.vestimenta?.medias)}
      </div>

      <div class="twoCol">
        <div>
          <div class="section">
            <div class="sectionTitle" style="background:#0B1F3A;">Titulares (${titulares.length})</div>
            <div>${titulares.map((c) => `<span class="pill">${esc(playerName(c.jugadorId))}${m.capitanId === c.jugadorId ? " (C)" : ""}</span>`).join("") || "—"}</div>
          </div>
          <div class="section">
            <div class="sectionTitle" style="background:#64748B;">Banquillo (${banquillo.length})</div>
            <div>${banquillo.map((c) => `<span class="pill">${esc(playerName(c.jugadorId))}${m.capitanId === c.jugadorId ? " (C)" : ""}</span>`).join("") || "—"}</div>
          </div>

          ${list("Goles", "#2A9D5C", m.goles, (g) => line(`Min. ${esc(g.minuto)}: ${esc(playerName(g.jugadorId))}${g.asistenciaId ? ` (asist. ${esc(playerName(g.asistenciaId))})` : ""}`))}
          ${list("Cambios", "#F4B400", m.cambios, (c) => line(`Min. ${esc(c.minuto)}: sale ${esc(playerName(c.saleId))}, entra ${esc(playerName(c.entraId))}`))}
          ${list("Tarjetas / incidencias", "#E63946", m.tarjetas, (t) => line(`Min. ${esc(t.minuto)}: ${esc(playerName(t.jugadorId))} — ${esc(t.tipo)}`))}
        </div>
        ${pitchHtml ? `<div><div class="sectionTitle" style="background:#2A9D5C;">Alineación</div>${pitchHtml}</div>` : ""}
      </div>

      <div class="section">
        <div class="sectionTitle" style="background:#E63946;">Aspectos tácticos</div>
        <div class="grid2">
          ${kv("Modelo de juego", m.tactica?.modelo)}
          ${kv("Ajustes durante el partido", m.tactica?.ajustes)}
          ${kv("Qué funcionó", m.tactica?.funciono)}
          ${kv("Qué no funcionó", m.tactica?.noFunciono)}
        </div>
      </div>

      <div class="section">
        <div class="sectionTitle" style="background:#0B1F3A;">Rendimiento por fases</div>
        ${barChart("Ataque", m.rendimiento?.ataque)}
        ${barChart("Defensa", m.rendimiento?.defensa)}
        ${barChart("Transición ofensiva", m.rendimiento?.transicionOfensiva)}
        ${barChart("Transición defensiva", m.rendimiento?.transicionDefensiva)}
        ${barChart("Balón parado ofensivo", m.rendimiento?.balonParadoOfensivo)}
        ${barChart("Balón parado defensivo", m.rendimiento?.balonParadoDefensivo)}
        <div class="grid2" style="margin-top:6px;">
          ${kv("Fortalezas", m.rendimiento?.fortalezas)}
          ${kv("Debilidades", m.rendimiento?.debilidades)}
        </div>
      </div>

      <div class="section">
        <div class="sectionTitle" style="background:#2A9D5C;">Aprendizajes</div>
        <div class="grid3">
          ${kv("Mantener", m.aprendizajes?.mantener)}
          ${kv("Corregir", m.aprendizajes?.corregir)}
          ${kv("Trabajar", m.aprendizajes?.trabajar)}
        </div>
      </div>

      ${m.observaciones ? `<div class="section"><div class="sectionTitle" style="background:#64748B;">Observaciones del entrenador</div><div class="lineItem">${esc(m.observaciones)}</div></div>` : ""}

      <div class="footer">Generado con PZ · Puntualización Zonal</div>
    </div>
  </body></html>`;
  const w = window.open("", "_blank");
  if (w) { w.document.open(); w.document.write(html); w.document.close(); }
}

function Partidos({ ctx }) {
  const { matches, updateMatches, players, config } = ctx;
  const [openId, setOpenId] = useState(null);
  const [editId, setEditId] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const sorted = [...matches].sort((a, b) => b.fecha.localeCompare(a.fecha));
  const viewing = matches.find((m) => m.id === openId);
  const editing = matches.find((m) => m.id === editId);

  return (
    <div className="flex flex-col gap-5 max-w-5xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><Eyebrow>Partidos</Eyebrow><h1 className="text-2xl font-extrabold" style={{ color: T.navy }}>{matches.length} partidos registrados</h1></div>
        <Btn icon={Plus} variant="accent" onClick={() => setShowNew(true)}>Nuevo partido</Btn>
      </div>

      <div className="flex flex-col gap-2.5">
        {sorted.map((m) => {
          const { resultado: resTag2 } = resultadoPropio(m);
          const res = resTag2 === "V" ? T.green : resTag2 === "E" ? T.yellow : T.redLight;
          return (
            <Card key={m.id} className="p-4 cursor-pointer hover:shadow-md transition relative" onClick={() => setOpenId(m.id)}>
              <div className="absolute top-3 right-3 flex gap-1 z-10">
                <button onClick={(e) => { e.stopPropagation(); printMatch(m, config, players); }} className="p-1.5 rounded-lg hover:bg-slate-100" title="Imprimir / PDF">
                  <Printer size={14} style={{ color: T.muted }} />
                </button>
                <button onClick={(e) => { e.stopPropagation(); setEditId(m.id); }} className="p-1.5 rounded-lg hover:bg-slate-100" title="Editar">
                  <Edit3 size={14} style={{ color: T.muted }} />
                </button>
                <button onClick={(e) => { e.stopPropagation(); if (confirm("¿Eliminar este partido?")) updateMatches((prev) => prev.filter((x) => x.id !== m.id)); }} className="p-1.5 rounded-lg hover:bg-red-50" title="Eliminar">
                  <Trash2 size={14} style={{ color: T.redLight }} />
                </button>
              </div>
              <div className="flex items-center justify-between flex-wrap gap-2 pr-24">
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

      {viewing && (
        <MatchDetailView match={viewing} players={players} config={config}
          onClose={() => setOpenId(null)}
          onEdit={() => { setEditId(viewing.id); setOpenId(null); }}
          onDelete={() => { if (confirm("¿Eliminar este partido?")) { updateMatches((prev) => prev.filter((x) => x.id !== viewing.id)); setOpenId(null); } }} />
      )}

      {showNew && <MatchForm ctx={ctx} onClose={() => setShowNew(false)} onSave={(m) => { updateMatches((prev) => [...prev, m]); setShowNew(false); }} />}
      {editing && <MatchForm ctx={ctx} initial={editing}
        onClose={() => setEditId(null)}
        onSave={(m) => { updateMatches((prev) => prev.map((x) => x.id === m.id ? m : x)); setEditId(null); }}
        onDelete={() => { if (confirm("¿Eliminar este partido?")) { updateMatches((prev) => prev.filter((x) => x.id !== editing.id)); setEditId(null); } }} />}
    </div>
  );
}

function MatchDetailView({ match: m, players, config, onClose, onEdit, onDelete }) {
  const playerName = (id) => players.find((p) => p.id === id)?.apodo || players.find((p) => p.id === id)?.nombre || "-";
  const convocados = (m.convocatoria || []).filter((c) => c.estado !== "No convocado");
  const { resultado: resTag3 } = resultadoPropio(m);
  const resColor = resTag3 === "V" ? T.green : resTag3 === "E" ? T.yellow : T.redLight;

  const Section = ({ title, children }) => (
    <div className="pt-4 border-t first:pt-0 first:border-0" style={{ borderColor: T.line }}>
      <Eyebrow>{title}</Eyebrow>
      <div className="mt-2">{children}</div>
    </div>
  );
  const KV = ({ label, value }) => (
    <div className="flex flex-col"><span className="text-[11px] font-bold uppercase" style={{ color: T.muted }}>{label}</span><span className="text-sm" style={{ color: T.text }}>{value || "-"}</span></div>
  );

  return (
    <Modal title={`vs ${m.rival}`} onClose={onClose} wide>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="text-xl font-extrabold" style={{ color: T.navy }}>{m.esLocal ? `${config.teamName} vs ${m.rival}` : `${m.rival} vs ${config.teamName}`}</div>
            <div className="text-xs mt-0.5" style={{ color: T.muted }}>{m.fecha} · Jornada {m.jornada} · {m.competicion} · {m.campo}</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs" style={{ color: T.muted }}>Descanso: {m.resultadoDescanso || "-"}</div>
            <div className="text-2xl font-black tabular-nums px-3 py-1 rounded-xl" style={{ color: "#fff", background: resColor }}>{m.resultadoFinal}</div>
          </div>
        </div>

        <Section title="Datos del partido">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <KV label="Tipo de fútbol" value={m.tipoFutbol} />
            <KV label="Sistema" value={m.sistema} />
            <KV label="Condición" value={m.esLocal ? "Local" : "Visitante"} />
          </div>
        </Section>

        <Section title={`Convocatoria (${convocados.length})`}>
          {convocados.length ? (
            <div className="flex flex-wrap gap-1.5">
              {convocados.map((c) => (
                <Pill key={c.jugadorId} color={c.estado === "Titular" ? T.navy : T.muted} bg={c.estado === "Titular" ? "#EEF2F8" : "#F3F4F6"}>
                  {playerName(c.jugadorId)} · {c.estado}
                </Pill>
              ))}
            </div>
          ) : <div className="text-sm" style={{ color: T.muted }}>Sin convocatoria registrada.</div>}
        </Section>

        {m.alineacion?.some((s) => s.jugadorId) && (
          <Section title="Alineación">
            <div className="max-w-[220px]">
              <PitchEditor system={m.sistema} players={players} lineup={m.alineacion} onChange={() => {}} readOnly />
            </div>
          </Section>
        )}

        <Section title="Cambios, goles y tarjetas">
          <div className="flex flex-col gap-3">
            <div>
              <div className="text-xs font-bold mb-1" style={{ color: T.navy }}>Cambios</div>
              {m.cambios?.length ? m.cambios.map((c) => (
                <div key={c.id} className="text-sm" style={{ color: T.text }}>Min. {c.minuto}: sale {playerName(c.saleId)}, entra {playerName(c.entraId)}</div>
              )) : <div className="text-xs" style={{ color: T.muted }}>Sin cambios registrados.</div>}
            </div>
            <div>
              <div className="text-xs font-bold mb-1" style={{ color: T.navy }}>Goles</div>
              {m.goles?.length ? m.goles.map((g) => (
                <div key={g.id} className="text-sm" style={{ color: T.text }}>Min. {g.minuto}: {playerName(g.jugadorId)}{g.asistenciaId ? ` (asist. ${playerName(g.asistenciaId)})` : ""}</div>
              )) : <div className="text-xs" style={{ color: T.muted }}>Sin goles registrados.</div>}
            </div>
            <div>
              <div className="text-xs font-bold mb-1" style={{ color: T.navy }}>Tarjetas / incidencias</div>
              {m.tarjetas?.length ? m.tarjetas.map((t) => (
                <div key={t.id} className="text-sm" style={{ color: T.text }}>Min. {t.minuto}: {playerName(t.jugadorId)} — {t.tipo}</div>
              )) : <div className="text-xs" style={{ color: T.muted }}>Sin tarjetas registradas.</div>}
            </div>
          </div>
        </Section>

        <Section title="Aspectos tácticos">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <KV label="Modelo de juego" value={m.tactica?.modelo} />
            <KV label="Ajustes durante el partido" value={m.tactica?.ajustes} />
            <KV label="Qué funcionó" value={m.tactica?.funciono} />
            <KV label="Qué no funcionó" value={m.tactica?.noFunciono} />
          </div>
        </Section>

        <Section title="Rendimiento por fases">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
            {[["ataque", "Ataque"], ["defensa", "Defensa"], ["transicionOfensiva", "Transición ofensiva"], ["transicionDefensiva", "Transición defensiva"], ["balonParadoOfensivo", "Balón parado ofensivo"], ["balonParadoDefensivo", "Balón parado defensivo"]].map(([k, l]) => (
              <div key={k}>
                <div className="text-[11px] font-bold uppercase" style={{ color: T.muted }}>{l}</div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden"><div className="h-full" style={{ width: `${(m.rendimiento?.[k] || 0) * 10}%`, background: T.navy3 }} /></div>
                  <span className="text-xs font-bold" style={{ color: T.navy }}>{m.rendimiento?.[k] ?? "-"}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <KV label="Fortalezas" value={m.rendimiento?.fortalezas} />
            <KV label="Debilidades" value={m.rendimiento?.debilidades} />
          </div>
        </Section>

        <Section title="Aprendizajes">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <KV label="Mantener" value={m.aprendizajes?.mantener} />
            <KV label="Corregir" value={m.aprendizajes?.corregir} />
            <KV label="Trabajar" value={m.aprendizajes?.trabajar} />
          </div>
        </Section>

        <Section title="Observaciones del entrenador">
          <div className="text-sm whitespace-pre-wrap" style={{ color: T.text }}>{m.observaciones || "Sin observaciones."}</div>
        </Section>
      </div>

      <div className="flex justify-between gap-2 mt-5 sticky bottom-0 bg-white -mx-5 px-5 py-3 border-t" style={{ borderColor: T.line }}>
        <Btn variant="danger" icon={Trash2} onClick={onDelete}>Eliminar</Btn>
        <div className="flex gap-2">
          <Btn variant="ghost" onClick={onClose}>Cerrar</Btn>
          <Btn variant="accent" icon={Edit3} onClick={onEdit}>Editar partido</Btn>
        </div>
      </div>
    </Modal>
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

function PitchEditor({ system, players, lineup, onChange, readOnly = false }) {
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
    if (readOnly) return;
    dragIndex.current = i; movedRef.current = false;
    startRef.current = { x: e.clientX, y: e.clientY };
    e.target.setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (readOnly || dragIndex.current == null || !containerRef.current) return;
    const dx = Math.abs(e.clientX - startRef.current.x), dy = Math.abs(e.clientY - startRef.current.y);
    if (dx > 12 || dy > 12) movedRef.current = true;
    if (!movedRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    let x = ((e.clientX - rect.left) / rect.width) * 100;
    let y = ((e.clientY - rect.top) / rect.height) * 100;
    x = Math.max(4, Math.min(96, x)); y = Math.max(4, Math.min(96, y));
    setSlot(dragIndex.current, { x, y });
  };
  const onPointerUp = (i) => {
    if (readOnly) return;
    if (!movedRef.current) setActiveSlot(i === activeSlot ? null : i);
    dragIndex.current = null;
  };

  const assignedIds = slots.map((s) => s.jugadorId).filter(Boolean);

  return (
    <div>
      {!readOnly && <div className="text-xs mb-2" style={{ color: T.muted }}>Toca un jugador para asignarlo. Mantén pulsado y arrastra para moverlo sobre el campo.</div>}
      {!readOnly && activeSlot != null && (
        <div className="flex items-center gap-2 mb-2 p-2.5 rounded-lg flex-wrap" style={{ background: "#FEF3C7", border: `1.5px solid ${T.yellow}` }}>
          <span className="text-xs font-bold" style={{ color: T.navy }}>Posición {activeSlot + 1}:</span>
          <Select value={slots[activeSlot].jugadorId || ""} onChange={(e) => setSlot(activeSlot, { jugadorId: e.target.value || null })} className="w-auto text-xs py-1">
            <option value="">Sin asignar</option>
            {players.filter((p) => !assignedIds.includes(p.id) || p.id === slots[activeSlot].jugadorId).map((p) => <option key={p.id} value={p.id}>{p.apodo || p.nombre}</option>)}
          </Select>
          <button className="text-xs font-bold ml-auto" style={{ color: T.red }} onClick={() => setActiveSlot(null)}>Cerrar</button>
        </div>
      )}
      <div ref={containerRef} onPointerMove={onPointerMove}
        className="relative w-full rounded-xl overflow-hidden select-none touch-none"
        style={{ aspectRatio: "2/3", background: `linear-gradient(${T.green}, #22874C)`, border: `2px solid #1F7A44` }}>
        <div className="absolute inset-2 border-2 rounded-lg" style={{ borderColor: "rgba(255,255,255,0.5)" }} />
        <div className="absolute left-2 right-2 top-1/2 border-t-2" style={{ borderColor: "rgba(255,255,255,0.5)" }} />
        <div className="absolute left-1/2 top-1/2 w-16 h-16 -translate-x-1/2 -translate-y-1/2 border-2 rounded-full" style={{ borderColor: "rgba(255,255,255,0.5)" }} />
        <div className="absolute left-1/2 top-1/2 w-1.5 h-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ background: "rgba(255,255,255,0.6)" }} />
        {/* Área grande (penal) */}
        <div className="absolute left-1/2 top-2 w-40 h-16 -translate-x-1/2 border-2 border-t-0" style={{ borderColor: "rgba(255,255,255,0.5)" }} />
        <div className="absolute left-1/2 bottom-2 w-40 h-16 -translate-x-1/2 border-2 border-b-0" style={{ borderColor: "rgba(255,255,255,0.5)" }} />
        {/* Área chica (portería) */}
        <div className="absolute left-1/2 top-2 w-20 h-7 -translate-x-1/2 border-2 border-t-0" style={{ borderColor: "rgba(255,255,255,0.5)" }} />
        <div className="absolute left-1/2 bottom-2 w-20 h-7 -translate-x-1/2 border-2 border-b-0" style={{ borderColor: "rgba(255,255,255,0.5)" }} />
        {/* Punto penal */}
        <div className="absolute left-1/2 top-[15%] w-1.5 h-1.5 -translate-x-1/2 rounded-full" style={{ background: "rgba(255,255,255,0.6)" }} />
        <div className="absolute left-1/2 bottom-[15%] w-1.5 h-1.5 -translate-x-1/2 rounded-full" style={{ background: "rgba(255,255,255,0.6)" }} />
        {/* Arcos de esquina */}
        <div className="absolute left-2 top-2 w-4 h-4 border-2 rounded-br-full" style={{ borderColor: "rgba(255,255,255,0.5)", borderTop: "none", borderLeft: "none" }} />
        <div className="absolute right-2 top-2 w-4 h-4 border-2 rounded-bl-full" style={{ borderColor: "rgba(255,255,255,0.5)", borderTop: "none", borderRight: "none" }} />
        <div className="absolute left-2 bottom-2 w-4 h-4 border-2 rounded-tr-full" style={{ borderColor: "rgba(255,255,255,0.5)", borderBottom: "none", borderLeft: "none" }} />
        <div className="absolute right-2 bottom-2 w-4 h-4 border-2 rounded-tl-full" style={{ borderColor: "rgba(255,255,255,0.5)", borderBottom: "none", borderRight: "none" }} />
        {slots.map((s, i) => {
          const p = players.find((pl) => pl.id === s.jugadorId);
          return (
            <div key={i} onPointerDown={(e) => onPointerDown(i, e)} onPointerUp={() => onPointerUp(i)}
              className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center ${readOnly ? "" : "cursor-grab active:cursor-grabbing"}`}
              style={{ left: `${s.x}%`, top: `${s.y}%` }}>
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-base font-extrabold text-white shadow-md"
                style={{ background: p ? T.navy : "rgba(255,255,255,0.35)", border: activeSlot === i ? `2px solid ${T.yellow}` : "2px solid rgba(255,255,255,0.8)" }}>
                {p ? p.numero : "+"}
              </div>
              {p && <div className="text-[12px] font-bold text-white mt-1 whitespace-nowrap" style={{ textShadow: "0 1px 2px rgba(0,0,0,0.6)" }}>{p.apodo || p.nombre.split(" ")[0]}</div>}
            </div>
          );
        })}
      </div>
      {!readOnly && (
        <div className="mt-3">
          <Eyebrow>Banquillo (convocados sin asignar)</Eyebrow>
          <div className="flex flex-wrap gap-2 mt-2">
            {players.filter((p) => !assignedIds.includes(p.id)).map((p) => (
              <div key={p.id} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg" style={{ background: "#F5F7FA", border: `1px solid ${T.line}` }}>
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold text-white" style={{ background: T.muted }}>{p.numero}</span>
                <span className="text-xs font-bold" style={{ color: T.navy }}>{p.apodo || p.nombre}</span>
              </div>
            ))}
            {players.filter((p) => !assignedIds.includes(p.id)).length === 0 && <div className="text-xs" style={{ color: T.muted }}>Todos los convocados están en el campo.</div>}
          </div>
        </div>
      )}
    </div>
  );
}

function MatchForm({ ctx, initial, onClose, onSave, onDelete }) {
  const { config, players } = ctx;
  const blank = {
    id: uid(), fecha: todayISO(), competicion: "Liga", jornada: "", rival: "", esLocal: true, campo: "",
    resultadoDescanso: "", resultadoFinal: "0-0", tipoFutbol: config.footballType,
    sistema: config.tacticalSystems[config.footballType]?.[0] || "",
    convocatoria: players.map((p) => ({ jugadorId: p.id, estado: "No convocado" })),
    capitanId: null,
    vestimenta: { camiseta: "", pantaloneta: "", medias: "" },
    alineacion: [],
    cambios: [], goles: [], tarjetas: [],
    tactica: { modelo: "", funciono: "", noFunciono: "", ajustes: "" },
    rendimiento: { ataque: 5, defensa: 5, transicionOfensiva: 5, transicionDefensiva: 5, balonParadoOfensivo: 5, balonParadoDefensivo: 5, fortalezas: "", debilidades: "" },
    valoracionesJugadores: {},
    aprendizajes: { mantener: "", corregir: "", trabajar: "" },
    observaciones: "",
  };
  const [f, setF] = useState(initial ? {
    ...blank, ...initial,
    convocatoria: players.map((p) => initial.convocatoria?.find((c) => c.jugadorId === p.id) || { jugadorId: p.id, estado: "No convocado" }),
    vestimenta: { ...blank.vestimenta, ...(initial.vestimenta || {}) },
    valoracionesJugadores: { ...blank.valoracionesJugadores, ...(initial.valoracionesJugadores || {}) },
  } : blank);
  const [tab, setTab] = useState("datos");
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const setNested = (k, kk, v) => setF((p) => ({ ...p, [k]: { ...p[k], [kk]: v } }));
  const systemsForType = config.tacticalSystems[f.tipoFutbol] || [];
  const [sistemaManual, setSistemaManual] = useState(initial ? !systemsForType.includes(initial.sistema) && !!initial.sistema : false);

  const submit = () => onSave(f);

  const addRow = (key, row) => setF((p) => ({ ...p, [key]: [...p[key], { id: uid(), ...row }] }));
  const removeRow = (key, id) => setF((p) => ({ ...p, [key]: p[key].filter((r) => r.id !== id) }));
  const updateRow = (key, id, kk, v) => setF((p) => ({ ...p, [key]: p[key].map((r) => r.id === id ? { ...r, [kk]: v } : r) }));

  const tabs = [["datos", "Datos"], ["convocatoria", "Convocatoria"], ["vestimenta", "Vestimenta"], ["alineacion", "Alineación"], ["eventos", "Cambios/Goles/Tarjetas"], ["tactica", "Táctica"], ["rendimiento", "Rendimiento"], ["aprendizajes", "Aprendizajes"], ["obs", "Observaciones"]];

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
          <Field label="Competición">
            <Select value={f.competicion} onChange={(e) => set("competicion", e.target.value)}>
              <option>Liga</option><option>Amistoso</option><option>Torneo</option>
            </Select>
          </Field>
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
            <Select value={sistemaManual ? "__otro__" : f.sistema} onChange={(e) => {
              if (e.target.value === "__otro__") { setSistemaManual(true); set("sistema", ""); }
              else { setSistemaManual(false); set("sistema", e.target.value); }
            }}>
              {systemsForType.map((s) => <option key={s}>{s}</option>)}
              <option value="__otro__">Otro (ingresar manualmente)</option>
            </Select>
            {sistemaManual && (
              <TextInput className="mt-2" placeholder="Ej: 1-4-3-3" value={f.sistema} onChange={(e) => set("sistema", e.target.value)} />
            )}
          </Field>
          <Field label="Resultado al descanso"><TextInput value={f.resultadoDescanso} onChange={(e) => set("resultadoDescanso", e.target.value)} placeholder="0-0" /></Field>
          <Field label="Resultado final"><TextInput value={f.resultadoFinal} onChange={(e) => set("resultadoFinal", e.target.value)} placeholder="0-0" /></Field>
        </div>
      )}

      {tab === "convocatoria" && (
        <div className="flex flex-col gap-1.5">
          <div className="text-xs mb-1" style={{ color: T.muted }}>{f.convocatoria.filter((c) => c.estado === "Convocado").length} jugadores convocados. Toca la ⭐ para marcar al capitán.</div>
          {players.map((p) => {
            const row = f.convocatoria.find((c) => c.jugadorId === p.id);
            const isCap = f.capitanId === p.id;
            return (
              <div key={p.id} className="flex items-center gap-2 p-2 rounded-lg flex-wrap" style={{ background: "#F7F8FA" }}>
                <button onClick={() => set("capitanId", isCap ? null : p.id)} title="Marcar como capitán" className="shrink-0 text-base leading-none">
                  {isCap ? "⭐" : "☆"}
                </button>
                <div className="w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-extrabold text-white shrink-0" style={{ background: T.navy }}>{p.numero}</div>
                <div className="text-sm font-bold flex-1 truncate min-w-[80px]" style={{ color: T.navy }}>{p.apodo || p.nombre}{isCap ? " (C)" : ""}</div>
                <Select value={row.estado} onChange={(e) => setF((prev) => ({ ...prev, convocatoria: prev.convocatoria.map((c) => c.jugadorId === p.id ? { ...c, estado: e.target.value } : c) }))} className="w-auto text-xs py-1">
                  <option>No convocado</option><option>Convocado</option><option>Lesionado</option><option>Sancionado</option>
                </Select>
              </div>
            );
          })}
        </div>
      )}

      {tab === "vestimenta" && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Field label="Camiseta"><TextInput value={f.vestimenta.camiseta} onChange={(e) => setNested("vestimenta", "camiseta", e.target.value)} placeholder="Ej: Rojo" /></Field>
          <Field label="Pantaloneta"><TextInput value={f.vestimenta.pantaloneta} onChange={(e) => setNested("vestimenta", "pantaloneta", e.target.value)} placeholder="Ej: Blanco" /></Field>
          <Field label="Medias"><TextInput value={f.vestimenta.medias} onChange={(e) => setNested("vestimenta", "medias", e.target.value)} placeholder="Ej: Rojo" /></Field>
        </div>
      )}

      {tab === "alineacion" && (
        <div>
          <div className="mb-3 text-sm" style={{ color: T.muted }}>Sistema: <strong style={{ color: T.navy }}>{f.sistema}</strong> ({f.tipoFutbol}). Cambia el sistema en la pestaña Datos para recalcular las posiciones.</div>
          {f.convocatoria.filter((c) => c.estado === "Convocado").length === 0 ? (
            <div className="text-sm p-3 rounded-lg" style={{ color: T.muted, background: "#F7F8FA" }}>Primero marcá jugadores como "Convocado" en la pestaña Convocatoria para poder ubicarlos en la cancha.</div>
          ) : (
            <PitchEditor system={f.sistema} players={players.filter((p) => f.convocatoria.find((c) => c.jugadorId === p.id)?.estado === "Convocado")} lineup={f.alineacion} onChange={(l) => set("alineacion", l)} />
          )}
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

          <div className="pt-3 border-t" style={{ borderColor: T.line }}>
            <Eyebrow>Rendimiento individual (1-10)</Eyebrow>
            <div className="text-xs mb-2" style={{ color: T.muted }}>Se suma a las estadísticas de cada jugador.</div>
            <div className="flex flex-col gap-1.5">
              {players.filter((p) => f.convocatoria.find((c) => c.jugadorId === p.id)?.estado === "Convocado").map((p) => (
                <div key={p.id} className="flex items-center gap-2 p-2 rounded-lg" style={{ background: "#F7F8FA" }}>
                  <div className="text-sm font-bold flex-1 truncate" style={{ color: T.navy }}>{p.apodo || p.nombre}</div>
                  <input type="range" min="1" max="10" value={f.valoracionesJugadores[p.id] ?? 5}
                    onChange={(e) => setF((prev) => ({ ...prev, valoracionesJugadores: { ...prev.valoracionesJugadores, [p.id]: Number(e.target.value) } }))}
                    className="w-28" />
                  <span className="text-xs font-extrabold w-5 text-right" style={{ color: T.navy }}>{f.valoracionesJugadores[p.id] ?? 5}</span>
                </div>
              ))}
              {!players.some((p) => f.convocatoria.find((c) => c.jugadorId === p.id)?.estado === "Convocado") && (
                <div className="text-xs" style={{ color: T.muted }}>No hay jugadores convocados todavía.</div>
              )}
            </div>
          </div>
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

function printTraining(t, config, players) {
  const esc = (s) => (s || "").toString().replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c]));
  const playerName = (id) => { const p = players.find((x) => x.id === id); return p ? (p.apodo || p.nombre) : "?"; };

  const teamSummary = (task) => {
    if (!task.equipos?.length) return "";
    const asign = task.asignaciones || {};
    return task.equipos.map((eq) => `${esc(eq.name)}: ${Object.values(asign).filter((v) => v === eq.id).length}`).join(" · ");
  };

  const taskRow = (task) => `
    <div class="taskRow">
      <div class="taskRowMain">
        <div class="taskRowTitle">${esc(task.nombre) || "(sin nombre)"}${task.tiempo ? ` <span class="taskRowTime">· ${esc(task.tiempo)} min</span>` : ""}</div>
        ${task.objetivo ? `<div class="taskRowLine"><b>Obj:</b> ${esc(task.objetivo)}</div>` : ""}
        ${task.materiales ? `<div class="taskRowLine"><b>Materiales:</b> ${esc(task.materiales)}</div>` : ""}
        ${task.descripcion ? `<div class="taskRowLine">${esc(task.descripcion)}</div>` : ""}
        ${teamSummary(task) ? `<div class="taskRowLine taskTeams">🎽 ${teamSummary(task)}</div>` : ""}
      </div>
      ${task.imagen ? `<img class="taskRowImg" src="${task.imagen}" />` : ""}
    </div>`;

  const section = (title, color, timeLabel, tasksArr) => {
    if (!tasksArr?.length) return "";
    return `<div class="section">
      <div class="sectionTitle" style="background:${color};">${esc(title)}${timeLabel ? ` <span class="sectionTime">(${esc(timeLabel)} min)</span>` : ""}</div>
      ${tasksArr.map(taskRow).join("")}
    </div>`;
  };

  const objBlock = (label, value) => value ? `<div class="objChip"><b>${esc(label)}:</b> ${esc(value)}</div>` : "";

  const asistCount = { asiste: 0, noAsiste: 0, lesionado: 0 };
  (t.asistencia || []).forEach((a) => {
    if (a.estado === "Asiste") asistCount.asiste++;
    else if (a.estado === "Lesionado") asistCount.lesionado++;
    else asistCount.noAsiste++;
  });

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Sesión de entrenamiento</title>
  <style>
    @page { size: A4; margin: 10mm; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    html, body { background: #E9EDF3; margin: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; color-adjust: exact; }
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
    body { font-family: -apple-system, Segoe UI, Roboto, Arial, sans-serif; color: #1B2733; padding: 14px; font-size: 11px; }
    .toolbar { position: sticky; top: 0; display: flex; justify-content: center; gap: 10px; padding: 8px 0 14px; z-index: 50; }
    .toolbar button { font-family: inherit; font-size: 13px; font-weight: 800; border: none; border-radius: 12px; padding: 10px 20px; cursor: pointer; box-shadow: 0 4px 14px rgba(0,0,0,0.18); }
    .btnPrint { background: #E63946; color: #fff; }
    .btnClose { background: #fff; color: #0B1F3A; border: 1.5px solid #CBD5E1 !important; }
    .sheet { max-width: 210mm; margin: 0 auto; background: #fff; border-radius: 14px; padding: 16px 20px 18px; box-shadow: 0 6px 24px rgba(11,31,58,0.15); }
    .header { display: flex; align-items: center; gap: 10px; border-bottom: 3px solid #0B1F3A; padding-bottom: 8px; margin-bottom: 10px; }
    .header img { width: 40px; height: 40px; object-fit: contain; border-radius: 10px; }
    .headerInfo { flex: 1; }
    .teamName { font-size: 14px; font-weight: 800; color: #0B1F3A; }
    .teamMeta { font-size: 9.5px; color: #64748B; margin-top: 1px; }
    .headerRight { text-align: right; }
    .headerRight .big { font-size: 15px; font-weight: 900; color: #E63946; text-transform: uppercase; }
    .headerRight .small { font-size: 9.5px; color: #64748B; }
    .infoBar { display: flex; flex-wrap: wrap; gap: 6px 16px; background: #F5F7FA; border-radius: 10px; padding: 6px 12px; margin-bottom: 10px; font-size: 10px; }
    .infoBar span b { color: #0B1F3A; }
    .objRow { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 10px; }
    .objChip { background: #FAFBFC; border: 1px solid #E2E8F0; border-radius: 999px; padding: 3px 10px; font-size: 9.5px; }
    .asistRow { display: flex; gap: 12px; margin-bottom: 10px; font-size: 10px; }
    .asistRow span { font-weight: 700; }
    .section { margin-bottom: 8px; }
    .sectionTitle { font-size: 10px; font-weight: 800; text-transform: uppercase; color: #fff; padding: 3px 10px; border-radius: 999px; display: inline-block; margin-bottom: 4px; letter-spacing: 0.3px; }
    .sectionTime { font-weight: 600; opacity: 0.85; }
    .taskRow { display: flex; gap: 8px; align-items: flex-start; background: #FAFBFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 5px 8px; margin-bottom: 4px; }
    .taskRowMain { flex: 1; min-width: 0; }
    .taskRowTitle { font-size: 10.5px; font-weight: 800; color: #0B1F3A; }
    .taskRowTime { font-weight: 600; color: #64748B; }
    .taskRowLine { font-size: 9.5px; color: #334155; line-height: 1.3; }
    .taskTeams { color: #E63946; font-weight: 700; }
    .taskRowImg { width: 130px; height: 130px; object-fit: cover; border-radius: 8px; border: 1px solid #E2E8F0; flex-shrink: 0; }
    .notes { background: #FAFBFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 6px 10px; font-size: 9.5px; margin-top: 6px; }
    .footer { margin-top: 10px; text-align: center; font-size: 8.5px; color: #94A3B8; border-top: 1px solid #E2E8F0; padding-top: 6px; }
    @media print {
      html, body { background: #fff; }
      .toolbar { display: none !important; }
      .sheet { box-shadow: none; border-radius: 0; padding: 0; max-width: 100%; }
      body { padding: 0; }
    }
  </style></head>
  <body>
    <div class="toolbar">
      <button class="btnPrint" onclick="window.print()">🖨️ Imprimir / Guardar PDF</button>
      <button class="btnClose" onclick="window.close()">Cerrar vista previa</button>
    </div>
    <div class="sheet">
      <div class="header">
        ${config.logo ? `<img src="${config.logo}" />` : ""}
        <div class="headerInfo">
          <div class="teamName">${esc(config.teamName || "Equipo")}</div>
          <div class="teamMeta">${esc(config.category || "")}${config.category && config.season ? " · " : ""}${esc(config.season || "")}</div>
        </div>
        <div class="headerRight">
          <div class="big">Sesión de entrenamiento${t.numeroSesion ? ` Nº ${esc(t.numeroSesion)}` : ""}</div>
          <div class="small">${esc(t.fecha)} · ${esc(t.hora)}</div>
        </div>
      </div>

      <div class="infoBar">
        <span><b>Lugar:</b> ${esc(t.lugar) || "—"}</span>
        <span><b>Duración:</b> ${esc(t.duracion)} min</span>
        <span><b>Jugadores disponibles:</b> ${esc(t.numJugadores)}</span>
      </div>

      ${t.objetivoGeneral ? `<div class="objRow"><div class="objChip" style="background:#0B1F3A; color:#fff; border:none;"><b>Objetivo general:</b> ${esc(t.objetivoGeneral)}</div></div>` : ""}
      <div class="objRow">
        ${objBlock("Físico", t.objetivos?.fisicos)}
        ${objBlock("Técnico", t.objetivos?.tecnicos)}
        ${objBlock("Táctico", t.objetivos?.tacticos)}
        ${objBlock("Estratégico", t.objetivos?.estrategicos)}
        ${objBlock("Psicológico", t.objetivos?.psicologicos)}
      </div>

      <div class="asistRow">
        <span style="color:#2A9D5C;">✓ Asiste: ${asistCount.asiste}</span>
        <span style="color:#E63946;">✗ No asiste: ${asistCount.noAsiste}</span>
        <span style="color:#F4B400;">✚ Lesionado: ${asistCount.lesionado}</span>
      </div>

      ${section("Calentamiento", "#F4B400", t.calentamiento?.tiempo, t.calentamiento?.tareas)}
      ${section("Parte principal", "#0B1F3A", null, t.tareas)}
      ${section("Partido condicionado y juego real", "#E63946", t.aplicacionJuego?.tiempo, t.aplicacionJuego?.tareas)}
      ${section("Vuelta a la calma", "#2A9D5C", t.vueltaCalma?.tiempo, t.vueltaCalma?.tareas)}
      ${section("Balón parado", "#94A3B8", null, t.vueltaCalma?.balonParado)}

      ${t.notas ? `<div class="notes"><b>Notas del entrenador:</b> ${esc(t.notas)}</div>` : ""}
      <div class="footer">Generado con PZ · Puntualización Zonal</div>
    </div>
  </body></html>`;
  const w = window.open("", "_blank");
  if (w) { w.document.open(); w.document.write(html); w.document.close(); }
}

function Entrenamientos({ ctx }) {
  const { trainings, updateTrainings, players, config } = ctx;
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
          <Card key={t.id} className="p-4 cursor-pointer hover:shadow-md transition relative" onClick={() => setOpenId(t.id)}>
            <div className="absolute top-3 right-3 flex gap-1 z-10">
              <button onClick={(e) => { e.stopPropagation(); printTraining(t, config, players); }} className="p-1.5 rounded-lg hover:bg-slate-100" title="Imprimir / PDF">
                <Printer size={14} style={{ color: T.muted }} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); setOpenId(t.id); }} className="p-1.5 rounded-lg hover:bg-slate-100" title="Editar">
                <Edit3 size={14} style={{ color: T.muted }} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); if (confirm("¿Eliminar esta sesión?")) updateTrainings((prev) => prev.filter((x) => x.id !== t.id)); }} className="p-1.5 rounded-lg hover:bg-red-50" title="Eliminar">
                <Trash2 size={14} style={{ color: T.redLight }} />
              </button>
            </div>
            <div className="flex items-center justify-between flex-wrap gap-2 pr-24">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-10 rounded-full" style={{ background: T.green }} />
                <div>
                  <div className="font-extrabold" style={{ color: T.navy }}>{t.numeroSesion ? `Sesión ${t.numeroSesion} · ` : ""}{t.objetivoGeneral || "Sesión de entrenamiento"}</div>
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

function blankLibTask() {
  return { id: uid(), libraryTaskId: null, nombre: "", codigo: "", objetivo: "", fundamento: "", materiales: "", tiempo: 15, jugadores: "", espacio: "", reglas: "", organizacion: "", descripcion: "", notas: "", imagen: "" };
}
function libTaskFromLibrary(t) {
  return { id: uid(), libraryTaskId: t.id, nombre: t.nombre, codigo: t.codigo, objetivo: t.objTactico || t.objTecnico, fundamento: t.objTecnico, materiales: t.materiales, tiempo: t.duracion, jugadores: t.minJugadores, espacio: t.espacio, reglas: t.reglas, organizacion: "", descripcion: t.descripcion, notas: "", imagen: t.imagen || "" };
}
function computeTaskUsageCounts(trainings) {
  const counts = {};
  (trainings || []).forEach((tr) => {
    const arrays = [tr.calentamiento?.tareas, tr.tareas, tr.aplicacionJuego?.tareas, tr.vueltaCalma?.tareas, tr.vueltaCalma?.balonParado];
    arrays.forEach((arr) => (arr || []).forEach((item) => {
      if (item.libraryTaskId) counts[item.libraryTaskId] = (counts[item.libraryTaskId] || 0) + 1;
    }));
  });
  return counts;
}

const TEAM_PRESETS = [
  { id: "eq0", name: "Peto rojo", color: "#E63946" },
  { id: "eq1", name: "Peto azul", color: "#1E3A8A" },
  { id: "eq2", name: "Sin peto", color: "#94A3B8" },
  { id: "eq3", name: "Peto verde", color: "#2A9D5C" },
];

/* Panel de asignación de equipos/petos, independiente por cada tarea */
function TeamAssignPanel({ task, attendingPlayers, onUpdate }) {
  const equipos = task.equipos || [];
  const asign = task.asignaciones || {};
  const setTeamCount = (n) => {
    const teams = TEAM_PRESETS.slice(0, n);
    onUpdate("equipos", teams);
    const validIds = teams.map((t) => t.id);
    const cleaned = {};
    Object.entries(asign).forEach(([pid, eid]) => { if (validIds.includes(eid)) cleaned[pid] = eid; });
    onUpdate("asignaciones", cleaned);
  };
  const assign = (playerId, teamId) => onUpdate("asignaciones", { ...asign, [playerId]: asign[playerId] === teamId ? undefined : teamId });
  const autoDistribute = () => {
    if (!equipos.length) return;
    const shuffled = [...attendingPlayers].sort(() => Math.random() - 0.5);
    const newAsign = {};
    shuffled.forEach((p, i) => { newAsign[p.id] = equipos[i % equipos.length].id; });
    onUpdate("asignaciones", newAsign);
  };
  return (
    <div className="mt-2 p-2.5 rounded-lg" style={{ background: "#fff", border: `1px solid ${T.line}` }}>
      <div className="flex items-center gap-1.5 flex-wrap mb-2">
        <span className="text-[10px] font-bold" style={{ color: T.muted }}>Nº de equipos:</span>
        {[2, 3, 4].map((n) => (
          <button key={n} onClick={() => setTeamCount(n)} className="px-2 py-0.5 rounded-full text-[10px] font-bold border"
            style={{ background: equipos.length === n ? T.navy : "#fff", color: equipos.length === n ? "#fff" : T.muted, borderColor: equipos.length === n ? T.navy : T.line }}>
            {n}
          </button>
        ))}
        {equipos.length > 0 && (
          <button onClick={autoDistribute} className="px-2 py-0.5 rounded-full text-[10px] font-bold border" style={{ borderColor: T.line, color: T.muted }}>
            🔀 Repartir automático
          </button>
        )}
      </div>
      {equipos.length > 0 && attendingPlayers.length > 0 && (
        <div className="flex flex-col gap-1">
          {attendingPlayers.map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-2">
              <span className="text-[11px] truncate flex-1" style={{ color: T.text }}>{p.apodo || p.nombre}</span>
              <div className="flex gap-1">
                {equipos.map((eq) => (
                  <button key={eq.id} onClick={() => assign(p.id, eq.id)} title={eq.name}
                    className="w-5 h-5 rounded-full border-2"
                    style={{ background: asign[p.id] === eq.id ? eq.color : "#fff", borderColor: eq.color }} />
                ))}
              </div>
            </div>
          ))}
          <div className="flex gap-2.5 flex-wrap mt-1.5 pt-1.5 border-t" style={{ borderColor: T.line }}>
            {equipos.map((eq) => (
              <span key={eq.id} className="text-[9.5px] flex items-center gap-1" style={{ color: T.muted }}>
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: eq.color }} />
                {eq.name}: {Object.values(asign).filter((v) => v === eq.id).length}
              </span>
            ))}
          </div>
        </div>
      )}
      {!equipos.length && <div className="text-[10px]" style={{ color: T.muted }}>Elegí el número de equipos para repartir petos en esta tarea.</div>}
      {equipos.length > 0 && attendingPlayers.length === 0 && (
        <div className="text-[10px]" style={{ color: T.redLight }}>No hay jugadores marcados como "Asiste" todavía (pestaña Asistencia).</div>
      )}
    </div>
  );
}

function TaskPickerModal({ library, usageCounts, onSelect, onClose }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("Todas");
  const [tipo, setTipo] = useState("Todos");
  const categorias = useMemo(() => ["Todas", ...Array.from(new Set(library.map((t) => t.categoria).filter(Boolean)))], [library]);
  const tipos = useMemo(() => ["Todos", ...Array.from(new Set(library.map((t) => t.tipoTarea).filter(Boolean)))], [library]);

  const results = useMemo(() => {
    let list = library;
    if (cat !== "Todas") list = list.filter((t) => t.categoria === cat);
    if (tipo !== "Todos") list = list.filter((t) => t.tipoTarea === tipo);
    const query = q.trim().toLowerCase();
    if (query) {
      list = list.filter((t) => (t.nombre || "").toLowerCase().includes(query) || (t.codigo || "").toLowerCase().includes(query));
    }
    // Sin búsqueda: ordenar por más utilizadas primero
    return [...list].sort((a, b) => {
      const ua = usageCounts[a.id] || 0, ub = usageCounts[b.id] || 0;
      if (ub !== ua) return ub - ua;
      return (a.nombre || "").localeCompare(b.nombre || "");
    });
  }, [library, cat, tipo, q, usageCounts]);

  return (
    <Modal title="Añadir desde biblioteca de tareas" onClose={onClose}>
      <div className="flex flex-col gap-3">
        <TextInput autoFocus placeholder="Buscar por nombre o código..." value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="flex gap-2 overflow-x-auto pb-1">
          <Select value={cat} onChange={(e) => setCat(e.target.value)} className="text-xs w-auto shrink-0">
            {categorias.map((c) => <option key={c} value={c}>{c === "Todas" ? "Todas las categorías" : c}</option>)}
          </Select>
          <Select value={tipo} onChange={(e) => setTipo(e.target.value)} className="text-xs w-auto shrink-0">
            {tipos.map((t) => <option key={t} value={t}>{t === "Todos" ? "Todos los tipos" : t}</option>)}
          </Select>
        </div>
        {!q.trim() && <div className="text-[11px] font-bold uppercase" style={{ color: T.muted }}>⭐ Más utilizadas</div>}
        <div className="flex flex-col gap-1.5 max-h-[50vh] overflow-y-auto">
          {results.map((t) => (
            <button key={t.id} onClick={() => onSelect(t.id)}
              className="flex items-center gap-2.5 p-2.5 rounded-xl text-left hover:bg-slate-50 border" style={{ borderColor: T.line }}>
              {t.imagen && <img src={t.imagen} className="w-10 h-10 rounded-lg object-cover shrink-0" />}
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold truncate" style={{ color: T.navy }}>{t.nombre}</div>
                <div className="text-[10px]" style={{ color: T.muted }}>{t.codigo} · {t.categoria}{t.tipoTarea ? ` · ${t.tipoTarea}` : ""}</div>
              </div>
              {usageCounts[t.id] > 0 && <Pill>{usageCounts[t.id]}x usada</Pill>}
            </button>
          ))}
          {!results.length && <div className="text-xs text-center py-4" style={{ color: T.muted }}>No se encontraron tareas con esos filtros.</div>}
        </div>
      </div>
    </Modal>
  );
}

/* Pequeño listado reutilizable de tareas: "+ añadir desde biblioteca" + "tarea en blanco" + tarjetas editables */
function TaskMiniList({ items, library, attendingPlayers, usageCounts, onAddFromLibrary, onAddBlank, onUpdate, onRemove }) {
  const [expanded, setExpanded] = useState({});
  const [showPicker, setShowPicker] = useState(false);
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 flex-wrap">
        <Btn variant="ghost" icon={Search} onClick={() => setShowPicker(true)}>+ Añadir desde biblioteca de tareas</Btn>
        <Btn variant="ghost" icon={Plus} onClick={onAddBlank}>Tarea en blanco</Btn>
      </div>
      {showPicker && (
        <TaskPickerModal
          library={library}
          usageCounts={usageCounts || {}}
          onClose={() => setShowPicker(false)}
          onSelect={(id) => { onAddFromLibrary(id); setShowPicker(false); }}
        />
      )}
      {items.map((t) => (
        <Card key={t.id} className="p-3" style={{ background: "#F7F8FA" }}>
          <div className="flex justify-end"><button onClick={() => onRemove(t.id)}><Trash2 size={14} style={{ color: T.redLight }} /></button></div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <TextInput placeholder="Nombre" value={t.nombre} onChange={(e) => onUpdate(t.id, "nombre", e.target.value)} className="text-xs" />
            <TextInput placeholder="Código" value={t.codigo} onChange={(e) => onUpdate(t.id, "codigo", e.target.value)} className="text-xs" />
            <TextInput placeholder="Objetivo" value={t.objetivo} onChange={(e) => onUpdate(t.id, "objetivo", e.target.value)} className="text-xs" />
            <TextInput placeholder="Materiales" value={t.materiales} onChange={(e) => onUpdate(t.id, "materiales", e.target.value)} className="text-xs" />
            <TextInput placeholder="Tiempo (min)" type="number" value={t.tiempo} onChange={(e) => onUpdate(t.id, "tiempo", e.target.value)} className="text-xs" />
            <TextInput placeholder="Nº jugadores" value={t.jugadores} onChange={(e) => onUpdate(t.id, "jugadores", e.target.value)} className="text-xs" />
          </div>
          <TextArea placeholder="Descripción / notas" value={t.descripcion} onChange={(e) => onUpdate(t.id, "descripcion", e.target.value)} className="text-xs mt-2" />
          {attendingPlayers && (
            <div className="mt-2">
              <button onClick={() => setExpanded((p) => ({ ...p, [t.id]: !p[t.id] }))}
                className="text-[11px] font-bold flex items-center gap-1" style={{ color: T.navy }}>
                🎽 Equipos / petos {t.equipos?.length ? `(${t.equipos.length})` : ""} {expanded[t.id] ? "▲" : "▼"}
              </button>
              {expanded[t.id] && (
                <TeamAssignPanel task={t} attendingPlayers={attendingPlayers} onUpdate={(k, v) => onUpdate(t.id, k, v)} />
              )}
            </div>
          )}
        </Card>
      ))}
      {!items.length && <div className="text-xs" style={{ color: T.muted }}>Todavía no hay tareas añadidas.</div>}
    </div>
  );
}

const STOPWORDS = new Set(["de", "la", "el", "en", "y", "a", "los", "las", "del", "un", "una", "con", "para", "por", "que", "se"]);
function keywordScore(text, target) {
  const words = (text || "").toLowerCase().split(/[^a-záéíóúñ0-9]+/).filter((w) => w.length > 2 && !STOPWORDS.has(w));
  const targetLower = (target || "").toLowerCase();
  return words.reduce((acc, w) => acc + (targetLower.includes(w) ? 1 : 0), 0);
}
function recommendTasksForObjectives(objetivos, tasks) {
  const map = [["fisicos", "objFisico"], ["tecnicos", "objTecnico"], ["tacticos", "objTactico"], ["psicologicos", "objPsicologico"]];
  const active = map.filter(([k]) => (objetivos[k] || "").trim().length > 0);
  if (!active.length) return [];
  const scored = [];
  const seen = new Set();
  for (const t of tasks) {
    let score = 0;
    let matches = 0;
    for (const [ok, field] of active) {
      if ((t[field] || "").trim()) {
        matches++;
        score += 1 + keywordScore(objetivos[ok], t[field]) + keywordScore(objetivos[ok], t.descripcion);
      }
    }
    if (matches > 0 && !seen.has(t.id)) { scored.push({ t, score }); seen.add(t.id); }
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 5).map((s) => s.t);
}

function ObjectiveRecommendations({ objetivos, library, onAdd, label }) {
  const recommended = useMemo(() => recommendTasksForObjectives(objetivos, library), [objetivos, library]);
  if (!recommended.length) return null;
  return (
    <Card className="p-3" style={{ background: "#FCEAEC", borderColor: "#F6C6CB" }}>
      <div className="flex items-center gap-2 mb-2">
        <Zap size={16} style={{ color: T.red }} />
        <div className="text-xs font-extrabold" style={{ color: T.red }}>{label || "Sugerencias de la biblioteca de tareas, según tus objetivos"}</div>
      </div>
      <div className="flex flex-col gap-2">
        {recommended.map((t) => (
          <div key={t.id} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white">
            <div className="min-w-0">
              <div className="text-xs font-bold truncate" style={{ color: T.navy }}>{t.nombre}</div>
              <div className="text-[10px]" style={{ color: T.muted }}>{t.codigo} · {t.categoria}</div>
            </div>
            <Btn variant="ghost" icon={Plus} onClick={() => onAdd(t.id)}>Añadir</Btn>
          </div>
        ))}
      </div>
    </Card>
  );
}

function TrainingForm({ ctx, initial, onClose, onSave, onDelete }) {
  const { players, tasks, config } = ctx;
  const blank = {
    id: uid(), numeroSesion: "", fecha: todayISO(), hora: "19:00", lugar: "", duracion: 90, numJugadores: players.length,
    objetivoGeneral: "",
    objetivos: { fisicos: "", tecnicos: "", tacticos: "", estrategicos: "", psicologicos: "" },
    calentamiento: { tareas: [], actividad: "", objetivo: "", materiales: "", tiempo: 15, notas: "" },
    tareas: [],
    aplicacionJuego: { tareas: [], tipo: "Partido condicionado", objetivo: "", tiempo: 20, observaciones: "" },
    vueltaCalma: { tareas: [], estiramientos: "", actividad: "", tiempo: 10, observaciones: "", balonParado: [] },
    notas: "",
    asistencia: players.map((p) => ({ jugadorId: p.id, estado: "Asiste" })),
  };
  const [f, setF] = useState(initial ? {
    ...blank, ...initial,
    objetivos: { ...blank.objetivos, ...(initial.objetivos || {}) },
    calentamiento: { ...blank.calentamiento, ...(initial.calentamiento || {}), tareas: initial.calentamiento?.tareas || [] },
    aplicacionJuego: { ...blank.aplicacionJuego, ...(initial.aplicacionJuego || {}), tareas: initial.aplicacionJuego?.tareas || [] },
    vueltaCalma: { ...blank.vueltaCalma, ...(initial.vueltaCalma || {}), tareas: initial.vueltaCalma?.tareas || [], balonParado: initial.vueltaCalma?.balonParado || [] },
    asistencia: players.map((p) => {
      const found = initial.asistencia?.find((a) => a.jugadorId === p.id);
      let estado = found?.estado || "Asiste";
      if (estado === "Presente") estado = "Asiste";
      if (estado === "Ausente justificado" || estado === "Ausente no justificado") estado = "No asiste";
      return { jugadorId: p.id, estado };
    }),
  } : blank);
  const [tab, setTab] = useState("info");
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const setNested = (k, kk, v) => setF((p) => ({ ...p, [k]: { ...p[k], [kk]: v } }));

  // El número de jugadores disponibles se calcula automáticamente según la asistencia
  useEffect(() => {
    const count = f.asistencia.filter((a) => a.estado === "Asiste").length;
    setF((p) => (p.numJugadores === count ? p : { ...p, numJugadores: count }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [f.asistencia]);

  const addTaskFromLibrary = (taskId) => {
    const t = tasks.find((x) => x.id === taskId);
    if (!t) return;
    setF((p) => ({ ...p, tareas: [...p.tareas, libTaskFromLibrary(t)] }));
  };
  const addBlankTask = () => setF((p) => ({ ...p, tareas: [...p.tareas, blankLibTask()] }));
  const updateTask = (id, k, v) => setF((p) => ({ ...p, tareas: p.tareas.map((t) => t.id === id ? { ...t, [k]: v } : t) }));
  const removeTask = (id) => setF((p) => ({ ...p, tareas: p.tareas.filter((t) => t.id !== id) }));

  // Helpers genéricos para los bloques anidados (calentamiento, juego, vuelta a la calma, balón parado)
  const blockAddFromLibrary = (blockKey, subKey, taskId) => {
    const t = tasks.find((x) => x.id === taskId);
    if (!t) return;
    setF((p) => ({ ...p, [blockKey]: { ...p[blockKey], [subKey]: [...(p[blockKey][subKey] || []), libTaskFromLibrary(t)] } }));
  };
  const blockAddBlank = (blockKey, subKey) => setF((p) => ({ ...p, [blockKey]: { ...p[blockKey], [subKey]: [...(p[blockKey][subKey] || []), blankLibTask()] } }));
  const blockUpdate = (blockKey, subKey, id, k, v) => setF((p) => ({ ...p, [blockKey]: { ...p[blockKey], [subKey]: p[blockKey][subKey].map((t) => t.id === id ? { ...t, [k]: v } : t) } }));
  const blockRemove = (blockKey, subKey, id) => setF((p) => ({ ...p, [blockKey]: { ...p[blockKey], [subKey]: p[blockKey][subKey].filter((t) => t.id !== id) } }));

  const libByCategoria = (categoria) => {
    const filtered = tasks.filter((t) => t.categoria === categoria);
    return filtered.length ? filtered : tasks;
  };
  const libByTipoTarea = (...tipos) => {
    const filtered = tasks.filter((t) => tipos.includes(t.tipoTarea));
    return filtered.length ? filtered : tasks;
  };

  const recommended = useMemo(() => recommendTasksForObjectives(f.objetivos, tasks), [f.objetivos, tasks]);
  const usageCounts = useMemo(() => computeTaskUsageCounts(ctx.trainings), [ctx.trainings]);
  const attendingPlayers = useMemo(() => {
    const asisteIds = new Set(f.asistencia.filter((a) => a.estado === "Asiste").map((a) => a.jugadorId));
    return players.filter((p) => asisteIds.has(p.id));
  }, [players, f.asistencia]);

  const tabs = [["info", "Información"], ["asistencia", "Asistencia"], ["objetivos", "Objetivos"], ["calentamiento", "Calentamiento"], ["tareas", "Parte principal"], ["juego", "Partido condicionado y juego real"], ["calma", "Vuelta a la calma"]];

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
          <Field label="Número de sesión"><TextInput value={f.numeroSesion} onChange={(e) => set("numeroSesion", e.target.value)} placeholder="Ej: 24" /></Field>
          <Field label="Fecha"><TextInput type="date" value={f.fecha} onChange={(e) => set("fecha", e.target.value)} /></Field>
          <Field label="Hora"><TextInput type="time" value={f.hora} onChange={(e) => set("hora", e.target.value)} /></Field>
          <Field label="Lugar"><TextInput value={f.lugar} onChange={(e) => set("lugar", e.target.value)} /></Field>
          <Field label="Duración (min)"><TextInput type="number" value={f.duracion} onChange={(e) => set("duracion", Number(e.target.value))} /></Field>
          <Field label="Número de jugadores disponibles">
            <TextInput type="number" value={f.numJugadores} disabled className="opacity-70" />
            <div className="text-[11px] mt-1" style={{ color: T.muted }}>Se calcula automáticamente según la pestaña "Asistencia".</div>
          </Field>
          <Field label="Objetivo general" className="sm:col-span-2"><TextArea value={f.objetivoGeneral} onChange={(e) => set("objetivoGeneral", e.target.value)} /></Field>
        </div>
      )}

      {tab === "objetivos" && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Físicos"><TextArea value={f.objetivos.fisicos} onChange={(e) => setNested("objetivos", "fisicos", e.target.value)} /></Field>
            <Field label="Técnicos"><TextArea value={f.objetivos.tecnicos} onChange={(e) => setNested("objetivos", "tecnicos", e.target.value)} /></Field>
            <Field label="Tácticos"><TextArea value={f.objetivos.tacticos} onChange={(e) => setNested("objetivos", "tacticos", e.target.value)} /></Field>
            <Field label="Estratégicos"><TextArea value={f.objetivos.estrategicos} onChange={(e) => setNested("objetivos", "estrategicos", e.target.value)} /></Field>
            <Field label="Psicológicos"><TextArea value={f.objetivos.psicologicos} onChange={(e) => setNested("objetivos", "psicologicos", e.target.value)} /></Field>
          </div>
          <ObjectiveRecommendations objetivos={f.objetivos} library={tasks} onAdd={addTaskFromLibrary}
            label="Sugerencias generales de la biblioteca de tareas — se añaden a Parte principal" />
        </div>
      )}

      {tab === "calentamiento" && (
        <div className="flex flex-col gap-4">
          <ObjectiveRecommendations objetivos={f.objetivos} library={libByCategoria("Calentamiento")}
            onAdd={(id) => blockAddFromLibrary("calentamiento", "tareas", id)}
            label="Sugerencias para el Calentamiento, según tus objetivos" />
          <TaskMiniList
            items={f.calentamiento.tareas}
            library={libByCategoria("Calentamiento")}
            attendingPlayers={attendingPlayers}
            usageCounts={usageCounts}
            onAddFromLibrary={(id) => blockAddFromLibrary("calentamiento", "tareas", id)}
            onAddBlank={() => blockAddBlank("calentamiento", "tareas")}
            onUpdate={(id, k, v) => blockUpdate("calentamiento", "tareas", id, k, v)}
            onRemove={(id) => blockRemove("calentamiento", "tareas", id)}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Actividad (manual, opcional)"><TextInput value={f.calentamiento.actividad} onChange={(e) => setNested("calentamiento", "actividad", e.target.value)} /></Field>
            <Field label="Objetivo"><TextInput value={f.calentamiento.objetivo} onChange={(e) => setNested("calentamiento", "objetivo", e.target.value)} /></Field>
            <Field label="Materiales"><TextInput value={f.calentamiento.materiales} onChange={(e) => setNested("calentamiento", "materiales", e.target.value)} /></Field>
            <Field label="Tiempo (min)"><TextInput type="number" value={f.calentamiento.tiempo} onChange={(e) => setNested("calentamiento", "tiempo", Number(e.target.value))} /></Field>
            <Field label="Notas / observaciones" className="sm:col-span-2"><TextArea value={f.calentamiento.notas} onChange={(e) => setNested("calentamiento", "notas", e.target.value)} /></Field>
          </div>
        </div>
      )}

      {tab === "tareas" && (
        <div className="flex flex-col gap-4">
          <ObjectiveRecommendations objetivos={f.objetivos} library={tasks} onAdd={addTaskFromLibrary}
            label="Sugerencias para la Parte principal, según tus objetivos" />
          <TaskMiniList
            items={f.tareas}
            library={tasks}
            attendingPlayers={attendingPlayers}
            usageCounts={usageCounts}
            onAddFromLibrary={addTaskFromLibrary}
            onAddBlank={addBlankTask}
            onUpdate={updateTask}
            onRemove={removeTask}
          />
        </div>
      )}

      {tab === "juego" && (
        <div className="flex flex-col gap-4">
          <ObjectiveRecommendations objetivos={f.objetivos} library={libByTipoTarea("Partidos condicionados", "Juego real")}
            onAdd={(id) => blockAddFromLibrary("aplicacionJuego", "tareas", id)}
            label="Sugerencias para Partido condicionado y juego real, según tus objetivos" />
          <TaskMiniList
            items={f.aplicacionJuego.tareas}
            library={libByTipoTarea("Partidos condicionados", "Juego real")}
            attendingPlayers={attendingPlayers}
            usageCounts={usageCounts}
            onAddFromLibrary={(id) => blockAddFromLibrary("aplicacionJuego", "tareas", id)}
            onAddBlank={() => blockAddBlank("aplicacionJuego", "tareas")}
            onUpdate={(id, k, v) => blockUpdate("aplicacionJuego", "tareas", id, k, v)}
            onRemove={(id) => blockRemove("aplicacionJuego", "tareas", id)}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Tipo">
              <Select value={f.aplicacionJuego.tipo} onChange={(e) => setNested("aplicacionJuego", "tipo", e.target.value)}>
                <option>Partido condicionado</option><option>Juego real</option><option>Juego reducido</option><option>Situación táctica</option>
              </Select>
            </Field>
            <Field label="Tiempo (min)"><TextInput type="number" value={f.aplicacionJuego.tiempo} onChange={(e) => setNested("aplicacionJuego", "tiempo", Number(e.target.value))} /></Field>
            <Field label="Objetivo" className="sm:col-span-2"><TextInput value={f.aplicacionJuego.objetivo} onChange={(e) => setNested("aplicacionJuego", "objetivo", e.target.value)} /></Field>
            <Field label="Observaciones" className="sm:col-span-2"><TextArea value={f.aplicacionJuego.observaciones} onChange={(e) => setNested("aplicacionJuego", "observaciones", e.target.value)} /></Field>
          </div>
        </div>
      )}

      {tab === "calma" && (
        <div className="flex flex-col gap-4">
          <ObjectiveRecommendations objetivos={f.objetivos} library={libByCategoria("Vuelta a la calma")}
            onAdd={(id) => blockAddFromLibrary("vueltaCalma", "tareas", id)}
            label="Sugerencias para la Vuelta a la calma, según tus objetivos" />
          <TaskMiniList
            items={f.vueltaCalma.tareas}
            library={libByCategoria("Vuelta a la calma")}
            attendingPlayers={attendingPlayers}
            usageCounts={usageCounts}
            onAddFromLibrary={(id) => blockAddFromLibrary("vueltaCalma", "tareas", id)}
            onAddBlank={() => blockAddBlank("vueltaCalma", "tareas")}
            onUpdate={(id, k, v) => blockUpdate("vueltaCalma", "tareas", id, k, v)}
            onRemove={(id) => blockRemove("vueltaCalma", "tareas", id)}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Estiramientos"><TextInput value={f.vueltaCalma.estiramientos} onChange={(e) => setNested("vueltaCalma", "estiramientos", e.target.value)} /></Field>
            <Field label="Actividad pasiva"><TextInput value={f.vueltaCalma.actividad} onChange={(e) => setNested("vueltaCalma", "actividad", e.target.value)} /></Field>
            <Field label="Tiempo (min)"><TextInput type="number" value={f.vueltaCalma.tiempo} onChange={(e) => setNested("vueltaCalma", "tiempo", Number(e.target.value))} /></Field>
            <Field label="Observaciones"><TextInput value={f.vueltaCalma.observaciones} onChange={(e) => setNested("vueltaCalma", "observaciones", e.target.value)} /></Field>
          </div>

          <div className="pt-2 border-t" style={{ borderColor: T.line }}>
            <div className="text-xs font-extrabold mb-2" style={{ color: T.navy }}>Estrategia / jugadas de balón parado (opcional)</div>
            <TaskMiniList
              items={f.vueltaCalma.balonParado}
              library={libByTipoTarea("Situaciones tácticas de juego y táctica fija")}
              attendingPlayers={attendingPlayers}
              usageCounts={usageCounts}
              onAddFromLibrary={(id) => blockAddFromLibrary("vueltaCalma", "balonParado", id)}
              onAddBlank={() => blockAddBlank("vueltaCalma", "balonParado")}
              onUpdate={(id, k, v) => blockUpdate("vueltaCalma", "balonParado", id, k, v)}
              onRemove={(id) => blockRemove("vueltaCalma", "balonParado", id)}
            />
          </div>

          <Field label="Notas del entrenador"><TextArea value={f.notas} onChange={(e) => set("notas", e.target.value)} /></Field>
        </div>
      )}

      {tab === "asistencia" && (
        <div className="flex flex-col gap-1.5">
          <div className="text-xs mb-1" style={{ color: T.muted }}>{f.asistencia.filter((a) => a.estado === "Asiste").length} de {players.length} jugadores disponibles para esta sesión.</div>
          {players.map((p) => {
            const row = f.asistencia.find((a) => a.jugadorId === p.id);
            const setEstado = (estado) => setF((prev) => ({ ...prev, asistencia: prev.asistencia.map((a) => a.jugadorId === p.id ? { ...a, estado } : a) }));
            const opts = [["Asiste", T.green], ["No asiste", T.redLight], ["Lesionado", T.yellow]];
            return (
              <div key={p.id} className="flex items-center gap-2 p-2 rounded-lg flex-wrap" style={{ background: "#F7F8FA" }}>
                <div className="text-sm font-bold flex-1 truncate min-w-[100px]" style={{ color: T.navy }}>{p.apodo || p.nombre}</div>
                <div className="flex gap-1.5">
                  {opts.map(([label, color]) => (
                    <button key={label} onClick={() => setEstado(label)}
                      className="px-2.5 py-1 rounded-full text-[11px] font-bold border"
                      style={{ background: row.estado === label ? color : "#fff", color: row.estado === label ? "#fff" : T.muted, borderColor: row.estado === label ? color : T.line }}>
                      {label}
                    </button>
                  ))}
                </div>
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

function printTask(t, config) {
  const esc = (s) => (s || "").toString().replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c]));
  const row = (label, value) => value ? `<div class="spec"><span class="specLabel">${esc(label)}</span><span class="specValue">${esc(value)}</span></div>` : "";
  const block = (label, value, color) => value ? `<div class="block" style="border-color:${color}22;"><div class="blockLabel" style="color:${color};">${esc(label)}</div><div class="blockText">${esc(value)}</div></div>` : "";
  const section = (title, color, inner) => inner ? `<div class="section"><div class="sectionTitle" style="background:${color};">${esc(title)}</div>${inner}</div>` : "";
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${esc(t.nombre)}</title>
  <style>
    @page { size: A4; margin: 10mm; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    html, body { background: #E9EDF3; margin: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; color-adjust: exact; }
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
    body { font-family: -apple-system, Segoe UI, Roboto, Arial, sans-serif; color: #1B2733; padding: 14px; font-size: 11px; }
    .toolbar { position: sticky; top: 0; display: flex; justify-content: center; gap: 10px; padding: 8px 0 14px; z-index: 50; }
    .toolbar button { font-family: inherit; font-size: 13px; font-weight: 800; border: none; border-radius: 12px; padding: 10px 20px; cursor: pointer; box-shadow: 0 4px 14px rgba(0,0,0,0.18); }
    .btnPrint { background: #E63946; color: #fff; }
    .btnClose { background: #fff; color: #0B1F3A; border: 1.5px solid #CBD5E1 !important; }
    .sheet { max-width: 210mm; margin: 0 auto; background: #fff; border-radius: 14px; padding: 16px 20px 18px; box-shadow: 0 6px 24px rgba(11,31,58,0.15); }
    .header { display: flex; align-items: center; gap: 10px; border-bottom: 3px solid #0B1F3A; padding-bottom: 8px; margin-bottom: 10px; }
    .header img { width: 40px; height: 40px; object-fit: contain; border-radius: 10px; }
    .headerInfo { flex: 1; text-align: left; }
    .teamName { font-size: 14px; font-weight: 800; color: #0B1F3A; }
    .teamMeta { font-size: 9.5px; color: #64748B; margin-top: 1px; }
    .title { text-align: right; }
    .title h1 { font-size: 14px; font-weight: 900; color: #E63946; margin: 0; letter-spacing: 0.3px; text-transform: uppercase; }
    .title .sub { font-size: 9px; color: #64748B; margin-top: 1px; font-weight: 600; }
    .taskName { font-size: 15px; font-weight: 800; color: #0B1F3A; text-align: center; margin-top: 2px; }
    .taskCode { font-size: 10px; color: #64748B; text-align: center; margin-bottom: 10px; }
    .twoCol { display: block; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 16px; background: #F5F7FA; border-radius: 10px; padding: 8px 12px; }
    .spec { display: flex; justify-content: space-between; font-size: 10px; padding: 2px 0; border-bottom: 1px dotted #D8DEE7; }
    .specLabel { color: #64748B; font-weight: 700; }
    .specValue { color: #0B1F3A; font-weight: 800; text-align: right; }
    .section { margin-top: 8px; }
    .sectionTitle { font-size: 9.5px; font-weight: 800; text-transform: uppercase; color: #fff; padding: 3px 10px; border-radius: 999px; display: inline-block; margin-bottom: 4px; letter-spacing: 0.3px; }
    .objectives { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
    .block { background: #FAFBFC; border: 1.5px solid #E2E8F0; border-radius: 8px; padding: 5px 9px; margin-bottom: 5px; }
    .blockLabel { font-size: 8.5px; font-weight: 800; text-transform: uppercase; margin-bottom: 1px; }
    .blockText { font-size: 10px; line-height: 1.3; color: #1B2733; }
    .imgWrap { text-align: center; }
    .imgWrap img { width: 100%; max-height: 420px; object-fit: contain; border-radius: 12px; border: 1.5px solid #E2E8F0; background: #FAFBFC; }
    .sideLabel { font-size: 9px; font-weight: 800; text-transform: uppercase; color: #94A3B8; margin: 8px 0 3px; }
    .footer { margin-top: 10px; text-align: center; font-size: 8px; color: #94A3B8; border-top: 1px solid #E2E8F0; padding-top: 6px; }
    @media print {
      html, body { background: #fff; }
      .toolbar { display: none !important; }
      .sheet { box-shadow: none; border-radius: 0; padding: 0; max-width: 100%; }
      body { padding: 0; }
    }
  </style></head>
  <body>
    <div class="toolbar">
      <button class="btnPrint" onclick="window.print()">🖨️ Imprimir / Guardar PDF</button>
      <button class="btnClose" onclick="window.close()">Cerrar vista previa</button>
    </div>
    <div class="sheet" id="sheet">
      <div class="header">
        ${config.logo ? `<img src="${config.logo}" />` : ""}
        <div class="headerInfo">
          <div class="teamName">${esc(config.teamName || "Equipo")}</div>
          <div class="teamMeta">${esc(config.category || "")}${config.category && config.season ? " · " : ""}${esc(config.season || "")}</div>
        </div>
        <div class="title"><h1>Tarea de entrenamiento</h1><div class="sub">Ficha técnica de ejercicio</div></div>
      </div>
      <div class="taskName">${esc(t.nombre)}</div>
      <div class="taskCode">${esc(t.codigo)}${t.codigo ? " · " : ""}${esc(t.categoria)}</div>

      <div class="twoCol">
        <div>
          ${section("Objetivos", "#0B1F3A", `<div class="objectives">
            ${block("Físico", t.objFisico, "#2A9D5C")}
            ${block("Técnico", t.objTecnico, "#E63946")}
            ${block("Táctico", t.objTactico, "#0B1F3A")}
            ${block("Psicológico", t.objPsicologico, "#F4B400")}
          </div>`)}

          ${section("Materiales", "#2A9D5C", `<div class="block" style="margin-bottom:0;">${esc(t.materiales) || "—"}</div>`)}

          ${section("Especificaciones", "#E63946", `<div class="grid">
            ${row("Tipo de ejercicio", t.tipoEjercicio)}
            ${row("Zona de trabajo", t.zonaTrabajo)}
            ${row("Fase del juego", t.faseJuego)}
            ${row("Momento del juego", t.momentoJuego)}
            ${row("Tipo de tarea", t.tipoTarea)}
            ${row("Edad / categoría", t.edad)}
            ${row("Nº jugadores", t.minJugadores && t.maxJugadores ? `${t.minJugadores}-${t.maxJugadores}` : "")}
            ${row("Espacio", t.espacio)}
            ${row("Duración", t.duracion ? `${t.duracion} min` : "")}
          </div>`)}

          ${section("Descripción", "#0B1F3A", t.descripcion ? `<div class="block" style="margin-bottom:0;">${esc(t.descripcion)}</div>` : "")}
          ${section("Reglas o provocación", "#F4B400", t.reglas ? `<div class="block" style="margin-bottom:0;">${esc(t.reglas)}</div>` : "")}
          ${section("Movimientos y acciones a observar", "#E63946", t.movimientosObservar ? `<div class="block" style="margin-bottom:0;">${esc(t.movimientosObservar)}</div>` : "")}
          ${section("Notas adicionales", "#64748B", t.observaciones ? `<div class="block" style="margin-bottom:0;">${esc(t.observaciones)}</div>` : "")}
        </div>
        ${t.imagen ? `<div class="section"><div class="sectionTitle" style="background:#2A9D5C;">Representación gráfica</div><div class="imgWrap"><img src="${t.imagen}" /></div></div>` : ""}
      </div>

      <div class="footer">Generado con PZ · Puntualización Zonal</div>
    </div>
    <script>
      window.onload = function () {
        var sheet = document.getElementById('sheet');
        var pageHeightPx = 277 * 96 / 25.4; // alto útil de una hoja A4 con márgenes de 10mm
        var scale = 1;
        var tries = 0;
        while (sheet.scrollHeight * scale > pageHeightPx && tries < 25) {
          scale -= 0.02;
          sheet.style.zoom = scale;
          tries++;
        }
      };
    </script>
  </body></html>`;
  const w = window.open("", "_blank");
  if (w) { w.document.open(); w.document.write(html); w.document.close(); }
}

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
          <Card key={t.id} className="p-4 cursor-pointer hover:shadow-md transition relative" onClick={() => setEditTask(t)}>
            <div className="absolute top-3 right-3 flex gap-1 z-10">
              <button onClick={(e) => { e.stopPropagation(); printTask(t, config); }} className="p-1.5 rounded-lg hover:bg-slate-100" title="Imprimir / PDF">
                <Printer size={14} style={{ color: T.muted }} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); setEditTask(t); }} className="p-1.5 rounded-lg hover:bg-slate-100" title="Editar">
                <Edit3 size={14} style={{ color: T.muted }} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); if (confirm("¿Eliminar esta tarea?")) updateTasks((prev) => prev.filter((x) => x.id !== t.id)); }} className="p-1.5 rounded-lg hover:bg-red-50" title="Eliminar">
                <Trash2 size={14} style={{ color: T.redLight }} />
              </button>
            </div>
            <div className="flex items-start gap-3 pr-20">
              {t.imagen && <img src={t.imagen} alt={t.nombre} className="w-16 h-16 rounded-lg object-cover shrink-0" />}
              <div className="flex-1 min-w-0">
                <div>
                  <div className="font-extrabold" style={{ color: T.navy }}>{t.nombre}</div>
                  <div className="text-xs" style={{ color: T.muted }}>{t.codigo} · {t.categoria}</div>
                </div>
                <div className="text-xs mt-2 line-clamp-2" style={{ color: T.text }}>{t.descripcion}</div>
                <div className="flex gap-1.5 flex-wrap mt-2">
                  <Pill>{t.duracion} min</Pill>
                  <Pill color={T.green} bg="#E7F6ED">{t.minJugadores}-{t.maxJugadores} jug.</Pill>
                  <Pill>{t.espacio}</Pill>
                  {t.videoUrl && <Pill color={T.red} bg="#FCEAEC">🎬 Video</Pill>}
                </div>
              </div>
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
    id: uid(), nombre: "", codigo: "", categoria: config.taskCategories[0],
    tipoEjercicio: TIPO_EJERCICIO[0], zonaTrabajo: ZONA_TRABAJO[0], faseJuego: FASE_JUEGO[0], momentoJuego: MOMENTO_JUEGO[0], tipoTarea: TIPO_TAREA[0],
    edad: "", minJugadores: "", maxJugadores: "",
    espacio: "", duracion: "", objFisico: "", objTecnico: "", objTactico: "", objPsicologico: "", materiales: "",
    descripcion: "", reglas: "", movimientosObservar: "", observaciones: "",
    imagen: null, videoUrl: "",
  });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const embedUrl = getVideoEmbedUrl(f.videoUrl);
  return (
    <Modal title={initial ? "Editar tarea" : "Nueva tarea"} onClose={onClose} wide>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Nombre"><TextInput value={f.nombre} onChange={(e) => set("nombre", e.target.value)} /></Field>
        <Field label="Código"><TextInput value={f.codigo} onChange={(e) => set("codigo", e.target.value)} /></Field>
        <Field label="Categoría"><Select value={f.categoria} onChange={(e) => set("categoria", e.target.value)}>{config.taskCategories.map((c) => <option key={c}>{c}</option>)}</Select></Field>
        <Field label="Tipo de ejercicio"><Select value={f.tipoEjercicio} onChange={(e) => set("tipoEjercicio", e.target.value)}>{TIPO_EJERCICIO.map((c) => <option key={c}>{c}</option>)}</Select></Field>
        <Field label="Zona de trabajo"><Select value={f.zonaTrabajo} onChange={(e) => set("zonaTrabajo", e.target.value)}>{ZONA_TRABAJO.map((c) => <option key={c}>{c}</option>)}</Select></Field>
        <Field label="Fase del juego"><Select value={f.faseJuego} onChange={(e) => set("faseJuego", e.target.value)}>{FASE_JUEGO.map((c) => <option key={c}>{c}</option>)}</Select></Field>
        <Field label="Momentos del juego"><Select value={f.momentoJuego} onChange={(e) => set("momentoJuego", e.target.value)}>{MOMENTO_JUEGO.map((c) => <option key={c}>{c}</option>)}</Select></Field>
        <Field label="Tipo de tarea"><Select value={f.tipoTarea} onChange={(e) => set("tipoTarea", e.target.value)}>{TIPO_TAREA.map((c) => <option key={c}>{c}</option>)}</Select></Field>
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
        <Field label="Reglas o provocación"><TextArea value={f.reglas} onChange={(e) => set("reglas", e.target.value)} /></Field>
        <Field label="Movimientos y acciones a observar y corregir"><TextArea value={f.movimientosObservar} onChange={(e) => set("movimientosObservar", e.target.value)} /></Field>
        <Field label="Observaciones" className="sm:col-span-2"><TextArea value={f.observaciones} onChange={(e) => set("observaciones", e.target.value)} /></Field>

        <Field label="Representación gráfica de la tarea" className="sm:col-span-2">
          <TaskImageUploader value={f.imagen} onChange={(dataUrl) => set("imagen", dataUrl)} />
        </Field>
        <Field label="Enlace a video (YouTube, Vimeo, Drive…)" className="sm:col-span-2">
          <TextInput type="url" placeholder="https://www.youtube.com/watch?v=…" value={f.videoUrl} onChange={(e) => set("videoUrl", e.target.value)} />
          {f.videoUrl && (
            embedUrl ? (
              <div className="mt-2 rounded-xl overflow-hidden" style={{ aspectRatio: "16/9" }}>
                <iframe src={embedUrl} className="w-full h-full" allowFullScreen title="Video de la tarea" />
              </div>
            ) : (
              <a href={f.videoUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold mt-1 inline-block" style={{ color: T.red }}>Abrir enlace de video ↗</a>
            )
          )}
        </Field>
      </div>
      <div className="flex justify-between gap-2 mt-5 sticky bottom-0 bg-white -mx-5 px-5 py-3 border-t" style={{ borderColor: T.line }}>
        {onDelete ? <Btn variant="danger" icon={Trash2} onClick={onDelete}>Eliminar</Btn> : <div />}
        <div className="flex gap-2">
          {initial && <Btn variant="ghost" icon={Printer} onClick={() => printTask(f, ctx.config)}>Imprimir</Btn>}
          <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
          <Btn variant="accent" icon={Save} onClick={() => onSave(f)}>Guardar tarea</Btn>
        </div>
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

function LineChartSVG({ points, color, height = 140 }) {
  if (!points.length) return null;
  const width = 100; // % viewbox, scaled via viewBox
  const maxY = Math.max(...points.map((p) => p.y), 1);
  const minY = Math.min(...points.map((p) => p.y), 0);
  const range = maxY - minY || 1;
  const stepX = points.length > 1 ? width / (points.length - 1) : 0;
  const coords = points.map((p, i) => ({ x: i * stepX, y: height - ((p.y - minY) / range) * (height - 20) - 10 }));
  const path = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x} ${c.y}`).join(" ");
  const areaPath = `${path} L ${coords[coords.length - 1].x} ${height} L 0 ${height} Z`;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height }} preserveAspectRatio="none">
      <path d={areaPath} fill={color} opacity="0.12" />
      <path d={path} fill="none" stroke={color} strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
      {coords.map((c, i) => (
        <circle key={i} cx={c.x} cy={c.y} r="1.6" fill={color} vectorEffect="non-scaling-stroke">
          <title>{points[i].label}</title>
        </circle>
      ))}
    </svg>
  );
}

function Estadisticas({ ctx }) {
  const { players, matches } = ctx;
  const ts = computeTeamStats(matches);
  const topScorers = [...players].sort((a, b) => b.stats.goles - a.stats.goles).slice(0, 5);
  const topAssists = [...players].sort((a, b) => b.stats.asistencias - a.stats.asistencias).slice(0, 5);
  const sortedMatches = [...matches].sort((a, b) => a.fecha.localeCompare(b.fecha));

  let acumulado = 0;
  const pointsEvolution = sortedMatches.map((m, i) => {
    const { resultado } = resultadoPropio(m);
    acumulado += resultado === "V" ? 3 : resultado === "E" ? 1 : 0;
    return { y: acumulado, label: `J${m.jornada || i + 1} vs ${m.rival}: ${m.resultadoFinal} (${acumulado} pts)` };
  });

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <div><Eyebrow>Estadísticas</Eyebrow><h1 className="text-2xl font-extrabold" style={{ color: T.navy }}>Resumen del equipo</h1>
        <p className="text-xs mt-1" style={{ color: T.muted }}>Todos los datos se calculan automáticamente a partir de Partidos y Plantilla.</p>
      </div>

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
            const { golesPropios, golesRival, resultado } = resultadoPropio(m);
            const c = resultado === "V" ? T.green : resultado === "E" ? T.yellow : T.redLight;
            return <div key={i} className="flex-1 rounded-t-md" style={{ height: `${Math.max(golesPropios, golesRival, 1) * 18}px`, background: c }} title={`${m.rival}: ${m.resultadoFinal}`} />;
          })}
          {!sortedMatches.length && <div className="text-sm" style={{ color: T.muted }}>Sin partidos registrados todavía.</div>}
        </div>
      </Card>

      <Card className="p-4">
        <Eyebrow>Evolución de puntos acumulados por jornada</Eyebrow>
        {pointsEvolution.length > 1 ? (
          <div className="mt-3"><LineChartSVG points={pointsEvolution} color={T.red} /></div>
        ) : (
          <div className="text-sm mt-3" style={{ color: T.muted }}>Se necesitan al menos 2 partidos registrados para trazar la evolución.</div>
        )}
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

function resizeImageToDataUrl(file, maxSize = 400) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > height) { if (width > maxSize) { height = Math.round(height * (maxSize / width)); width = maxSize; } }
        else { if (height > maxSize) { width = Math.round(width * (maxSize / height)); height = maxSize; } }
        const canvas = document.createElement("canvas");
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function LogoUploader({ value, onChange }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);

  const handleFile = async (file) => {
    if (!file) return;
    setBusy(true);
    try {
      const dataUrl = await resizeImageToDataUrl(file, 400);
      onChange(dataUrl);
    } catch {
      alert("No se pudo procesar la imagen. Prueba con otra foto.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="w-20 h-20 rounded-2xl flex items-center justify-center overflow-hidden shrink-0" style={{ background: "#F7F8FA", border: `1px solid ${T.line}` }}>
        {value ? <img src={value} alt="Escudo del equipo" className="w-full h-full object-cover" /> : <span className="text-[11px] font-bold" style={{ color: T.muted }}>Sin imagen</span>}
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <Btn variant="accent" onClick={() => inputRef.current?.click()} disabled={busy}>{busy ? "Procesando…" : "Subir imagen"}</Btn>
          {value && <Btn variant="ghost" onClick={() => onChange(null)}>Quitar</Btn>}
        </div>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
        <div className="text-[11px]" style={{ color: T.muted }}>Se ajusta automáticamente para ocupar poco espacio. Se usará en el menú lateral de la app.</div>
      </div>
    </div>
  );
}

function TaskImageUploader({ value, onChange }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);

  const handleFile = async (file) => {
    if (!file) return;
    setBusy(true);
    try {
      const dataUrl = await resizeImageToDataUrl(file, 900);
      onChange(dataUrl);
    } catch {
      alert("No se pudo procesar la imagen. Prueba con otra foto.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {value && (
        <div className="rounded-xl overflow-hidden max-w-sm" style={{ border: `1px solid ${T.line}` }}>
          <img src={value} alt="Representación gráfica de la tarea" className="w-full object-cover" />
        </div>
      )}
      <div className="flex gap-2">
        <Btn variant="ghost" onClick={() => inputRef.current?.click()} disabled={busy}>{busy ? "Procesando…" : value ? "Cambiar imagen" : "Subir imagen"}</Btn>
        {value && <Btn variant="ghost" onClick={() => onChange(null)}>Quitar</Btn>}
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
    </div>
  );
}

function getVideoEmbedUrl(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com")) {
      const id = u.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}`;
      const parts = u.pathname.split("/").filter(Boolean);
      if (parts[0] === "embed" && parts[1]) return `https://www.youtube.com/embed/${parts[1]}`;
    }
    if (u.hostname.includes("youtu.be")) {
      const id = u.pathname.split("/").filter(Boolean)[0];
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    if (u.hostname.includes("vimeo.com")) {
      const id = u.pathname.split("/").filter(Boolean)[0];
      if (id) return `https://player.vimeo.com/video/${id}`;
    }
  } catch {
    return null;
  }
  return null;
}

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
          <Field label="Escudo / logotipo / foto del equipo">
            <LogoUploader value={config.logo} onChange={(dataUrl) => set("logo", dataUrl)} />
          </Field>
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

function CuerpoTecnicoEditor({ items, onChange }) {
  const [nombre, setNombre] = useState("");
  const [cargo, setCargo] = useState("");
  const add = () => { if (!nombre.trim()) return; onChange([...items, { id: uid(), nombre: nombre.trim(), cargo: cargo.trim() }]); setNombre(""); setCargo(""); };
  const remove = (id) => onChange(items.filter((x) => x.id !== id));
  return (
    <div className="flex flex-col gap-2">
      {items.map((it) => (
        <div key={it.id} className="flex items-center justify-between gap-2 p-2 rounded-lg" style={{ background: "#F7F8FA" }}>
          <div className="text-sm"><span className="font-bold" style={{ color: T.navy }}>{it.nombre}</span>{it.cargo ? ` · ${it.cargo}` : ""}</div>
          <button onClick={() => remove(it.id)}><Trash2 size={14} style={{ color: T.redLight }} /></button>
        </div>
      ))}
      {!items.length && <div className="text-xs" style={{ color: T.muted }}>Sin miembros del cuerpo técnico registrados.</div>}
      <div className="flex gap-2 flex-wrap">
        <TextInput placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} className="flex-1 min-w-[140px]" />
        <TextInput placeholder="Cargo (ej: Preparador físico)" value={cargo} onChange={(e) => setCargo(e.target.value)} className="flex-1 min-w-[140px]" />
        <Btn variant="ghost" icon={Plus} onClick={add}>Añadir</Btn>
      </div>
    </div>
  );
}

function PlanItemModalForm({ title, fields, initial, onClose, onSave, onDelete, matches }) {
  const [f, setF] = useState(initial);
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const linkMatch = (matchId, fld) => {
    const m = matches?.find((x) => x.id === matchId);
    setF((p) => ({ ...p, [fld.key]: matchId || null, ...(m ? { fecha: m.fecha, rival: m.rival } : {}) }));
  };
  return (
    <Modal title={title} onClose={onClose}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {fields.map((fld) => (
          <Field key={fld.key} label={fld.label} className={fld.wide ? "sm:col-span-2" : ""}>
            {fld.type === "textarea" ? <TextArea value={f[fld.key] || ""} onChange={(e) => set(fld.key, e.target.value)} />
              : fld.type === "date" ? <TextInput type="date" value={f[fld.key] || ""} onChange={(e) => set(fld.key, e.target.value)} />
              : fld.type === "select" ? <Select value={f[fld.key] || ""} onChange={(e) => set(fld.key, e.target.value)}>{fld.options.map((o) => <option key={o}>{o}</option>)}</Select>
              : fld.type === "matchRef" ? (
                <div>
                  <Select value={f[fld.key] || ""} onChange={(e) => linkMatch(e.target.value, fld)}>
                    <option value="">— Cargar manualmente (sin vincular) —</option>
                    {[...(matches || [])].sort((a, b) => b.fecha.localeCompare(a.fecha)).map((m) => (
                      <option key={m.id} value={m.id}>{m.fecha} vs {m.rival} ({m.competicion}){m.resultadoFinal ? ` · ${m.resultadoFinal}` : ""}</option>
                    ))}
                  </Select>
                  {f[fld.key] && <div className="text-[11px] mt-1" style={{ color: T.green }}>✓ Vinculado — fecha y rival se toman del partido registrado.</div>}
                </div>
              )
              : fld.type === "matchMultiRef" ? (
                <div className="flex flex-col gap-1 max-h-40 overflow-y-auto border rounded-lg p-2" style={{ borderColor: T.line }}>
                  {[...(matches || [])].sort((a, b) => b.fecha.localeCompare(a.fecha)).map((m) => {
                    const list = f[fld.key] || [];
                    const checked = list.includes(m.id);
                    return (
                      <label key={m.id} className="flex items-center gap-2 text-xs">
                        <input type="checkbox" checked={checked} onChange={(e) => set(fld.key, e.target.checked ? [...list, m.id] : list.filter((id) => id !== m.id))} />
                        {m.fecha} vs {m.rival} ({m.competicion}){m.resultadoFinal ? ` · ${m.resultadoFinal}` : ""}
                      </label>
                    );
                  })}
                  {!matches?.length && <div className="text-xs" style={{ color: T.muted }}>Todavía no hay partidos registrados.</div>}
                </div>
              )
              : <TextInput value={f[fld.key] || ""} onChange={(e) => set(fld.key, e.target.value)} disabled={fld.readOnlyIfLinked && !!f[fld.readOnlyIfLinked]} />}
          </Field>
        ))}
      </div>
      <div className="flex justify-between gap-2 mt-5 sticky bottom-0 bg-white -mx-5 px-5 py-3 border-t" style={{ borderColor: T.line }}>
        {onDelete ? <Btn variant="danger" icon={Trash2} onClick={onDelete}>Eliminar</Btn> : <div />}
        <div className="flex gap-2"><Btn variant="ghost" onClick={onClose}>Cancelar</Btn><Btn variant="accent" icon={Save} onClick={() => onSave(f)}>Guardar</Btn></div>
      </div>
    </Modal>
  );
}

function SimplePlanList({ title, items, blank, fields, titleField, subtitleField, onAdd, onSave, onRemove, matches }) {
  const [editing, setEditing] = useState(null);
  const [showNew, setShowNew] = useState(false);
  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end"><Btn variant="accent" icon={Plus} onClick={() => setShowNew(true)}>Añadir</Btn></div>
      {items.map((it) => (
        <Card key={it.id} className="p-4 cursor-pointer hover:shadow-md transition" onClick={() => setEditing(it)}>
          <div className="font-extrabold" style={{ color: T.navy }}>{it[titleField] || "(sin título)"}</div>
          {subtitleField && <div className="text-xs" style={{ color: T.muted }}>{it[subtitleField]}</div>}
        </Card>
      ))}
      {!items.length && <div className="text-sm" style={{ color: T.muted }}>Todavía no hay registros.</div>}
      {showNew && <PlanItemModalForm title={title} fields={fields} initial={blank()} onClose={() => setShowNew(false)} onSave={(it) => { onAdd(it); setShowNew(false); }} matches={matches} />}
      {editing && <PlanItemModalForm title={title} fields={fields} initial={editing} onClose={() => setEditing(null)} onSave={(it) => { onSave(it); setEditing(null); }} onDelete={() => { onRemove(editing.id); setEditing(null); }} matches={matches} />}
    </div>
  );
}

function printWeek(w, config, weekTrainingsArr, weekMatchesArr) {
  const esc = (s) => (s || "").toString().replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c]));
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Semana ${esc(w.numero)}</title>
  <style>
    @page { size: A4; margin: 12mm; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    html, body { background: #E9EDF3; margin: 0; }
    body { font-family: -apple-system, Segoe UI, Roboto, Arial, sans-serif; color: #1B2733; padding: 14px; font-size: 12px; }
    .toolbar { position: sticky; top: 0; display: flex; justify-content: center; gap: 10px; padding: 8px 0 14px; }
    .toolbar button { font-family: inherit; font-size: 13px; font-weight: 800; border: none; border-radius: 12px; padding: 10px 20px; cursor: pointer; box-shadow: 0 4px 14px rgba(0,0,0,0.18); }
    .btnPrint { background: #E63946; color: #fff; } .btnClose { background: #fff; color: #0B1F3A; border: 1.5px solid #CBD5E1 !important; }
    .sheet { max-width: 210mm; margin: 0 auto; background: #fff; border-radius: 14px; padding: 18px 22px; box-shadow: 0 6px 24px rgba(11,31,58,0.15); }
    .title { font-size: 18px; font-weight: 900; color: #0B1F3A; border-bottom: 3px solid #0B1F3A; padding-bottom: 8px; margin-bottom: 10px; }
    .grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 12px; }
    .chip { background: #F5F7FA; border-radius: 10px; padding: 8px; text-align: center; font-size: 11px; font-weight: 700; color: #0B1F3A; }
    .section { margin-top: 12px; }
    .sectionTitle { font-size: 11px; font-weight: 800; text-transform: uppercase; color: #fff; background: #0B1F3A; padding: 4px 10px; border-radius: 999px; display: inline-block; margin-bottom: 6px; }
    .item { background: #FAFBFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 6px 10px; margin-bottom: 4px; font-size: 11px; }
    @media print { html, body { background: #fff; } .toolbar { display: none !important; } .sheet { box-shadow: none; padding: 0; } body { padding: 0; } }
  </style></head><body>
    <div class="toolbar"><button class="btnPrint" onclick="window.print()">🖨️ Imprimir / Guardar PDF</button><button class="btnClose" onclick="window.close()">Cerrar vista previa</button></div>
    <div class="sheet">
      <div class="title">${esc(config.teamName)} · Semana ${esc(w.numero)} (${esc(w.fechaInicio)})</div>
      <div class="grid3">
        <div class="chip">Carga prevista<br/><b>${esc(w.cargaPrevista)}</b></div>
        <div class="chip">Sesiones<br/><b>${weekTrainingsArr.length}</b></div>
        <div class="chip">Partidos<br/><b>${weekMatchesArr.length}</b></div>
      </div>
      ${w.objetivo ? `<div class="section"><div class="sectionTitle">Objetivo semanal</div><div class="item">${esc(w.objetivo)}</div></div>` : ""}
      <div class="section"><div class="sectionTitle">Contenido por área</div>
        ${w.contenidoFisico ? `<div class="item"><b>Físico:</b> ${esc(w.contenidoFisico)}</div>` : ""}
        ${w.contenidoTecnico ? `<div class="item"><b>Técnico:</b> ${esc(w.contenidoTecnico)}</div>` : ""}
        ${w.contenidoTactico ? `<div class="item"><b>Táctico:</b> ${esc(w.contenidoTactico)}</div>` : ""}
        ${w.contenidoPsicologico ? `<div class="item"><b>Psicológico:</b> ${esc(w.contenidoPsicologico)}</div>` : ""}
      </div>
      <div class="section"><div class="sectionTitle">Sesiones de la semana</div>
        ${weekTrainingsArr.map((t) => `<div class="item">${esc(t.fecha)} — ${esc(t.objetivoGeneral) || "Sesión de entrenamiento"}</div>`).join("") || `<div class="item">Sin sesiones registradas.</div>`}
      </div>
      <div class="section"><div class="sectionTitle">Partidos de la semana</div>
        ${weekMatchesArr.map((m) => `<div class="item">${esc(m.fecha)} vs ${esc(m.rival)} — ${esc(m.resultadoFinal)}</div>`).join("") || `<div class="item">Sin partidos esta semana.</div>`}
      </div>
    </div>
  </body></html>`;
  const w2 = window.open("", "_blank");
  if (w2) { w2.document.open(); w2.document.write(html); w2.document.close(); }
}

function printSeasonPlanning(season, seasonPlanning, config, matches) {
  const esc = (s) => (s || "").toString().replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c]));
  const section = (title, color, inner) => `<div class="section"><div class="sectionTitle" style="background:${color};">${esc(title)}</div>${inner}</div>`;
  const item = (text) => `<div class="item">${text}</div>`;
  const list = (arr, render, empty) => arr?.length ? arr.map(render).join("") : item(empty);

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Temporada y Planificación</title>
  <style>
    @page { size: A4; margin: 12mm; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    html, body { background: #E9EDF3; margin: 0; }
    body { font-family: -apple-system, Segoe UI, Roboto, Arial, sans-serif; color: #1B2733; padding: 14px; font-size: 11px; }
    .toolbar { position: sticky; top: 0; display: flex; justify-content: center; gap: 10px; padding: 8px 0 14px; }
    .toolbar button { font-family: inherit; font-size: 13px; font-weight: 800; border: none; border-radius: 12px; padding: 10px 20px; cursor: pointer; box-shadow: 0 4px 14px rgba(0,0,0,0.18); }
    .btnPrint { background: #E63946; color: #fff; } .btnClose { background: #fff; color: #0B1F3A; border: 1.5px solid #CBD5E1 !important; }
    .sheet { max-width: 210mm; margin: 0 auto; background: #fff; border-radius: 14px; padding: 20px 24px; box-shadow: 0 6px 24px rgba(11,31,58,0.15); }
    .title { font-size: 20px; font-weight: 900; color: #0B1F3A; border-bottom: 3px solid #0B1F3A; padding-bottom: 10px; margin-bottom: 14px; text-align: center; }
    .subtitle { font-size: 13px; font-weight: 800; color: #0B1F3A; margin: 18px 0 6px; border-bottom: 2px solid #E2E8F0; padding-bottom: 4px; }
    .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .section { margin-top: 8px; }
    .sectionTitle { font-size: 10.5px; font-weight: 800; text-transform: uppercase; color: #fff; padding: 3px 10px; border-radius: 999px; display: inline-block; margin-bottom: 5px; }
    .item { background: #FAFBFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 5px 9px; margin-bottom: 4px; font-size: 10.5px; }
    @media print { html, body { background: #fff; } .toolbar { display: none !important; } .sheet { box-shadow: none; padding: 0; } body { padding: 0; } }
  </style></head><body>
    <div class="toolbar"><button class="btnPrint" onclick="window.print()">🖨️ Imprimir / Guardar PDF</button><button class="btnClose" onclick="window.close()">Cerrar vista previa</button></div>
    <div class="sheet">
      <div class="title">${esc(config.teamName)} — Temporada y Planificación</div>

      <div class="subtitle">Temporada</div>
      <div class="grid2">
        ${item(`<b>Equipo:</b> ${esc(season.equipo)}`)}${item(`<b>Categoría:</b> ${esc(season.categoria)}`)}
        ${item(`<b>Localidad:</b> ${esc(season.localidad)}`)}${item(`<b>Competición:</b> ${esc(season.competicion)}`)}
        ${item(`<b>Inicio:</b> ${esc(season.fechaInicio)}`)}${item(`<b>Fin:</b> ${esc(season.fechaFin)}`)}
      </div>
      ${season.objetivosGenerales ? item(`<b>Objetivos generales:</b> ${esc(season.objetivosGenerales)}`) : ""}
      ${(season.cuerpoTecnico || []).length ? section("Cuerpo técnico", "#0B1F3A", list(season.cuerpoTecnico, (c) => item(`${esc(c.nombre)} — ${esc(c.cargo)}`))) : ""}

      <div class="subtitle">Pretemporada</div>
      ${item(`<b>Del ${esc(seasonPlanning.pretemporada.fechaInicio)} al ${esc(seasonPlanning.pretemporada.fechaFin)}</b>`)}
      ${seasonPlanning.pretemporada.objetivos ? item(`<b>Objetivos:</b> ${esc(seasonPlanning.pretemporada.objetivos)}`) : ""}
      ${section("Agenda", "#F4B400", list(seasonPlanning.pretemporada.dias, (d) => item(`${esc(d.fecha)} — ${esc(d.tipo)}${d.notas ? `: ${esc(d.notas)}` : ""}`), "Sin días agendados."))}
      ${section("Amistosos", "#2A9D5C", list(seasonPlanning.pretemporada.amistosos, (a) => item(`${esc(a.fecha)} vs ${esc(a.rival)} — ${esc(a.objetivo)}`), "Sin amistosos."))}

      <div class="subtitle">Planificación semanal</div>
      ${section("Semanas", "#0B1F3A", list(season.weeks, (w) => item(`Semana ${esc(w.numero)} (${esc(w.fechaInicio)}) — ${esc(w.objetivo)} · Carga: ${esc(w.cargaPrevista)}`), "Sin semanas planificadas."))}

      <div class="subtitle">Planificación mensual</div>
      ${section("Meses", "#E63946", list(seasonPlanning.mensual, (m) => item(`${esc(m.mes)} — ${esc(m.objetivo)}`), "Sin meses planificados."))}

      <div class="subtitle">Toda la temporada</div>
      ${section("Fases", "#2A9D5C", list(seasonPlanning.macrociclo, (f) => item(`${esc(f.nombre)} (${esc(f.fechaInicio)} — ${esc(f.fechaFin)}): ${esc(f.objetivo)}`), "Sin fases definidas."))}

      <div class="subtitle">Partidos no programados</div>
      ${section("Imprevistos", "#94A3B8", list(seasonPlanning.partidoNoProgramado, (m) => item(`${esc(m.fecha)} vs ${esc(m.rival)} — ${esc(m.objetivo)}`), "Ninguno registrado."))}

      <div class="subtitle">Torneos rápidos</div>
      ${section("Torneos", "#F4B400", list(seasonPlanning.torneoRapido, (t) => item(`${esc(t.nombreTorneo)} (${esc(t.fechaInicio)} — ${esc(t.fechaFin)})${(t.partidoIds || []).length ? " · Partidos: " + t.partidoIds.map((id) => { const m = (matches || []).find((x) => x.id === id); return m ? `${esc(m.fecha)} vs ${esc(m.rival)}` : ""; }).filter(Boolean).join(", ") : ""}`), "Ninguno registrado."))}
    </div>
  </body></html>`;
  const w = window.open("", "_blank");
  if (w) { w.document.open(); w.document.write(html); w.document.close(); }
}

function TemporadaModule({ ctx }) {
  const { season, updateSeason, matches, trainings, seasonPlanning, updateSeasonPlanning, config } = ctx;
  const [tab, setTab] = useState("temporada");
  const [planTab, setPlanTab] = useState("pretemporada");
  const [editWeek, setEditWeek] = useState(null);
  const [dayModal, setDayModal] = useState(null);
  const [amistosoModal, setAmistosoModal] = useState(null);
  if (!season || !seasonPlanning) return null;
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

  const setPretemp = (k, v) => updateSeasonPlanning((p) => ({ ...p, pretemporada: { ...p.pretemporada, [k]: v } }));
  const addDia = (dia) => updateSeasonPlanning((p) => ({ ...p, pretemporada: { ...p.pretemporada, dias: [...p.pretemporada.dias, dia] } }));
  const saveDia = (dia) => updateSeasonPlanning((p) => ({ ...p, pretemporada: { ...p.pretemporada, dias: p.pretemporada.dias.map((x) => x.id === dia.id ? dia : x) } }));
  const removeDia = (id) => updateSeasonPlanning((p) => ({ ...p, pretemporada: { ...p.pretemporada, dias: p.pretemporada.dias.filter((x) => x.id !== id) } }));
  const addAmistoso = (a) => updateSeasonPlanning((p) => ({ ...p, pretemporada: { ...p.pretemporada, amistosos: [...p.pretemporada.amistosos, a] } }));
  const saveAmistoso = (a) => updateSeasonPlanning((p) => ({ ...p, pretemporada: { ...p.pretemporada, amistosos: p.pretemporada.amistosos.map((x) => x.id === a.id ? a : x) } }));
  const removeAmistoso = (id) => updateSeasonPlanning((p) => ({ ...p, pretemporada: { ...p.pretemporada, amistosos: p.pretemporada.amistosos.filter((x) => x.id !== id) } }));

  const planTabs = [["pretemporada", "Pretemporada"], ["semanal", "Semanal"], ["mensual", "Mensual"], ["macrociclo", "Toda la temporada"], ["imprevisto", "Partido no programado"], ["torneo", "Torneo rápido"], ["areas", "Áreas de rendimiento"]];

  return (
    <div className="flex flex-col gap-5 max-w-4xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><Eyebrow>Temporada y Planificación</Eyebrow><h1 className="text-2xl font-extrabold" style={{ color: T.navy }}>{season.competicion} · {season.categoria}</h1></div>
        <Btn variant="ghost" icon={Printer} onClick={() => printSeasonPlanning(season, seasonPlanning, config, matches)}>Imprimir todo</Btn>
      </div>
      <div className="flex gap-1.5">
        {[["temporada", "Temporada"], ["planificacion", "Planificación"]].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className="px-3.5 py-2 rounded-xl text-sm font-bold"
            style={{ background: tab === k ? T.navy : "#fff", color: tab === k ? "#fff" : T.muted, border: `1px solid ${tab === k ? T.navy : T.line}` }}>{l}</button>
        ))}
      </div>

      {tab === "temporada" && (
        <div className="flex flex-col gap-4">
          <Card className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Equipo"><TextInput value={season.equipo} onChange={(e) => set("equipo", e.target.value)} /></Field>
            <Field label="Categoría"><TextInput value={season.categoria} onChange={(e) => set("categoria", e.target.value)} /></Field>
            <Field label="Localidad / ciudad"><TextInput value={season.localidad || ""} onChange={(e) => set("localidad", e.target.value)} placeholder="Ej: Quito" /></Field>
            <Field label="Competición"><TextInput value={season.competicion} onChange={(e) => set("competicion", e.target.value)} /></Field>
            <Field label="Fecha de inicio"><TextInput type="date" value={season.fechaInicio} onChange={(e) => set("fechaInicio", e.target.value)} /></Field>
            <Field label="Fecha de finalización"><TextInput type="date" value={season.fechaFin} onChange={(e) => set("fechaFin", e.target.value)} /></Field>
            <Field label="Objetivos generales" className="sm:col-span-2"><TextArea value={season.objetivosGenerales} onChange={(e) => set("objetivosGenerales", e.target.value)} /></Field>
            <Field label="Objetivos deportivos"><TextArea value={season.objetivosDeportivos} onChange={(e) => set("objetivosDeportivos", e.target.value)} /></Field>
            <Field label="Objetivos formativos"><TextArea value={season.objetivosFormativos} onChange={(e) => set("objetivosFormativos", e.target.value)} /></Field>
          </Card>
          <Card className="p-5">
            <Eyebrow>Cuerpo técnico</Eyebrow>
            <div className="mt-3"><CuerpoTecnicoEditor items={season.cuerpoTecnico || []} onChange={(v) => set("cuerpoTecnico", v)} /></div>
          </Card>
        </div>
      )}

      {tab === "planificacion" && (
        <div className="flex flex-col gap-4">
          <div className="flex gap-1.5 flex-wrap">
            {planTabs.map(([k, l]) => (
              <button key={k} onClick={() => setPlanTab(k)} className="px-2.5 py-1.5 rounded-lg text-xs font-bold"
                style={{ background: planTab === k ? T.navy : "#fff", color: planTab === k ? "#fff" : T.muted, border: `1px solid ${planTab === k ? T.navy : T.line}` }}>{l}</button>
            ))}
          </div>

          {planTab === "pretemporada" && (
            <div className="flex flex-col gap-4">
              <Card className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Fecha de inicio"><TextInput type="date" value={seasonPlanning.pretemporada.fechaInicio} onChange={(e) => setPretemp("fechaInicio", e.target.value)} /></Field>
                <Field label="Fecha de finalización"><TextInput type="date" value={seasonPlanning.pretemporada.fechaFin} onChange={(e) => setPretemp("fechaFin", e.target.value)} /></Field>
                <Field label="Objetivos de la pretemporada" className="sm:col-span-2"><TextArea value={seasonPlanning.pretemporada.objetivos} onChange={(e) => setPretemp("objetivos", e.target.value)} /></Field>
              </Card>

              <div>
                <div className="flex items-center justify-between mb-2"><Eyebrow>Agenda día por día</Eyebrow><Btn variant="ghost" icon={Plus} onClick={() => setDayModal({ id: uid(), fecha: todayISO(), tipo: "Físico", notas: "" })}>Añadir día</Btn></div>
                <div className="flex flex-col gap-2">
                  {[...seasonPlanning.pretemporada.dias].sort((a, b) => a.fecha.localeCompare(b.fecha)).map((d) => (
                    <Card key={d.id} className="p-3 cursor-pointer hover:shadow-md transition" onClick={() => setDayModal(d)}>
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="text-sm font-bold" style={{ color: T.navy }}>{d.fecha}</div>
                        <Pill color={T.navy}>{d.tipo}</Pill>
                      </div>
                      {d.notas && <div className="text-xs mt-1" style={{ color: T.muted }}>{d.notas}</div>}
                    </Card>
                  ))}
                  {!seasonPlanning.pretemporada.dias.length && <div className="text-sm" style={{ color: T.muted }}>Sin días agendados todavía.</div>}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2"><Eyebrow>Partidos amistosos</Eyebrow><Btn variant="ghost" icon={Plus} onClick={() => setAmistosoModal({ id: uid(), matchId: null, fecha: todayISO(), rival: "", lugar: "", objetivo: "" })}>Añadir amistoso</Btn></div>
                <div className="flex flex-col gap-2">
                  {[...seasonPlanning.pretemporada.amistosos].sort((a, b) => a.fecha.localeCompare(b.fecha)).map((a) => (
                    <Card key={a.id} className="p-3 cursor-pointer hover:shadow-md transition" onClick={() => setAmistosoModal(a)}>
                      <div className="font-bold text-sm" style={{ color: T.navy }}>{a.fecha} · vs {a.rival || "?"}</div>
                      <div className="text-xs" style={{ color: T.muted }}>{a.lugar}{a.objetivo ? ` · Objetivo: ${a.objetivo}` : ""}</div>
                    </Card>
                  ))}
                  {!seasonPlanning.pretemporada.amistosos.length && <div className="text-sm" style={{ color: T.muted }}>Sin amistosos programados todavía.</div>}
                </div>
              </div>

              {dayModal && (
                <PlanItemModalForm title="Día de pretemporada"
                  fields={[{ key: "fecha", label: "Fecha", type: "date" }, { key: "tipo", label: "Tipo", type: "select", options: ["Físico", "Técnico", "Táctico", "Descanso", "Amistoso", "Test físico"] }, { key: "notas", label: "Notas", type: "textarea", wide: true }]}
                  initial={dayModal} onClose={() => setDayModal(null)}
                  onSave={(d) => { seasonPlanning.pretemporada.dias.find((x) => x.id === d.id) ? saveDia(d) : addDia(d); setDayModal(null); }}
                  onDelete={seasonPlanning.pretemporada.dias.find((x) => x.id === dayModal.id) ? () => { removeDia(dayModal.id); setDayModal(null); } : null} />
              )}
              {amistosoModal && (
                <PlanItemModalForm title="Partido amistoso"
                  fields={[{ key: "matchId", label: "Vincular partido ya registrado (opcional)", type: "matchRef" }, { key: "fecha", label: "Fecha", type: "date" }, { key: "rival", label: "Rival" }, { key: "lugar", label: "Lugar" }, { key: "objetivo", label: "Objetivo del amistoso", type: "textarea", wide: true }]}
                  initial={amistosoModal} onClose={() => setAmistosoModal(null)}
                  onSave={(a) => { seasonPlanning.pretemporada.amistosos.find((x) => x.id === a.id) ? saveAmistoso(a) : addAmistoso(a); setAmistosoModal(null); }}
                  onDelete={seasonPlanning.pretemporada.amistosos.find((x) => x.id === amistosoModal.id) ? () => { removeAmistoso(amistosoModal.id); setAmistosoModal(null); } : null}
                  matches={matches} />
              )}
            </div>
          )}

          {planTab === "semanal" && (
            <div className="flex flex-col gap-3">
              <div className="flex justify-end"><Btn variant="accent" icon={Plus} onClick={addWeek}>Añadir semana</Btn></div>
              {season.weeks.map((w) => (
                <Card key={w.id} className="p-4 cursor-pointer hover:shadow-md transition relative" onClick={() => setEditWeek(w)}>
                  <div className="absolute top-3 right-3 flex gap-1 z-10">
                    <button onClick={(e) => { e.stopPropagation(); printWeek(w, config, weekTrainings(w), weekMatches(w)); }} className="p-1.5 rounded-lg hover:bg-slate-100" title="Imprimir / PDF">
                      <Printer size={14} style={{ color: T.muted }} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setEditWeek(w); }} className="p-1.5 rounded-lg hover:bg-slate-100" title="Editar">
                      <Edit3 size={14} style={{ color: T.muted }} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); if (confirm("¿Eliminar esta semana?")) removeWeek(w.id); }} className="p-1.5 rounded-lg hover:bg-red-50" title="Eliminar">
                      <Trash2 size={14} style={{ color: T.redLight }} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between flex-wrap gap-2 pr-24">
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

          {planTab === "mensual" && (
            <SimplePlanList title="Planificación mensual"
              items={seasonPlanning.mensual} titleField="mes" subtitleField="objetivo"
              blank={() => ({ id: uid(), mes: "", objetivo: "", eventosClave: "", cargaResumen: "" })}
              fields={[{ key: "mes", label: "Mes" }, { key: "objetivo", label: "Objetivo del mes", wide: true }, { key: "eventosClave", label: "Eventos clave", type: "textarea", wide: true }, { key: "cargaResumen", label: "Resumen de carga", type: "textarea", wide: true }]}
              onAdd={(it) => updateSeasonPlanning((p) => ({ ...p, mensual: [...p.mensual, it] }))}
              onSave={(it) => updateSeasonPlanning((p) => ({ ...p, mensual: p.mensual.map((x) => x.id === it.id ? it : x) }))}
              onRemove={(id) => updateSeasonPlanning((p) => ({ ...p, mensual: p.mensual.filter((x) => x.id !== id) }))} />
          )}

          {planTab === "macrociclo" && (
            <SimplePlanList title="Fase de la temporada"
              items={seasonPlanning.macrociclo} titleField="nombre" subtitleField="objetivo"
              blank={() => ({ id: uid(), nombre: "", fechaInicio: "", fechaFin: "", objetivo: "" })}
              fields={[{ key: "nombre", label: "Nombre de la fase (ej: Pretemporada, Ida, Vuelta, Play-offs)" }, { key: "fechaInicio", label: "Fecha de inicio", type: "date" }, { key: "fechaFin", label: "Fecha de fin", type: "date" }, { key: "objetivo", label: "Objetivo de esta fase", type: "textarea", wide: true }]}
              onAdd={(it) => updateSeasonPlanning((p) => ({ ...p, macrociclo: [...p.macrociclo, it] }))}
              onSave={(it) => updateSeasonPlanning((p) => ({ ...p, macrociclo: p.macrociclo.map((x) => x.id === it.id ? it : x) }))}
              onRemove={(id) => updateSeasonPlanning((p) => ({ ...p, macrociclo: p.macrociclo.filter((x) => x.id !== id) }))} />
          )}

          {planTab === "imprevisto" && (
            <SimplePlanList title="Partido no programado"
              items={seasonPlanning.partidoNoProgramado} titleField="rival" subtitleField="fecha"
              blank={() => ({ id: uid(), matchId: null, fecha: todayISO(), rival: "", objetivo: "", ajustesTacticos: "" })}
              fields={[{ key: "matchId", label: "Vincular partido ya registrado (opcional)", type: "matchRef" }, { key: "fecha", label: "Fecha", type: "date" }, { key: "rival", label: "Rival" }, { key: "objetivo", label: "Objetivo del partido", type: "textarea", wide: true }, { key: "ajustesTacticos", label: "Ajustes tácticos rápidos", type: "textarea", wide: true }]}
              onAdd={(it) => updateSeasonPlanning((p) => ({ ...p, partidoNoProgramado: [...p.partidoNoProgramado, it] }))}
              onSave={(it) => updateSeasonPlanning((p) => ({ ...p, partidoNoProgramado: p.partidoNoProgramado.map((x) => x.id === it.id ? it : x) }))}
              onRemove={(id) => updateSeasonPlanning((p) => ({ ...p, partidoNoProgramado: p.partidoNoProgramado.filter((x) => x.id !== id) }))}
              matches={matches} />
          )}

          {planTab === "torneo" && (
            <SimplePlanList title="Torneo rápido"
              items={seasonPlanning.torneoRapido} titleField="nombreTorneo" subtitleField="fechaInicio"
              blank={() => ({ id: uid(), nombreTorneo: "", fechaInicio: "", fechaFin: "", partidoIds: [], rotacion: "" })}
              fields={[{ key: "nombreTorneo", label: "Nombre del torneo" }, { key: "fechaInicio", label: "Fecha de inicio", type: "date" }, { key: "fechaFin", label: "Fecha de fin", type: "date" }, { key: "partidoIds", label: "Partidos del torneo (elegí de los ya registrados)", type: "matchMultiRef", wide: true }, { key: "rotacion", label: "Plan de rotación / manejo de la fatiga", type: "textarea", wide: true }]}
              onAdd={(it) => updateSeasonPlanning((p) => ({ ...p, torneoRapido: [...p.torneoRapido, it] }))}
              onSave={(it) => updateSeasonPlanning((p) => ({ ...p, torneoRapido: p.torneoRapido.map((x) => x.id === it.id ? it : x) }))}
              onRemove={(id) => updateSeasonPlanning((p) => ({ ...p, torneoRapido: p.torneoRapido.filter((x) => x.id !== id) }))}
              matches={matches} />
          )}

          {planTab === "areas" && <PlanificacionModule ctx={ctx} embedded />}
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

function PlanificacionModule({ ctx, embedded }) {
  const { planning, updatePlanning, config } = ctx;
  const [tab, setTab] = useState("fisica");
  const [modal, setModal] = useState(null); // {area, item|null}

  const areaLabels = { fisica: "Física", tecnica: "Técnica", tactica: "Táctica", psicologica: "Psicológica" };
  const areaIcons = { fisica: Zap, tecnica: Target, tactica: ClipboardList, psicologica: Brain };

  const addItem = (area, item) => updatePlanning((p) => ({ ...p, [area]: [...p[area], item] }));
  const saveItem = (area, item) => updatePlanning((p) => ({ ...p, [area]: p[area].map((x) => x.id === item.id ? item : x) }));
  const removeItem = (area, id) => updatePlanning((p) => ({ ...p, [area]: p[area].filter((x) => x.id !== id) }));

  return (
    <div className={embedded ? "flex flex-col gap-4" : "flex flex-col gap-5 max-w-4xl"}>
      {!embedded && (
        <div><Eyebrow>Planificación</Eyebrow><h1 className="text-2xl font-extrabold" style={{ color: T.navy }}>Física · Técnica · Táctica · Psicológica</h1>
          <p className="text-sm mt-1" style={{ color: T.muted }}>Herramienta de seguimiento y planificación deportiva del cuerpo técnico. No constituye ni sustituye un diagnóstico médico o psicológico.</p>
        </div>
      )}

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

function printPlayerReport(p, config) {
  const esc = (s) => (s || "").toString().replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c]));
  const kv = (label, value) => `<div class="kv"><span class="kvLabel">${esc(label)}</span><span class="kvValue">${esc(value) || "—"}</span></div>`;
  const stat = (label, value, color) => `<div class="statTile"><div class="statVal" style="color:${color};">${value ?? "-"}</div><div class="statLabel">${esc(label)}</div></div>`;
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${esc(p.nombre)}</title>
  <style>
    @page { size: A4; margin: 10mm; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    html, body { background: #E9EDF3; margin: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; color-adjust: exact; }
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
    body { font-family: -apple-system, Segoe UI, Roboto, Arial, sans-serif; color: #1B2733; padding: 14px; font-size: 11px; }
    .toolbar { position: sticky; top: 0; display: flex; justify-content: center; gap: 10px; padding: 8px 0 14px; z-index: 50; }
    .toolbar button { font-family: inherit; font-size: 13px; font-weight: 800; border: none; border-radius: 12px; padding: 10px 20px; cursor: pointer; box-shadow: 0 4px 14px rgba(0,0,0,0.18); }
    .btnPrint { background: #E63946; color: #fff; }
    .btnClose { background: #fff; color: #0B1F3A; border: 1.5px solid #CBD5E1 !important; }
    .sheet { max-width: 210mm; margin: 0 auto; background: #fff; border-radius: 14px; padding: 18px 22px 20px; box-shadow: 0 6px 24px rgba(11,31,58,0.15); }
    .header { display: flex; align-items: center; gap: 12px; border-bottom: 3px solid #0B1F3A; padding-bottom: 10px; margin-bottom: 12px; }
    .header img { width: 42px; height: 42px; object-fit: contain; border-radius: 10px; }
    .teamName { font-size: 13px; font-weight: 800; color: #0B1F3A; }
    .playerName { font-size: 20px; font-weight: 900; color: #E63946; text-align: right; }
    .playerMeta { font-size: 11px; color: #64748B; text-align: right; }
    .grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px 16px; margin-bottom: 12px; }
    .kv { display: flex; flex-direction: column; }
    .kvLabel { font-size: 9px; font-weight: 800; text-transform: uppercase; color: #94A3B8; }
    .kvValue { font-size: 12px; color: #1B2733; font-weight: 700; }
    .statsRow { display: flex; gap: 10px; margin-bottom: 14px; flex-wrap: wrap; }
    .statTile { flex: 1; min-width: 80px; text-align: center; background: #F5F7FA; border-radius: 10px; padding: 10px; }
    .statVal { font-size: 20px; font-weight: 900; }
    .statLabel { font-size: 9px; font-weight: 700; text-transform: uppercase; color: #64748B; margin-top: 2px; }
    .section { margin-top: 10px; }
    .sectionTitle { font-size: 10px; font-weight: 800; text-transform: uppercase; color: #fff; background: #0B1F3A; padding: 3px 10px; border-radius: 999px; display: inline-block; margin-bottom: 6px; }
    .block { background: #FAFBFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 8px 10px; font-size: 11px; line-height: 1.4; }
    .footer { margin-top: 14px; text-align: center; font-size: 8.5px; color: #94A3B8; border-top: 1px solid #E2E8F0; padding-top: 8px; }
    @media print {
      html, body { background: #fff; }
      .toolbar { display: none !important; }
      .sheet { box-shadow: none; border-radius: 0; padding: 0; max-width: 100%; }
      body { padding: 0; }
    }
  </style></head>
  <body>
    <div class="toolbar">
      <button class="btnPrint" onclick="window.print()">🖨️ Imprimir / Guardar PDF</button>
      <button class="btnClose" onclick="window.close()">Cerrar vista previa</button>
    </div>
    <div class="sheet">
      <div class="header">
        ${config.logo ? `<img src="${config.logo}" />` : ""}
        <div class="teamName" style="flex:1;">${esc(config.teamName || "Equipo")}</div>
        <div>
          <div class="playerName">${esc(p.nombre)}</div>
          <div class="playerMeta">${esc(p.posicion)} · Nº ${esc(p.numero)} · ${calcAge(p.dob) ?? "-"} años</div>
        </div>
      </div>

      <div class="grid3">
        ${kv("Apodo", p.apodo)}
        ${kv("Pie hábil", p.pie)}
        ${kv("Categoría", p.categoria)}
        ${kv("Altura", p.altura ? `${p.altura} cm` : "")}
        ${kv("Peso", p.peso ? `${p.peso} kg` : "")}
        ${kv("Estado", p.estado)}
      </div>

      <div class="statsRow">
        ${stat("Convocatorias", p.stats?.convocatorias, "#0B1F3A")}
        ${stat("Minutos", p.stats?.minutos, "#0B1F3A")}
        ${stat("Goles", p.stats?.goles, "#E63946")}
        ${stat("Asistencias", p.stats?.asistencias, "#2A9D5C")}
        ${stat("Amarillas", p.stats?.amarillas, "#F4B400")}
        ${stat("Rojas", p.stats?.rojas, "#E63946")}
      </div>

      ${p.observaciones ? `<div class="section"><div class="sectionTitle">Observaciones</div><div class="block">${esc(p.observaciones)}</div></div>` : ""}

      <div class="footer">Generado con PZ · Puntualización Zonal</div>
    </div>
  </body></html>`;
  const w = window.open("", "_blank");
  if (w) { w.document.open(); w.document.write(html); w.document.close(); }
}

function printSeasonReport(season, config) {
  const esc = (s) => (s || "").toString().replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c]));
  const block = (label, value, color) => value ? `<div class="section"><div class="sectionTitle" style="background:${color};">${esc(label)}</div><div class="block">${esc(value)}</div></div>` : "";
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Informe de temporada</title>
  <style>
    @page { size: A4; margin: 10mm; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    html, body { background: #E9EDF3; margin: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; color-adjust: exact; }
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
    body { font-family: -apple-system, Segoe UI, Roboto, Arial, sans-serif; color: #1B2733; padding: 14px; font-size: 11px; }
    .toolbar { position: sticky; top: 0; display: flex; justify-content: center; gap: 10px; padding: 8px 0 14px; z-index: 50; }
    .toolbar button { font-family: inherit; font-size: 13px; font-weight: 800; border: none; border-radius: 12px; padding: 10px 20px; cursor: pointer; box-shadow: 0 4px 14px rgba(0,0,0,0.18); }
    .btnPrint { background: #E63946; color: #fff; }
    .btnClose { background: #fff; color: #0B1F3A; border: 1.5px solid #CBD5E1 !important; }
    .sheet { max-width: 210mm; margin: 0 auto; background: #fff; border-radius: 14px; padding: 18px 22px 20px; box-shadow: 0 6px 24px rgba(11,31,58,0.15); }
    .header { display: flex; align-items: center; gap: 12px; border-bottom: 3px solid #0B1F3A; padding-bottom: 10px; margin-bottom: 12px; }
    .header img { width: 42px; height: 42px; object-fit: contain; border-radius: 10px; }
    .teamName { font-size: 14px; font-weight: 800; color: #0B1F3A; }
    .title { font-size: 16px; font-weight: 900; color: #E63946; text-align: right; }
    .meta { font-size: 10.5px; color: #64748B; text-align: right; }
    .section { margin-top: 10px; }
    .sectionTitle { font-size: 10px; font-weight: 800; text-transform: uppercase; color: #fff; padding: 3px 10px; border-radius: 999px; display: inline-block; margin-bottom: 6px; }
    .block { background: #FAFBFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 8px 10px; font-size: 11px; line-height: 1.4; }
    .footer { margin-top: 14px; text-align: center; font-size: 8.5px; color: #94A3B8; border-top: 1px solid #E2E8F0; padding-top: 8px; }
    @media print {
      html, body { background: #fff; }
      .toolbar { display: none !important; }
      .sheet { box-shadow: none; border-radius: 0; padding: 0; max-width: 100%; }
      body { padding: 0; }
    }
  </style></head>
  <body>
    <div class="toolbar">
      <button class="btnPrint" onclick="window.print()">🖨️ Imprimir / Guardar PDF</button>
      <button class="btnClose" onclick="window.close()">Cerrar vista previa</button>
    </div>
    <div class="sheet">
      <div class="header">
        ${config.logo ? `<img src="${config.logo}" />` : ""}
        <div class="teamName" style="flex:1;">${esc(config.teamName || "Equipo")}</div>
        <div>
          <div class="title">Informe de temporada</div>
          <div class="meta">${esc(season.competicion)} · ${esc(season.fechaInicio)} — ${esc(season.fechaFin)}</div>
        </div>
      </div>
      ${block("Objetivos generales", season.objetivosGenerales, "#0B1F3A")}
      ${block("Objetivos deportivos", season.objetivosDeportivos, "#E63946")}
      ${block("Objetivos formativos", season.objetivosFormativos, "#2A9D5C")}
      <div class="section"><div class="sectionTitle" style="background:#64748B;">Cuerpo técnico</div><div class="block">${(season.cuerpoTecnico || []).map((c) => `${esc(c.nombre)}${c.cargo ? ` (${esc(c.cargo)})` : ""}`).join(", ") || "—"}</div></div>
      <div class="section"><div class="sectionTitle" style="background:#0B1F3A;">Semanas planificadas</div><div class="block">${season.weeks?.length || 0} semanas registradas.</div></div>
      <div class="footer">Generado con PZ · Puntualización Zonal</div>
    </div>
  </body></html>`;
  const w = window.open("", "_blank");
  if (w) { w.document.open(); w.document.write(html); w.document.close(); }
}

function InformesModule({ ctx }) {
  const { matches, players, trainings, season, config } = ctx;
  const [tipo, setTipo] = useState("partido");
  const [entityId, setEntityId] = useState("");

  const tipos = [["partido", "Informe de partido"], ["jugador", "Informe de jugador"], ["entrenamiento", "Informe de entrenamiento"], ["temporada", "Informe de temporada"]];

  const entity = tipo === "partido" ? matches.find((m) => m.id === entityId)
    : tipo === "jugador" ? players.find((p) => p.id === entityId)
    : tipo === "entrenamiento" ? trainings.find((t) => t.id === entityId)
    : season;

  const doPrint = () => {
    if (tipo === "partido") printMatch(entity, config, players);
    else if (tipo === "entrenamiento") printTraining(entity, config, players);
    else if (tipo === "jugador") printPlayerReport(entity, config);
    else printSeasonReport(entity, config);
  };

  return (
    <div className="flex flex-col gap-5 max-w-3xl">
      <div><Eyebrow>Informes</Eyebrow><h1 className="text-2xl font-extrabold" style={{ color: T.navy }}>Generar informe</h1></div>

      <div className="flex gap-1.5 flex-wrap">
        {tipos.map(([k, l]) => (
          <button key={k} onClick={() => { setTipo(k); setEntityId(""); }} className="px-3 py-1.5 rounded-xl text-xs font-bold"
            style={{ background: tipo === k ? T.navy : "#fff", color: tipo === k ? "#fff" : T.muted, border: `1px solid ${tipo === k ? T.navy : T.line}` }}>{l}</button>
        ))}
      </div>

      {tipo !== "temporada" && (
        <div>
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
          <div><Btn variant="accent" icon={Printer} onClick={doPrint}>Vista previa / Imprimir / PDF</Btn></div>
          <Card className="p-6">
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
