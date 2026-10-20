import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Printer } from "lucide-react";
import { AppShell, Btn } from "@/components/habilit/AppShell";
import { StudentPicker } from "@/components/habilit/StudentPicker";
import { ReportView } from "@/components/habilit/ReportView";
import { reportesDe, useReportes } from "@/lib/reportes";

export const Route = createFileRoute("/consultar")({
  head: () => ({
    meta: [
      { title: "Consultar reportes — HabiliT" },
      { name: "description", content: "Consulte los reportes y gráficas de comportamiento de un alumno." },
    ],
  }),
  component: Consultar,
});

function Consultar() {
  const reportes = useReportes();
  const [alumno, setAlumno] = useState<string | null>(null);
  const lista = alumno ? reportesDe(reportes, alumno) : [];

  const imprimir = () => {
    window.print();
  };

  return (
    <AppShell title="Consultar reporte" subtitle="Filtre por nombre del alumno" accent="bg-lime">
      <div className="no-print">
        <StudentPicker onSelect={setAlumno} />
      </div>

      {alumno && (
        <div className="mt-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 no-print">
            <h2 className="text-xl font-bold text-petrol">
              {alumno} · {lista.length} reporte{lista.length !== 1 && "s"}
            </h2>
            <Btn variant="gold" onClick={imprimir}>
              <Printer className="h-4 w-4" /> Imprimir reporte
            </Btn>
          </div>

          <div className="print-report-area space-y-3">
            <div className="hidden print:block pb-2 mb-2 border-b">
              <h1 className="text-lg font-bold text-petrol">{alumno}</h1>
              <p className="text-xs text-muted-foreground">
                Centro de Tutorías HABILIT · Expediente de Seguimiento Conductual y Pedagógico
              </p>
            </div>

            {lista.map((r) => (
              <ReportView key={r.id} r={r} />
            ))}
          </div>
        </div>
      )}
    </AppShell>
  );
}