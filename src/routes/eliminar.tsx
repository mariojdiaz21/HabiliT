import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell, Btn } from "@/components/habilit/AppShell";
import { StudentPicker } from "@/components/habilit/StudentPicker";
import { ReportView } from "@/components/habilit/ReportView";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { api, formatearFecha, reportesDe, useReportes, type Reporte } from "@/lib/reportes";

export const Route = createFileRoute("/eliminar")({
  head: () => ({
    meta: [
      { title: "Eliminar reportes — HabiliT" },
      { name: "description", content: "Elimine reportes de comportamiento de un alumno." },
      { property: "og:title", content: "Eliminar reportes — HabiliT" },
      { property: "og:description", content: "Gestión y eliminación de reportes." },
    ],
  }),
  component: Eliminar,
});

function Eliminar() {
  const reportes = useReportes();
  const [alumno, setAlumno] = useState<string | null>(null);
  const [borrar, setBorrar] = useState<Reporte | null>(null);
  const lista = alumno ? reportesDe(reportes, alumno) : [];

  return (
    <AppShell title="Eliminar reporte" subtitle="Seleccione el alumno y el reporte a eliminar" accent="bg-coral">
      <StudentPicker onSelect={setAlumno} />
      {alumno && (
        <div className="mt-6 space-y-6">
          {lista.length === 0 && <p className="text-muted-foreground">Este alumno ya no tiene reportes.</p>}
          {lista.map((r) => (
            <ReportView
              key={r.id}
              r={r}
              actions={
                <Btn variant="coral" onClick={() => setBorrar(r)}>
                  <Trash2 className="h-4 w-4" /> Eliminar
                </Btn>
              }
            />
          ))}
        </div>
      )}

      <AlertDialog open={!!borrar} onOpenChange={(o) => !o && setBorrar(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este reporte?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará el reporte de <strong>{borrar?.alumno}</strong> del {borrar && formatearFecha(borrar.fecha)}. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-coral text-primary-foreground hover:bg-coral/90"
              onClick={async () => {
                if (!borrar) return;
                await api.eliminar(borrar.id);
                toast.success("Reporte eliminado.");
                setBorrar(null);
              }}
            >
              Sí, eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}
