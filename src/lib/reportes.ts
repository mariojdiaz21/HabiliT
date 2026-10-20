/**
 * Capa de datos de HabiliT conectada al Backend de FastAPI y MongoDB Atlas.
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

const API_URL = "http://localhost:8000/api";
//limpieza del buffer memoria caché
let reportesCache: Reporte[] = [];
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((l) => l());
}

async function sincronizarReportes() {
  try {
    const res = await fetch(`${API_URL}/reportes`);
    if (res.ok) {
      reportesCache = await res.json();
      notifyListeners();
    }
  } catch (error) {
    console.error("Error al sincronizar reportes con el backend:", error);
  }
}

function subscribe(l: () => void) {
  listeners.add(l);
  sincronizarReportes(); // Carga inicial al suscribirse
  return () => {
    listeners.delete(l);
  };
}

const SERVER_SNAPSHOT: Reporte[] = [];
export function useReportes(): Reporte[] {
  return useSyncExternalStore(subscribe, () => reportesCache, () => SERVER_SNAPSHOT);
}

export function alumnosUnicos(lista: Reporte[]): string[] {
  return Array.from(new Set(lista.map((r) => r.alumno))).sort((a, b) => a.localeCompare(b, "es"));
}

export function reportesDe(lista: Reporte[], alumno: string) {
  return lista.filter((r) => r.alumno === alumno).sort((a, b) => b.fecha.localeCompare(a.fecha));
}

// ---- API conectada a FastAPI y MongoDB Atlas ----
export const api = {
  async listar(): Promise<Reporte[]> {
    await sincronizarReportes();
    return reportesCache;
  },
  
  async obtener(id: string): Promise<Reporte | undefined> {
    await sincronizarReportes();
    return reportesCache.find((r) => r.id === id);
  },
  
  async crear(data: ReporteInput, usuario: string): Promise<Reporte> {
    const payload = { ...data, creadoPor: usuario };
    const res = await fetch(`${API_URL}/reportes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    
    if (!res.ok) throw new Error("Error al crear el reporte en el servidor");
    const nuevoReporte: Reporte = await res.json();
    await sincronizarReportes();
    return nuevoReporte;
  },
  
  async actualizar(id: string, data: ReporteInput): Promise<Reporte | undefined> {
    const res = await fetch(`${API_URL}/reportes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    
    if (!res.ok) throw new Error("Error al actualizar el reporte en el servidor");
    const reporteActualizado: Reporte = await res.json();
    await sincronizarReportes();
    return reporteActualizado;
  },
  
  async eliminar(id: string): Promise<void> {
    const res = await fetch(`${API_URL}/reportes/${id}`, {
      method: "DELETE",
    });
    
    if (!res.ok) throw new Error("Error al eliminar el reporte en el servidor");
    await sincronizarReportes();
  },
};

// ---- Autenticación conectada al Backend de FastAPI ----
const SESSION_KEY = "habilit_sesion";

export type LoginResultado = { ok: true; usuario: string } | { ok: false; error: "usuario" | "password" };

export async function iniciarSesion(usuario: string, password: string): Promise<LoginResultado> {
  try {
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuario, password }),
    });
    
    if (!res.ok) return { ok: false, error: "usuario" };
    const data = await res.json();
    
    if (!data.ok) {
      return { ok: false, error: data.error };
    }
    
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(SESSION_KEY, data.usuario);
    }
    return { ok: true, usuario: data.usuario };
  } catch (error) {
    console.error("Error en la conexión de inicio de sesión:", error);
    return { ok: false, error: "usuario" };
  }
}

export function usuarioActual(): string | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(SESSION_KEY);
}

export function cerrarSesion() {
  if (typeof window !== "undefined") {
    window.sessionStorage.removeItem(SESSION_KEY);
  }
}

export function formatearFecha(f: string) {
  const [y = 2000, m = 1, d = 1] = f.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es-GT", { day: "2-digit", month: "long", year: "numeric" });
}