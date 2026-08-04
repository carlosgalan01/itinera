# Itinera — Plan de implementación del MVP

## Objetivo

Construir un planificador de viajes público, visual y sencillo que genere itinerarios personalizados para cualquier ciudad utilizando información recuperada de fuentes actuales. El proyecto debe poder entregarse como caso práctico y funcionar también como pieza de portfolio.

## Alcance

- Viajes de entre uno y siete días. El límite controla el coste y la latencia de la demostración, no es una limitación técnica.
- Entrada: destino, origen opcional, fechas, viajeros, nivel de presupuesto, presupuesto diario, intereses y preferencias adicionales.
- Salida: llegada, zonas de alojamiento, presupuesto separado, meteorología, itinerario por días, recomendaciones prácticas, alertas y fuentes.
- Idiomas español e inglés, temas claro y oscuro, estado guardado en el navegador y vista imprimible.
- Sin reservas, cuentas de usuario, base de datos, mapa interactivo ni cálculo exacto de rutas en el MVP.

## Arquitectura

Aplicación Next.js de una sola experiencia desplegable en Vercel. Una ruta de servidor consulta Open-Meteo para geocodificación y clima, OpenTripMap para lugares y OpenAI Web Search para información actual. Un modelo económico genera una respuesta estructurada y la aplicación utiliza un resultado de demostración cuando faltan claves o falla una fuente externa.

## Personalización del modelo

El fine-tuning de OpenAI no está disponible para organizaciones nuevas. Se ha realizado un experimento independiente de LoRA en Colab sobre Qwen3-0.6B, con 120 ejemplos y comparación antes/después. El conocimiento actual del destino procede del RAG; LoRA se utiliza para aprender formato y comportamiento. El resultado mejora la adherencia a las reglas de Itinera, aunque también muestra que un dataset pequeño y estructurado puede hacer la respuesta más rígida.

## Coste y seguridad

- Modelo económico y una investigación web por itinerario.
- Salida y duración limitadas.
- Código de acceso opcional mediante variable de entorno.
- Límite de gasto de 2-3 € en el proveedor del modelo.
- Las claves se mantienen en el servidor y nunca se incluyen en el repositorio.

## Entregables

1. Aplicación pública.
2. Repositorio limpio con README y archivo de ejemplo de variables.
3. Notebook LoRA ejecutado y evidencia de comparación antes/después.
4. Memoria breve en primera persona, siguiendo la plantilla del caso práctico.
