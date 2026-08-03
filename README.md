# Itinera

Itinera es un planificador de viajes personalizado creado como MVP académico de *LLM Customization*. Combina un modelo generativo con búsqueda web, datos abiertos de lugares y meteorología, y presenta el resultado como un itinerario visual, modificable y listo para imprimir.

## Qué incluye

- formulario de destino, fechas, presupuestos, intereses y necesidades;
- límite de siete días para controlar latencia y coste de la demostración;
- generación con OpenAI Responses API y búsqueda web;
- recuperación de contexto con Open-Meteo y OpenTripMap;
- fuentes visibles, advertencias y degradación segura a modo demo;
- refinamientos de bajo coste: más barato, más relajado o adaptado a lluvia;
- español/inglés, modo claro/oscuro, guardado local e impresión;
- experimento LoRA independiente en `notebooks/`.

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

El proyecto está preparado para Vercel. Importa el repositorio, deja que detecte **Next.js** y añade las variables anteriores en el panel de Vercel. Para una prueba docente conviene fijar un límite de gasto en OpenAI y usar un código temporal.

## Estructura

- `app/page.tsx`: interfaz y refinamientos.
- `app/api/plan/route.ts`: orquestación de APIs, prompt y fallback.
- `notebooks/`: experimento de fine-tuning LoRA.
- `docs/`: plan del proyecto y memoria de entrega.

Los precios, horarios y disponibilidad se muestran como orientativos: la aplicación enlaza las fuentes para que el usuario confirme antes de reservar.
