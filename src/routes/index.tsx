import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, Lock, User, AlertCircle } from "lucide-react";
import logo from "@/assets/habilit-logo.jpeg";
import { iniciarSesion } from "@/lib/reportes";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Iniciar sesión — HabiliT" },
      { name: "description", content: "Acceso al sistema de reportes de comportamiento de HabiliT." },
      { property: "og:title", content: "Iniciar sesión — HabiliT" },
      { property: "og:description", content: "Acceso al sistema de reportes de comportamiento de HabiliT." },
    ],
  }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [ver, setVer] = useState(false);
  const [error, setError] = useState("");
  const [intentos, setIntentos] = useState(0);
  const [shakeKey, setShakeKey] = useState(0);

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuario.trim() || !password) {
      setError("Ingrese su usuario y contraseña.");
      setShakeKey((k) => k + 1);
      return;
    }

    try {
      // Llamamos a la función oficial de reportes.ts que conecta al backend y guarda la sesión
      const r = await iniciarSesion(usuario, password);

      if (r.ok) {
        // Redirección directa y segura al panel principal
        window.location.href = "/panel";
      } else {
        setIntentos((i) => i + 1);
        setError("El usuario o la contraseña son incorrectos. Intente de nuevo.");
        setShakeKey((k) => k + 1);
        setPassword("");
      }
    } catch (err) {
      setError("No se pudo conectar con el servidor. Verifique que el backend esté encendido.");
      setShakeKey((k) => k + 1);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-hero p-12 text-primary-foreground lg:flex">
        <div className="h-1.5 w-32 rounded-full bg-brand-gradient" />
        <div>
          <h1 className="text-5xl font-extrabold leading-tight">
            Cada avance
            <br />
            cuenta una historia.
          </h1>
          <p className="mt-4 max-w-md text-lg opacity-85">
            Registre, consulte y dé seguimiento al comportamiento de cada alumno en un solo lugar.
          </p>
        </div>
        <p className="text-sm opacity-70">info@habilit.org</p>
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gold opacity-20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-10 h-64 w-64 rounded-full bg-lime opacity-20 blur-3xl" />
      </div>

      <div className="flex items-center justify-center bg-card px-6 py-12">
        <div className="w-full max-w-sm fade-up">
          <img src={logo} alt="HabiliT — Aprendizaje sin barreras para todos" className="mx-auto mb-6 w-56" />
          <h2 className="text-center text-2xl font-extrabold text-petrol">Bienvenido</h2>
          <p className="mb-6 text-center text-sm text-muted-foreground">Ingrese sus credenciales para continuar</p>

          <form key={shakeKey} onSubmit={enviar} className={`space-y-4 ${shakeKey ? "shake" : ""}`} noValidate>
            <label className="block">
              <span className="mb-1 block text-sm font-bold text-petrol">Usuario</span>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  autoFocus
                  value={usuario}
                  onChange={(e) => {
                    setUsuario(e.target.value);
                    setError("");
                  }}
                  placeholder="Nombre de usuario"
                  className="w-full rounded-xl border border-input bg-smoke py-2.5 pl-10 pr-3 outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-bold text-petrol">Contraseña</span>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={ver ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-input bg-smoke py-2.5 pl-10 pr-10 outline-none focus:ring-2 focus:ring-ring"
                />
                <button type="button" onClick={() => setVer((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-label="Mostrar contraseña">
                  {ver ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </label>

            {error && (
              <div role="alert" className="flex items-start gap-2 rounded-xl bg-coral/10 p-3 text-sm font-semibold text-coral">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  {error}
                  {intentos > 0 && <span className="block text-xs font-normal opacity-80">Intentos fallidos: {intentos}</span>}
                </span>
              </div>
            )}

            <button type="submit" className="w-full rounded-xl bg-petrol py-3 font-bold text-primary-foreground transition hover:bg-sky active:scale-[0.98]">
              Ingresar
            </button>
          </form>
          <div className="mt-8 h-1 rounded-full bg-brand-gradient" />
        </div>
      </div>
    </div>
  );
}