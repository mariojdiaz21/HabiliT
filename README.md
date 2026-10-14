# HabiliT — Sistema de registro de reportes de comportamiento

Interfaz gráfica (front-end) para el registro, consulta, edición y eliminación de
reportes de comportamiento de alumnos de una institución.

Construida con **React + TanStack Start**, **Tailwind CSS v4** y **Recharts** para las
gráficas. Los datos de alumnos y reportes se guardan de forma local
(en memoria y en el almacenamiento del navegador) hasta que se conecte el backend.

---

## Requisitos

- Node.js 20 o superior (incluye npm)
- Un navegador moderno

## Instalar y ejecutar

```sh
npm install
npm run dev
```

Abre la dirección que aparece en la terminal (normalmente `http://localhost:8080`).

## Otros comandos

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Arranca el servidor de desarrollo |
| `npm run build` | Genera la versión para producción |
| `npm run preview` | Sirve la versión ya compilada |
| `npm test` | Ejecuta las pruebas |
| `npm run lint` | Revisa el estilo del código |
| `npm run format` | Da formato automático al código |

---

## Estructura de carpetas

```text
src/
  routes/
    index.tsx        Pantalla de inicio de sesión
    panel.tsx        Panel principal (menú y resumen)
    registrar.tsx    Formulario para crear un reporte
    consultar.tsx    Buscar y ver reportes, con gráficas
    editar.tsx       Modificar un reporte existente
    eliminar.tsx     Borrar un reporte
    __root.tsx       Plantilla común de todas las páginas
  components/
    habilit/         Piezas propias del sistema
      AppShell.tsx       Barra superior y navegación
      ReportForm.tsx     Formulario con validaciones
      ReportView.tsx     Vista de un reporte
      ReportCharts.tsx   Gráficas
      StudentPicker.tsx  Selector de alumno
    ui/              Componentes base (botones, cuadros de texto, etc.)
  lib/
    reportes.ts      Datos de ejemplo y reglas de validación
  styles.css         Colores, tipografías y tema visual
  assets/            Logo de la institución
```

## Dónde están los datos

Todo el registro vive en `src/lib/reportes.ts`:

- `alumnos` — lista de alumnos (arreglo de objetos)
- `reportes` — lista de reportes (arreglo de objetos)
- `guardarReporte`, `actualizarReporte`, `eliminarReporte` — funciones que escriben
  en esos arreglos y guardan una copia en `localStorage` del navegador

Cuando tengas el backend y la base de datos, solo hay que sustituir el contenido de
esas funciones por llamadas a tu API; el resto de la interfaz no necesita cambios.

## Credenciales de demostración

La pantalla de acceso acepta estos usuarios mientras no exista un inicio de sesión real:

- Usuario: `admin` / Contraseña: `habilit2026`
- Usuario: `docente` / Contraseña: `habilit2026`

## Datos de la institución

- Nombre: HabiliT
- Correo de contacto: info@habilit.org
- Lema: sin barreras para todos

## Puesta en marcha sin conexión

La interfaz no necesita servidor propio: `npm run build` deja la versión lista para
subir a cualquier hosting.
