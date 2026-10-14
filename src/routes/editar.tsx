import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PencilLine } from "lucide-react";
import { toast } from "sonner";
import { AppShell, Btn, Card } from "@/components/habilit/AppShell";
import { StudentPicker } from "@/components/habilit/StudentPicker";
import { ReportForm } from "@/components/habilit/ReportForm";
import { api, formatearFecha, reportesDe, useReportes, type Reporte } from "@/lib/reportes";

export const Route = createFileRoute("/editar")({
  head: () => ({
    meta: [
      { title: "Editar reporte — HabiliT" },
      { name: "description", content: "Edite la información de un reporte de comportamiento existente." },
      { property: "og:title", content: "Editar reporte — HabiliT" },
      { property: "og:description", content: "Edición de reportes de comportamiento." },
    ],
  }),
  component: Editar,
});

function Editar() {
  const reportes = useReportes();
  const [alumno, setAlumno] = useState<string | null>(null);
  const [editando, setEditando] = useState<Reporte | null>(null);
  const lista = alumno ? reportesDe(reportes, alumno) : [];

  if (editando) {
    const { id, creadoEn, creadoPor, ...datos } = editando;
    return (
      <AppShell title="Editar reporte" subtitle={`${editando.alumno} · ${formatearFecha(editando.fecha)}`} accent="bg-gold">
        <ReportForm
          key={id}
          initial={datos}
          submitLabel="Guardar cambios"
          onExit={() => setEditando(null)}
          onSubmit={async (data) => {
            await api.actualizar(id, data);
            toast.success("Reporte actualizado.");
            setAlumno(data.alumno);
            setEditando(null);
          }}
        />
      </AppShell>
    );
  }

  return (
    <AppShell title="Editar reporte" subtitle="Seleccione el alumno y luego el reporte" accent="bg-gold">
      <StudentPicker onSelect={setAlumno} />
      {alumno && (
        <Card className="mt-6">
          <h2 className="mb-4 font-bold text-petrol">Reportes de {alumno}</h2>
          <ul className="divide-y">
            {lista.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <p className="font-semibold">{formatearFecha(r.fecha)}</p>
                  <p className="text-sm text-muted-foreground">
                    Tutor: {r.tutor} · {r.cursos.join(", ")}
                  </p>
                </div>
                <Btn variant="gold" onClick={() => setEditando(r)}>
                  <PencilLine className="h-4 w-4" /> Editar
                </Btn>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </AppShell>
  );
}
