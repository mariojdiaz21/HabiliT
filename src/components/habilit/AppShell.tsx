import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { LogOut, ArrowLeft } from "lucide-react";
import logo from "@/assets/habilit-logo.jpeg";
import icono from "@/assets/icono.png";
import { cerrarSesion, usuarioActual } from "@/lib/reportes";

export function useSesion() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState<string | null>(null);
  useEffect(() => {
    const u = usuarioActual();
    if (!u) navigate({ to: "/" });
    else setUsuario(u);
  }, [navigate]);
  return usuario;
}

export function AppShell({
  title,
  subtitle,
  children,
  back = true,
  accent = "bg-petrol",
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  back?: boolean;
  accent?: string;
}) {
  const usuario = useSesion();
  const navigate = useNavigate();
  if (!usuario) return null;

  return (
    <div className="min-h-screen">
      <div className="h-1.5 bg-brand-gradient" />
      <header className="sticky top-0 z-20 border-b bg-card/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/panel" className="flex items-center gap-3">
            <span className="block h-11 w-11 overflow-hidden rounded-full">
              <img src={icono} alt="Logo HabiliT" className="h-full w-full object-contain" />
            </span>
            <div className="leading-tight">
              <p className="font-display text-lg font-extrabold text-petrol">HABILIT</p>
              <p className="hidden text-xs text-muted-foreground sm:block">Aprendizaje sin barreras para todos</p>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm sm:inline">
              Hola, <strong className="text-petrol">{usuario}</strong>
            </span>
            <button
              onClick={() => {
                cerrarSesion();
                navigate({ to: "/" });
              }}
              className="inline-flex items-center gap-2 rounded-full border border-input px-3 py-1.5 text-sm font-semibold text-graphite transition hover:border-coral hover:text-coral"
            >
              <LogOut className="h-4 w-4" /> Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 fade-up">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className={`h-10 w-1.5 rounded-full ${accent}`} />
            <div>
              <h1 className="text-2xl font-extrabold text-petrol sm:text-3xl">{title}</h1>
              {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
            </div>
          </div>
          {back && (
            <Link to="/panel" className="inline-flex items-center gap-1 text-sm font-semibold text-sky hover:underline">
              <ArrowLeft className="h-4 w-4" /> Volver al panel
            </Link>
          )}
        </div>
        {children}
      </main>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        HabiliT · <a href="mailto:info@habilit.org" className="text-sky hover:underline">info@habilit.org</a>
      </footer>
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-2xl border bg-card p-5 shadow-soft sm:p-6 ${className}`}>{children}</section>;
}

export function Btn({
  variant = "primary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "coral" | "lime" | "outline" | "gold" }) {
  const styles = {
    primary: "bg-petrol text-primary-foreground hover:bg-sky",
    coral: "bg-coral text-primary-foreground hover:opacity-90",
    lime: "bg-lime text-graphite hover:opacity-90",
    gold: "bg-gold text-graphite hover:opacity-90",
    outline: "border border-input bg-card text-graphite hover:border-petrol hover:text-petrol",
  }[variant];
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${styles} ${className}`}
    />
  );
}
