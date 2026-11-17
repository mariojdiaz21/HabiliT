import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { alumnosUnicos, useReportes } from "@/lib/reportes";
import { Btn, Card } from "./AppShell";

export function StudentPicker({
  onSelect,
  label = "Seleccionar",
}: {
  onSelect: (alumno: string) => void;
  label?: string;
}) {
  const reportes = useReportes();

  const [institucion, setInstitucion] = useState("");
  const [valor, setValor] = useState("");
  const [error, setError] = useState(false);

  // Extrae instituciones únicas usando el mismo ordenamiento en español de reportes.ts
  const instituciones = useMemo(() => {
    const unicas = new Set<string>();
    reportes.forEach((r) => {
      const nombre = r.institucion?.trim();
      if (nombre) unicas.add(nombre);
    });
    return Array.from(unicas).sort((a, b) => a.localeCompare(b, "es"));
  }, [reportes]);

  // Filtra los reportes por la institución elegida y reutiliza alumnosUnicos()
  const alumnos = useMemo(() => {
    if (!institucion) return [];
    const reportesPorInstitucion = reportes.filter(
      (r) => r.institucion?.trim() === institucion
    );
    return alumnosUnicos(reportesPorInstitucion);
  }, [reportes, institucion]);

  const handleInstitucionChange = (nuevaInstitucion: string) => {
    setInstitucion(nuevaInstitucion);
    setValor("");
    setError(false);
  };

  return (
    <Card>
      <form
        className="flex flex-col gap-3 sm:flex-row sm:items-end"
        onSubmit={(e) => {
          e.preventDefault();
          if (!institucion || !valor) return setError(true);
          setError(false);
          onSelect(valor);
        }}
      >
        {/* Filtro 1: Institución Educativa */}
        <label className="flex-1">
          <span className="mb-1 block text-sm font-bold text-petrol">
            Institución Educativa
          </span>
          <select
            value={institucion}
            onChange={(e) => handleInstitucionChange(e.target.value)}
            className={`w-full rounded-xl border bg-card px-3 py-2.5 outline-none focus:ring-2 focus:ring-ring ${
              error && !institucion ? "border-coral" : "border-input"
            }`}
          >
            <option value="">— Elija una institución —</option>
            {instituciones.map((inst) => (
              <option key={inst} value={inst}>
                {inst}
              </option>
            ))}
          </select>
        </label>

        {/* Filtro 2: Nombre del alumno */}
        <label className="flex-1">
          <span className="mb-1 block text-sm font-bold text-petrol">
            Nombre del alumno
          </span>
          <select
            value={valor}
            disabled={!institucion}
            onChange={(e) => {
              setValor(e.target.value);
              setError(false);
            }}
            className={`w-full rounded-xl border bg-card px-3 py-2.5 outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${
              error && institucion && !valor ? "border-coral" : "border-input"
            }`}
          >
            <option value="">
              {institucion
                ? "— Elija un alumno —"
                : "— Seleccione primero una institución —"}
            </option>
            {alumnos.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </label>

        <Btn type="submit">
          <Search className="h-4 w-4" /> {label}
        </Btn>
      </form>

      {/* Mensajes de validación y estado vacío */}
      <div className="mt-1.5 flex flex-col gap-1">
        {error && !institucion && (
          <span className="text-sm text-coral">
            Seleccione una institución educativa para continuar.
          </span>
        )}
        {error && institucion && !valor && (
          <span className="text-sm text-coral">
            Seleccione un alumno para continuar.
          </span>
        )}
        {reportes.length === 0 && (
          <span className="text-sm text-muted-foreground">
            Aún no hay alumnos registrados.
          </span>
        )}
        {institucion && alumnos.length === 0 && (
          <span className="text-sm text-muted-foreground">
            No hay alumnos registrados en esta institución.
          </span>
        )}
      </div>
    </Card>
  );
}
