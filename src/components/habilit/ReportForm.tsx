import { useState, type ReactNode } from "react";
import { z } from "zod";
import { Printer, Save, LogOut, Check } from "lucide-react";
import { toast } from "sonner";
import { CRITERIOS, CURSOS, type CriterioKey, type Curso, type ReporteInput } from "@/lib/reportes";
import { Btn, Card } from "./AppShell";
import { CriteriosCharts } from "./ReportCharts";

const hoy = () => new Date().toISOString().slice(0, 10);

export const vacio = (): ReporteInput => ({
  alumno: "",
  edad: 0,
  fecha: hoy(),
  correoEncargado: "",
  telefonoEncargado: "",
  carnet: "",
  tutor: "",
  cursos: [],
  observaciones: "",
  comentarios: "",
  recomendaciones: "",
  criterios: { agilidad: 50, actitud: 50, participacion: 50, concentracion: 50, instrucciones: 50 },
});

const pct = z.number().min(0, "Mínimo 0%").max(100, "Máximo 100%");
const schema = z.object({
  alumno: z.string().trim().min(3, "Ingrese el nombre completo").max(120),
  edad: z.number({ invalid_type_error: "Ingrese la edad" }).int("Edad inválida").min(2, "Edad mínima 2").max(99, "Edad inválida"),
  fecha: z.string().min(1, "Seleccione la fecha"),
  correoEncargado: z.string().trim().email("Correo electrónico inválido").max(255),
  telefonoEncargado: z
    .string()
    .trim()
    .regex(/^[+]?[\d\s-]{8,15}$/, "Teléfono inválido (8 a 15 dígitos)"),
  carnet: z.string().trim().min(2, "Ingrese el carnet").max(30),
  tutor: z.string().trim().min(3, "Ingrese el nombre del tutor").max(120),
  cursos: z.array(z.string()).min(1, "Seleccione al menos un curso"),
  observaciones: z.string().max(2000),
  comentarios: z.string().max(2000),
  recomendaciones: z.string().max(2000),
  criterios: z.object({ agilidad: pct, actitud: pct, participacion: pct, concentracion: pct, instrucciones: pct }),
});

type Errores = { [K in "alumno"|"edad"|"fecha"|"correoEncargado"|"telefonoEncargado"|"carnet"|"tutor"|"cursos"|"observaciones"|"comentarios"|"recomendaciones"|"criterios"]?: string | undefined };

export function ReportForm({
  initial,
  onSubmit,
  onExit,
  submitLabel = "Guardar reporte",
  resetOnSave = false,
}: {
  initial: ReporteInput;
  onSubmit: (data: ReporteInput) => Promise<void>;
  onExit: () => void;
  submitLabel?: string;
  resetOnSave?: boolean;
}) {
  const [f, setF] = useState<ReporteInput>(initial);
  const [errores, setErrores] = useState<Errores>({});
  const [guardando, setGuardando] = useState(false);

  const set = <K extends keyof ReporteInput>(k: K, v: ReporteInput[K]) => {
    setF((p) => ({ ...p, [k]: v }));
    setErrores((e) => ({ ...e, [k]: undefined }));
  };
  const setCrit = (k: CriterioKey, v: number) => {
    const n = Math.max(0, Math.min(100, Number.isNaN(v) ? 0 : v));
    setF((p) => ({ ...p, criterios: { ...p.criterios, [k]: n } }));
  };
  const toggleCurso = (c: Curso) =>
    set("cursos", f.cursos.includes(c) ? f.cursos.filter((x) => x !== c) : [...f.cursos, c]);

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = schema.safeParse(f);
    if (!res.success) {
      const errs: Errores = {};
      res.error.issues.forEach((i) => { const k = String(i.path[0]) as keyof Errores; errs[k] ??= i.message; });
      setErrores(errs);
      toast.error("Revise los campos marcados en rojo.");
      return;
    }
    setGuardando(true);
    await onSubmit({ ...f, alumno: f.alumno.trim().replace(/\s+/g, " ") });
    setGuardando(false);
    if (resetOnSave) setF(vacio());
  };

  return (
    <form onSubmit={enviar} className="space-y-6" noValidate>
      <Card>
        <Titulo n={1} color="bg-sky">Datos del alumno</Titulo>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Campo label="Nombre completo del alumno" error={errores.alumno} className="sm:col-span-2">
            <input className={inp(errores.alumno)} value={f.alumno} onChange={(e) => set("alumno", e.target.value)} placeholder="Ej. Sofía Hernández López" />
          </Campo>
          <Campo label="Edad" error={errores.edad}>
            <input type="number" min={2} max={99} className={inp(errores.edad)} value={f.edad || ""} onChange={(e) => set("edad", e.target.valueAsNumber)} />
          </Campo>
          <Campo label="Fecha" error={errores.fecha}>
            <input type="date" className={inp(errores.fecha)} value={f.fecha} onChange={(e) => set("fecha", e.target.value)} />
          </Campo>
          <Campo label="Carnet" error={errores.carnet}>
            <input className={inp(errores.carnet)} value={f.carnet} onChange={(e) => set("carnet", e.target.value)} placeholder="HB-2026-001" />
          </Campo>
          <Campo label="Nombre del tutor" error={errores.tutor}>
            <input className={inp(errores.tutor)} value={f.tutor} onChange={(e) => set("tutor", e.target.value)} />
          </Campo>
          <Campo label="Correo electrónico del encargado" error={errores.correoEncargado}>
            <input type="email" className={inp(errores.correoEncargado)} value={f.correoEncargado} onChange={(e) => set("correoEncargado", e.target.value)} placeholder="encargado@correo.com" />
          </Campo>
          <Campo label="Teléfono del encargado" error={errores.telefonoEncargado}>
            <input type="tel" className={inp(errores.telefonoEncargado)} value={f.telefonoEncargado} onChange={(e) => set("telefonoEncargado", e.target.value)} placeholder="5555-1234" />
          </Campo>
        </div>
      </Card>

      <Card>
        <Titulo n={2} color="bg-lime">Cursos a asignar</Titulo>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {CURSOS.map((c) => {
            const on = f.cursos.includes(c);
            return (
              <button
                type="button"
                key={c}
                onClick={() => toggleCurso(c)}
                aria-pressed={on}
                className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left font-semibold transition ${on ? "border-lime bg-soft-green text-petrol" : "border-input bg-card hover:border-sky"}`}
              >
                <span className={`flex h-5 w-5 items-center justify-center rounded-md border-2 ${on ? "border-lime bg-lime text-graphite" : "border-input"}`}>
                  {on && <Check className="h-3.5 w-3.5" />}
                </span>
                {c}
              </button>
            );
          })}
        </div>
        {errores.cursos && <p className="mt-2 text-sm text-coral">{errores.cursos}</p>}
      </Card>

      <Card>
        <Titulo n={3} color="bg-gold">Observaciones del tutor</Titulo>
        <div className="grid gap-4 md:grid-cols-3">
          {(["observaciones", "comentarios", "recomendaciones"] as const).map((k) => (
            <Campo key={k} label={k.charAt(0).toUpperCase() + k.slice(1)} error={errores[k]}>
              <textarea rows={5} maxLength={2000} className={inp(errores[k])} value={f[k]} onChange={(e) => set(k, e.target.value)} />
            </Campo>
          ))}
        </div>
      </Card>

      <Card>
        <Titulo n={4} color="bg-coral">Evaluación de comportamiento (%)</Titulo>
        <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {CRITERIOS.map((c) => (
            <div key={c.key} className="rounded-xl bg-smoke p-3">
              <p className="text-sm font-bold text-petrol">{c.label}</p>
              <div className="mt-2 flex items-center gap-2">
                <input type="range" min={0} max={100} value={f.criterios[c.key]} onChange={(e) => setCrit(c.key, e.target.valueAsNumber)} className="w-full accent-sky" />
                <div className="flex items-center">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={f.criterios[c.key]}
                    onChange={(e) => setCrit(c.key, e.target.valueAsNumber)}
                    className="w-14 rounded-lg border border-input bg-card px-1.5 py-1 text-right text-sm"
                  />
                  <span className="ml-0.5 text-sm">%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="mb-3 text-sm text-muted-foreground">Las gráficas se actualizan en vivo y quedan guardadas con el reporte de esta fecha.</p>
        <CriteriosCharts criterios={f.criterios} />
      </Card>

      <div className="sticky bottom-3 z-10 flex flex-wrap justify-end gap-3 rounded-2xl border bg-card/95 p-3 shadow-soft backdrop-blur">
        <Btn type="button" variant="outline" onClick={onExit}>
          <LogOut className="h-4 w-4" /> Salir
        </Btn>
        <Btn type="button" variant="gold" onClick={() => toast.info("La impresión en PDF estará disponible próximamente.")}>
          <Printer className="h-4 w-4" /> Imprimir reporte
        </Btn>
        <Btn type="submit" disabled={guardando}>
          <Save className="h-4 w-4" /> {submitLabel}
        </Btn>
      </div>
    </form>
  );
}

const inp = (err?: string | undefined) =>
  `w-full rounded-xl border bg-card px-3 py-2.5 outline-none transition focus:ring-2 focus:ring-ring ${err ? "border-coral" : "border-input"}`;

function Campo({ label, error, children, className = "" }: { label: string; error?: string | undefined; children: ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-sm font-bold text-petrol">{label}</span>
      {children}
      {error && <span className="mt-1 block text-sm text-coral">{error}</span>}
    </label>
  );
}

function Titulo({ n, color, children }: { n: number; color: string; children: ReactNode }) {
  return (
    <h2 className="mb-4 flex items-center gap-3 text-lg font-bold text-petrol">
      <span className={`flex h-8 w-8 items-center justify-center rounded-full text-sm text-primary-foreground ${color}`}>{n}</span>
      {children}
    </h2>
  );
}
