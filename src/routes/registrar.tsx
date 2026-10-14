import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppShell } from "@/components/habilit/AppShell";
import { ReportForm, vacio } from "@/components/habilit/ReportForm";
import { api, usuarioActual } from "@/lib/reportes";

export const Route = createFileRoute("/registrar")({
  head: () => ({
    meta: [
      { title: "Registrar reporte — HabiliT" },
      { name: "description", content: "Registre un nuevo reporte de comportamiento de un alumno." },
      { property: "og:title", content: "Registrar reporte — HabiliT" },
      { property: "og:description", content: "Formulario de registro de reportes de comportamiento." },
    ],
  }),
  component: Registrar,
});

function Registrar() {
  const navigate = useNavigate();
  return (
    <AppShell title="Registrar reporte" subtitle="Complete la información del alumno" accent="bg-sky">
      <ReportForm
        initial={vacio()}
        resetOnSave
        onExit={() => navigate({ to: "/panel" })}
        onSubmit={async (data) => {
          await api.crear(data, usuarioActual() ?? "");
          toast.success(`Reporte de ${data.alumno} guardado correctamente.`);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />
    </AppShell>
  );
}
