/**
 * Capa de datos de HabiliT.
 * Por ahora los reportes viven en un arreglo de JavaScript (memoria + copia en localStorage).
 * Cuando exista el backend en Python, reemplazar el cuerpo de cada función de "api"
 * por llamadas fetch() a los endpoints (p. ej. GET/POST/PUT/DELETE /api/reportes).
 * Las firmas (async, mismos tipos) ya están listas para ese cambio.
 */
import { useSyncExternalStore } from "react";

export const CURSOS = ["Matemáticas", "Terapia Musical", "Terapia de Lenguaje", "Terapia Individual"] as const;
export type Curso = (typeof CURSOS)[number];

export const CRITERIOS = [
  { key: "agilidad", label: "Agilidad y precisión" },
  { key: "actitud", label: "Actitud" },
  { key: "participacion", label: "Participación" },
  { key: "concentracion", label: "Concentración" },
  { key: "instrucciones", label: "Seguimiento de instrucciones" },
] as const;
export type CriterioKey = (typeof CRITERIOS)[number]["key"];

export interface Reporte {
  id: string;
  alumno: string;
  edad: number;
  fecha: string; // YYYY-MM-DD
  correoEncargado: string;
  telefonoEncargado: string;
  carnet: string;
  tutor: string;
  cursos: Curso[];
  observaciones: string;
  comentarios: string;
  recomendaciones: string;
  criterios: Record<CriterioKey, number>;
  creadoPor: string;
  creadoEn: string;
}

export type ReporteInput = Omit<Reporte, "id" | "creadoEn" | "creadoPor">;

const STORAGE_KEY = "habilit_reportes";

// ---- Arreglo principal de reportes ----
let reportes: Reporte[] = [
  {
    id: "r-1",
    alumno: "Sofía Hernández López",
    edad: 9,
    fecha: "2026-09-15",
    correoEncargado: "carla.lopez@correo.com",
    telefonoEncargado: "5555-1234",
    carnet: "HB-2026-001",
    tutor: "Alma Orantes",
    cursos: ["Matemáticas", "Terapia de Lenguaje"],
    observaciones: "Muestra entusiasmo en actividades con material concreto.",
    comentarios: "Mejoró su lectura de números de dos cifras.",
    recomendaciones: "Practicar 10 minutos diarios con juegos de conteo en casa.",
    criterios: { agilidad: 70, actitud: 90, participacion: 80, concentracion: 60, instrucciones: 75 },
    creadoPor: "Alma Orantes",
    creadoEn: "2026-09-15T15:00:00Z",
  },
  {
    id: "r-2",
    alumno: "Sofía Hernández López",
    edad: 9,
    fecha: "2026-10-06",
    correoEncargado: "carla.lopez@correo.com",
    telefonoEncargado: "5555-1234",
    carnet: "HB-2026-001",
    tutor: "Alma Orantes",
    cursos: ["Matemáticas"],
    observaciones: "Se concentra más tiempo que en la sesión anterior.",
    comentarios: "Resolvió sumas con apoyo visual.",
    recomendaciones: "Continuar con apoyo visual y reforzar restas.",
    criterios: { agilidad: 78, actitud: 92, participacion: 85, concentracion: 72, instrucciones: 80 },
    creadoPor: "Alma Orantes",
    creadoEn: "2026-10-06T15:00:00Z",
  },
  {
    id: "r-3",
    alumno: "Diego Ramírez Castillo",
    edad: 12,
    fecha: "2026-10-02",
    correoEncargado: "jorge.ramirez@correo.com",
    telefonoEncargado: "5555-9876",
    carnet: "HB-2026-014",
    tutor: "Mario Díaz",
    cursos: ["Terapia Musical", "Terapia Individual"],
    observaciones: "Responde muy bien a ritmos y percusión.",
    comentarios: "Se integró al grupo sin dificultad.",
    recomendaciones: "Mantener rutina musical previa a tareas escolares.",
    criterios: { agilidad: 65, actitud: 85, participacion: 70, concentracion: 68, instrucciones: 72 },
    creadoPor: "Mario Díaz",
    creadoEn: "2026-10-02T15:00:00Z",
  },
];

const listeners = new Set<() => void>();
let hydrated = false;

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) reportes = JSON.parse(raw);
  } catch {
    /* ignorar */
  }
}

function commit(next: Reporte[]) {
  reportes = next;
  if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reportes));
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  hydrate();
  listeners.add(l);
  l();
  return () => listeners.delete(l);
}

const SERVER_SNAPSHOT: Reporte[] = [];
export function useReportes(): Reporte[] {
  return useSyncExternalStore(subscribe, () => reportes, () => SERVER_SNAPSHOT);
}

export function alumnosUnicos(lista: Reporte[]): string[] {
  return Array.from(new Set(lista.map((r) => r.alumno))).sort((a, b) => a.localeCompare(b, "es"));
}

export function reportesDe(lista: Reporte[], alumno: string) {
  return lista.filter((r) => r.alumno === alumno).sort((a, b) => b.fecha.localeCompare(a.fecha));
}

// ---- API (lista para reemplazarse por fetch al backend Python) ----
export const api = {
  async listar(): Promise<Reporte[]> {
    hydrate();
    return reportes;
  },
  async obtener(id: string): Promise<Reporte | undefined> {
    hydrate();
    return reportes.find((r) => r.id === id);
  },
  async crear(data: ReporteInput, usuario: string): Promise<Reporte> {
    hydrate();
    const nuevo: Reporte = {
      ...data,
      id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `r-${Date.now()}`,
      creadoPor: usuario,
      creadoEn: new Date().toISOString(),
    };
    commit([...reportes, nuevo]);
    return nuevo;
  },
  async actualizar(id: string, data: ReporteInput): Promise<Reporte | undefined> {
    hydrate();
    let actualizado: Reporte | undefined;
    commit(reportes.map((r) => (r.id === id ? (actualizado = { ...r, ...data }) : r)));
    return actualizado;
  },
  async eliminar(id: string): Promise<void> {
    hydrate();
    commit(reportes.filter((r) => r.id !== id));
  },
};

// ---- Autenticación (temporal, en el navegador) ----
const USUARIOS = [
  { usuario: "Mario Díaz", password: "HabiliT567" },
  { usuario: "Alma Orantes", password: "CentroHabilit891" },
];
const SESSION_KEY = "habilit_sesion";

const normalizar = (s: string) => s.trim().replace(/\s+/g, " ").toLocaleLowerCase("es");

export type LoginResultado = { ok: true; usuario: string } | { ok: false; error: "usuario" | "password" };

export function iniciarSesion(usuario: string, password: string): LoginResultado {
  const u = USUARIOS.find((x) => normalizar(x.usuario) === normalizar(usuario));
  if (!u) return { ok: false, error: "usuario" };
  if (u.password !== password) return { ok: false, error: "password" };
  window.sessionStorage.setItem(SESSION_KEY, u.usuario);
  return { ok: true, usuario: u.usuario };
}

export function usuarioActual(): string | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(SESSION_KEY);
}

export function cerrarSesion() {
  window.sessionStorage.removeItem(SESSION_KEY);
}

export function formatearFecha(f: string) {
  const [y = 2000, m = 1, d = 1] = f.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es-GT", { day: "2-digit", month: "long", year: "numeric" });
}
