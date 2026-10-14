import type { ReactNode } from "react";
import { CalendarDays, Mail, Phone, IdCard, UserRound } from "lucide-react";
import { formatearFecha, type Reporte } from "@/lib/reportes";
import { CriteriosCharts } from "./ReportCharts";

export function ReportView({ r, actions }: { r: Reporte; actions?: ReactNode }) {
  return (
    <article className="overflow-hidden rounded-2xl border bg-card shadow-soft fade-up">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-mist px-5 py-3">
        <div className="flex items-center gap-2 font-display font-bold text-petrol">
          <CalendarDays className="h-5 w-5 text-sky" /> Reporte del {formatearFecha(r.fecha)}
        </div>
        <div className="flex flex-wrap gap-2">{actions}</div>
      </div>
      <div className="space-y-5 p-5">
        <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
          <Info icon={<UserRound className="h-4 w-4" />} label="Alumno" value={`${r.alumno} (${r.edad} años)`} />
          <Info icon={<IdCard className="h-4 w-4" />} label="Carnet" value={r.carnet} />
          <Info icon={<UserRound className="h-4 w-4" />} label="Tutor" value={r.tutor} />
          <Info icon={<Mail className="h-4 w-4" />} label="Correo del encargado" value={r.correoEncargado} />
          <Info icon={<Phone className="h-4 w-4" />} label="Teléfono del encargado" value={r.telefonoEncargado} />
          <div>
            <p className="text-xs font-bold uppercase text-muted-foreground">Cursos</p>
            <div className="mt-1 flex flex-wrap gap-1">
              {r.cursos.map((c) => (
                <span key={c} className="rounded-full bg-soft-green px-2.5 py-0.5 text-xs font-semibold text-petrol">
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <Nota titulo="Observaciones" texto={r.observaciones} color="border-sky" />
          <Nota titulo="Comentarios" texto={r.comentarios} color="border-gold" />
          <Nota titulo="Recomendaciones" texto={r.recomendaciones} color="border-lime" />
        </div>
        <CriteriosCharts criterios={r.criterios} />
      </div>
    </article>
  );
}

function Info({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase text-muted-foreground">{label}</p>
      <p className="mt-0.5 flex items-center gap-1.5 font-semibold">
        <span className="text-sky">{icon}</span>
        {value}
      </p>
    </div>
  );
}

function Nota({ titulo, texto, color }: { titulo: string; texto: string; color: string }) {
  return (
    <div className={`rounded-xl border-l-4 bg-smoke p-3 ${color}`}>
      <p className="text-xs font-bold uppercase text-petrol">{titulo}</p>
      <p className="mt-1 whitespace-pre-line text-sm">{texto || "—"}</p>
    </div>
  );
}
