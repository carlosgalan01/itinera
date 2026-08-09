# Itinera

Itinera es un planificador de viajes personalizado hecho como MVP para la asignatura de *Generative AI*. La idea era montar algo que una persona pudiera abrir y utilizar, no simplemente un notebook que devolviera una lista de sitios. El usuario indica destino, fechas, presupuesto e intereses; la aplicación busca contexto y devuelve una primera propuesta de viaje organizada por días.

La demo está disponible en: [itinera-omega.vercel.app](https://itinera-omega.vercel.app/).

## Qué hace realmente

- recoge destino, fechas, viajeros, dos bloques de presupuesto, intereses y observaciones;
- limita los viajes a siete días para que la demo no se vuelva lenta ni empiece a gastar tokens sin control;
- consulta clima, lugares y búsqueda web antes de generar la propuesta;
- muestra fuentes, avisos y datos orientativos para que no se confunda una recomendación con una reserva real;
- permite hacer el viaje más barato, más relajado o adaptarlo a lluvia sin lanzar otra llamada al modelo;
- incluye español/inglés, modo claro/oscuro, guardado local e impresión;
- incorpora un experimento LoRA independiente en `notebooks/`.

## Puesta en marcha

```bash
npm install
cp .env.example .env.local
npm run dev
```

Variables opcionales:

```text
OPENAI_API_KEY=...
OPENTRIPMAP_API_KEY=...
DEMO_ACCESS_CODE=...
```

Sin claves, la aplicación sigue funcionando en modo demostración. `OPENAI_API_KEY` activa la planificación con búsqueda web; `OPENTRIPMAP_API_KEY` añade lugares e imágenes; `DEMO_ACCESS_CODE` protege el formulario para controlar el gasto.

## Despliegue

El proyecto está preparado para Vercel: basta con importar el repositorio, dejar que detecte Next.js y añadir las variables anteriores. Para la demo conviene fijar un límite de gasto en OpenAI y usar un código temporal. Las claves no se exponen en el navegador.

## Estructura

- `app/page.tsx`: interfaz y refinamientos.
- `app/api/plan/route.ts`: orquestación de APIs, prompt y fallback.
- `notebooks/`: experimento de fine-tuning LoRA.


Los precios, horarios y disponibilidad son orientativos. La aplicación intenta ahorrar el trabajo inicial de organizar un viaje, no sustituir la comprobación final antes de reservar.
