import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FilePlus2, Search, Trash2, PencilLine, Users, FileText } from "lucide-react";
import { AppShell } from "@/components/habilit/AppShell";
import { alumnosUnicos, useReportes } from "@/lib/reportes";

export const Route = createFileRoute("/panel")({
  head: () => ({
    meta: [
      { title: "Panel principal — HabiliT" },
      { name: "description", content: "Elija una acción: registrar, consultar, editar o eliminar reportes." },
      { property: "og:title", content: "Panel principal — HabiliT" },
      { property: "og:description", content: "Gestión de reportes de comportamiento de alumnos." },
    ],
  }),
  component: Panel,
});

const ACCIONES = [
  { to: "/registrar", titulo: "Registrar reporte", desc: "Cree un nuevo reporte con datos, cursos y gráficas.", icon: FilePlus2, bg: "bg-sky" },
  { to: "/consultar", titulo: "Consultar reporte", desc: "Vea el historial y la evolución de un alumno.", icon: Search, bg: "bg-lime" },
  { to: "/editar", titulo: "Editar reporte", desc: "Corrija o actualice un reporte existente.", icon: PencilLine, bg: "bg-gold" },
  { to: "/eliminar", titulo: "Eliminar reporte", desc: "Quite reportes que ya no sean necesarios.", icon: Trash2, bg: "bg-coral" },
] as const;

function Panel() {
  const navigate = useNavigate();
  const [verificado, setVerificado] = useState(false);

  // Validamos la sesión local al montar el componente
  useEffect(() => {
    const usuarioLogueado = localStorage.getItem("usuario") || localStorage.getItem("user");
    if (!usuarioLogueado) {
      navigate({ to: "/" });
    } else {
      setVerificado(true);
    }
  }, [navigate]);

  // Manejo seguro de reportes por si la API aún no responde
  let reportesList = [];
  try {
    const rawReportes = useReportes();
    if (Array.isArray(rawReportes)) {
      reportesList = rawReportes;
    }
  } catch (e) {
    console.warn("No se pudieron cargar los reportes locales/remotos:", e);
  }

  const alumnos = alumnosUnicos(reportesList).length;

  if (!verificado) {
    return null;
  }

  return (
    <AppShell title="Panel principal" subtitle="¿Qué desea hacer hoy?" back={false}>
      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <Stat icon={<Users className="h-6 w-6" />} label="Alumnos registrados" value={alumnos} bg="bg-cream" />
        <Stat icon={<FileText className="h-6 w-6" />} label="Reportes totales" value={reportesList.length} bg="bg-soft-green" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        {ACCIONES.map((a, i) => (
          <Link
            key={a.to}
            to={a.to}
            style={{ animationDelay: `${i * 70}ms` }}
            className="group fade-up flex items-center gap-5 rounded-2xl border bg-card p-6 shadow-soft transition hover:-translate-y-1 hover:border-sky"
          >
            <span className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${a.bg} text-primary-foreground transition group-hover:rotate-6 group-hover:scale-110`}>
              <a.icon className="h-8 w-8" />
            </span>
            <span>
              <span className="block font-display text-xl font-bold text-petrol">{a.titulo}</span>
              <span className="text-sm text-muted-foreground">{a.desc}</span>
            </span>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}

function Stat({ icon, label, value, bg }: { icon: React.ReactNode; label: string; value: number; bg: string }) {
  return (
    <div className={`flex items-center gap-4 rounded-2xl p-5 ${bg}`}>
      <span className="text-petrol">{icon}</span>
      <div>
        <p className="font-display text-3xl font-extrabold text-petrol">{value}</p>
        <p className="text-sm">{label}</p>
      </div>
    </div>
  );
}
