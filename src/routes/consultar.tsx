import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Printer } from "lucide-react";
import { toast } from "sonner";
import { AppShell, Btn, Card } from "@/components/habilit/AppShell";
import { StudentPicker } from "@/components/habilit/StudentPicker";
import { ReportView } from "@/components/habilit/ReportView";
import { EvolucionChart } from "@/components/habilit/ReportCharts";
import { reportesDe, useReportes } from "@/lib/reportes";

export const Route = createFileRoute("/consultar")({
  head: () => ({
    meta: [
      { title: "Consultar reportes — HabiliT" },
      { name: "description", content: "Consulte los reportes y gráficas de comportamiento de un alumno." },
      { property: "og:title", content: "Consultar reportes — HabiliT" },
      { property: "og:description", content: "Historial de reportes por alumno." },
    ],
  }),
  component: Consultar,
});

const imprimir = () => toast.info("La impresión en PDF estará disponible próximamente.");

function Consultar() {
  const reportes = useReportes();
  const [alumno, setAlumno] = useState<string | null>(null);
  const lista = alumno ? reportesDe(reportes, alumno) : [];

  return (
    <AppShell title="Consultar reporte" subtitle="Filtre por nombre del alumno" accent="bg-lime">
      <StudentPicker onSelect={setAlumno} />
      {alumno && (
        <div className="mt-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-petrol">
              {alumno} · {lista.length} reporte{lista.length !== 1 && "s"}
            </h2>
            <Btn variant="gold" onClick={imprimir}>
              <Printer className="h-4 w-4" /> Imprimir reporte
            </Btn>
          </div>
          {lista.length > 1 && (
            <Card>
              <h3 className="mb-3 font-bold text-petrol">Evolución del comportamiento</h3>
              <EvolucionChart reportes={lista} />
            </Card>
          )}
          {lista.map((r) => (
            <ReportView key={r.id} r={r} />
          ))}
        </div>
      )}
    </AppShell>
  );
}
