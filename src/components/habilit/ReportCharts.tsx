import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CRITERIOS, type Reporte, type CriterioKey } from "@/lib/reportes";

const COLORS = ["var(--sky)", "var(--coral)", "var(--lime)", "var(--gold)", "var(--orange)"];

export function CriteriosCharts({ criterios }: { criterios: Record<CriterioKey, number> }) {
  const data = CRITERIOS.map((c) => ({ name: c.label, valor: criterios[c.key] ?? 0 }));
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="h-72 rounded-xl bg-smoke p-3">
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--mist)" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} />
            <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v) => `${v}%`} />
            <Bar dataKey="valor" radius={[8, 8, 0, 0]} animationDuration={600}>
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="h-72 rounded-xl bg-smoke p-3">
        <ResponsiveContainer>
          <RadarChart data={data} outerRadius="70%">
            <PolarGrid stroke="var(--input)" />
            <PolarAngleAxis dataKey="name" tick={{ fontSize: 10 }} />
            <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9 }} />
            <Tooltip formatter={(v) => `${v}%`} />
            <Radar dataKey="valor" stroke="var(--petrol)" fill="var(--sky)" fillOpacity={0.4} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function EvolucionChart({ reportes }: { reportes: Reporte[] }) {
  const data = [...reportes]
    .sort((a, b) => a.fecha.localeCompare(b.fecha))
    .map((r) => ({ fecha: r.fecha, ...r.criterios }));
  if (data.length < 2) return null;
  return (
    <div className="h-80 rounded-xl bg-smoke p-3">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--mist)" />
          <XAxis dataKey="fecha" tick={{ fontSize: 11 }} />
          <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />
          <Tooltip formatter={(v) => `${v}%`} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {CRITERIOS.map((c, i) => (
            <Line key={c.key} dataKey={c.key} name={c.label} stroke={COLORS[i]} strokeWidth={2.5} dot={{ r: 4 }} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
