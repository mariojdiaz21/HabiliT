import { useState } from "react";
import { Search } from "lucide-react";
import { alumnosUnicos, useReportes } from "@/lib/reportes";
import { Btn, Card } from "./AppShell";

export function StudentPicker({ onSelect, label = "Seleccionar" }: { onSelect: (alumno: string) => void; label?: string }) {
  const reportes = useReportes();
  const alumnos = alumnosUnicos(reportes);
  const [valor, setValor] = useState("");
  const [error, setError] = useState(false);

  return (
    <Card>
      <form
        className="flex flex-col gap-3 sm:flex-row sm:items-end"
        onSubmit={(e) => {
          e.preventDefault();
          if (!valor) return setError(true);
          setError(false);
          onSelect(valor);
        }}
      >
        <label className="flex-1">
          <span className="mb-1 block text-sm font-bold text-petrol">Nombre del alumno</span>
          <select
            value={valor}
            onChange={(e) => {
              setValor(e.target.value);
              setError(false);
            }}
            className={`w-full rounded-xl border bg-card px-3 py-2.5 outline-none focus:ring-2 focus:ring-ring ${error ? "border-coral" : "border-input"}`}
          >
            <option value="">— Elija un alumno —</option>
            {alumnos.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
          {error && <span className="mt-1 block text-sm text-coral">Seleccione un alumno para continuar.</span>}
          {alumnos.length === 0 && <span className="mt-1 block text-sm text-muted-foreground">Aún no hay alumnos registrados.</span>}
        </label>
        <Btn type="submit">
          <Search className="h-4 w-4" /> {label}
        </Btn>
      </form>
    </Card>
  );
}
