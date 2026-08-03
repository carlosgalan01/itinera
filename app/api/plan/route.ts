type RequestBody = {
  destination?: string;
  origin?: string;
  startDate?: string;
  endDate?: string;
  travelers?: number;
  travelBudget?: string;
  dailyBudget?: string;
  interests?: string[];
  extra?: string;
  accessCode?: string;
  language?: "es" | "en";
  refinement?: string;
  previousPlan?: unknown;
};

type Place = { xid?: string; name?: string; kinds?: string; rate?: number; image?: string };
type LocationResult = { latitude: number; longitude: number; name: string; country: string; timezone?: string };
type WeatherResult = { daily?: { temperature_2m_max?: number[]; precipitation_probability_max?: number[] } };
type ResponsesPayload = { output_text?: string; output?: Array<{ content?: Array<{ text?: string }> }> };

function daysBetween(start?: string, end?: string) {
  if (!start || !end) return 3;
  const diff = Math.floor((new Date(end).getTime() - new Date(start).getTime()) / 86400000) + 1;
  return Math.max(1, Math.min(7, diff));
}

async function getLocation(destination: string) {
  try {
    const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
    url.searchParams.set("name", destination);
    url.searchParams.set("count", "1");
    url.searchParams.set("language", "es");
    const response = await fetch(url);
    if (!response.ok) return null;
    const data = await response.json() as { results?: LocationResult[] };
    return data.results?.[0] || null;
  } catch {
    return null;
  }
}

async function getWeather(latitude: number, longitude: number, startDate?: string, endDate?: string) {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(latitude));
  url.searchParams.set("longitude", String(longitude));
  url.searchParams.set("daily", "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max");
  url.searchParams.set("timezone", "auto");
  if (startDate && endDate) { url.searchParams.set("start_date", startDate); url.searchParams.set("end_date", endDate); }
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    return await response.json();
  } catch { return null; }
}

async function getPlaces(latitude: number, longitude: number, key?: string) {
  if (!key) return [];
  const url = new URL("https://api.opentripmap.com/0.1/es/places/radius");
  url.searchParams.set("radius", "12000");
  url.searchParams.set("lon", String(longitude));
  url.searchParams.set("lat", String(latitude));
  url.searchParams.set("kinds", "interesting_places,museums,architecture,historic,cultural,foods");
  url.searchParams.set("rate", "2");
  url.searchParams.set("limit", "18");
  url.searchParams.set("format", "json");
  url.searchParams.set("apikey", key);
  try {
    const response = await fetch(url);
    if (!response.ok) return [];
    const places = await response.json() as Place[];
    const top = places.filter((p) => p.name).slice(0, 5);
    const detailed = await Promise.all(top.map(async (place) => {
      if (!place.xid) return place;
      try {
        const detailResponse = await fetch(`https://api.opentripmap.com/0.1/es/places/xid/${place.xid}?apikey=${key}`);
        const detail = await detailResponse.json() as { preview?: { source?: string } };
        return { ...place, image: detail.preview?.source };
      } catch { return place; }
    }));
    return detailed;
  } catch { return []; }
}

function extractOutput(response: ResponsesPayload) {
  if (response.output_text) return response.output_text;
  for (const item of response.output || []) {
    for (const content of item.content || []) if (content.text) return content.text;
  }
  return "";
}

function stripJson(text: string) {
  return text.replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim();
}

function demoPlan(body: RequestBody, location: LocationResult | null, places: Place[], weather: WeatherResult | null) {
  const es = body.language !== "en";
  const destination = location?.name || String(body.destination || (es ? "Lisboa" : "Lisbon"));
  const isLisbon = destination.toLowerCase().includes("lisbo") || destination.toLowerCase().includes("lisbon");
  const country = location?.country || (isLisbon ? "Portugal" : (es ? "País por confirmar" : "Country to confirm"));
  const count = daysBetween(body.startDate, body.endDate);
  const names = places.map((p) => p.name).filter(Boolean);
  const fallback = destination.toLowerCase().includes("lis")
    ? ["Alfama", "Castelo de São Jorge", "Baixa y Chiado", "Belém", "LX Factory", "Miradouro da Senhora do Monte"]
    : [es ? `Centro histórico de ${destination}` : `${destination} historic centre`, es ? "Mercado local" : "Local market", es ? "Museo principal" : "Main museum", es ? "Barrio creativo" : "Creative quarter", es ? "Parque urbano" : "City park"];
  const pool = [...names, ...fallback];
  const dayTitlesEs = ["Primeras vistas y vida local", "Historia, sabores y barrios", "La ciudad sin prisas", "Arquitectura y cultura", "Naturaleza urbana", "Favoritos locales", "Una última mirada"];
  const dayTitlesEn = ["First views and local life", "History, flavours and neighbourhoods", "The city at an easy pace", "Architecture and culture", "Urban nature", "Local favourites", "One last look"];
  const images = places.map((p) => p.image).filter(Boolean) as string[];
  const days = Array.from({ length: count }, (_, index) => {
    const date = body.startDate ? new Date(new Date(body.startDate).getTime() + index * 86400000).toLocaleDateString(es ? "es-ES" : "en-GB", { day: "numeric", month: "short" }) : `${index + 1}`;
    const max = weather?.daily?.temperature_2m_max?.[index];
    const rain = weather?.daily?.precipitation_probability_max?.[index];
    return {
      day: index + 1,
      date,
      title: es ? dayTitlesEs[index] : dayTitlesEn[index],
      weather: max ? `${Math.round(max)} °C · ${rain || 0}% ${es ? "lluvia" : "rain"}` : (es ? "Previsión pendiente" : "Forecast pending"),
      activities: [
        { time: "09:30", title: pool[(index * 2) % pool.length], description: es ? "Empieza por uno de los lugares más representativos, antes de que se llene y con tiempo para disfrutarlo." : "Start with one of the city's defining places before it gets busy, leaving time to enjoy it.", duration: "1 h 30 min", cost: es ? "€ · Bajo" : "€ · Low", category: es ? "Cultura" : "Culture", image: images[index % Math.max(1, images.length)] },
        { time: "13:00", title: es ? "Comida en un mercado o tasca local" : "Lunch at a local market or small restaurant", description: es ? "Una parada flexible para probar especialidades de la zona sin encorsetar el día." : "A flexible stop to try local specialities without overplanning the day.", duration: "1 h 15 min", cost: "€€", category: es ? "Gastronomía" : "Food" },
        { time: "16:00", title: pool[(index * 2 + 1) % pool.length], description: es ? "Continúa por una zona cercana para reducir desplazamientos y descubrir la ciudad caminando." : "Continue nearby to reduce transport and discover the city on foot.", duration: "2 h", cost: es ? "Gratis / €" : "Free / €", category: es ? "Paseo" : "Walk", image: images[(index + 2) % Math.max(1, images.length)] },
        { time: "20:30", title: es ? "Cena y paseo al atardecer" : "Dinner and an evening walk", description: es ? "Cierra el día con una cena sin prisas en un barrio con ambiente." : "End the day with an unhurried dinner in a lively neighbourhood.", duration: "2 h", cost: "€€", category: es ? "Noche" : "Evening" },
      ],
    };
  });
  return {
    destination, country,
    summary: es ? `${count} días para conocer ${destination} combinando sus lugares esenciales con barrios, gastronomía y momentos sin agenda. El itinerario prioriza trayectos razonables y un presupuesto equilibrado.` : `${count} days to experience ${destination}, combining essential sights with neighbourhoods, food and unscheduled moments. The itinerary favours sensible distances and a balanced budget.`,
    heroImage: images[0] || "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=1800&q=85",
    arrival: { title: body.origin ? `${body.origin} → ${destination}` : destination, detail: es ? "Compara tren y vuelo según las fechas. Reserva directamente con el operador." : "Compare rail and air for your dates. Book directly with the operator.", estimate: es ? "Estimación por confirmar" : "Estimate to confirm" },
    stay: { area: es ? "Centro histórico o barrio bien conectado" : "Historic centre or well-connected neighbourhood", detail: es ? "La mejor base depende de si priorizas caminar, tranquilidad o vida nocturna." : "The best base depends on whether you value walking, calm or nightlife.", estimate: body.travelBudget === "low" ? "€" : body.travelBudget === "high" ? "€€€" : "€€" },
    budget: { travelStay: es ? "Viaje y estancia: orientativo" : "Travel & stay: indicative", daily: `${body.dailyBudget || 90} € / ${es ? "día" : "day"}`, total: `${Number(body.dailyBudget || 90) * count} € + ${es ? "viaje" : "travel"}`, note: es ? "Para actividades, comida y transporte local. No incluye reservas." : "For activities, food and local transport. Bookings not included." },
    days,
    tips: es ? ["Reserva con antelación los monumentos con horario de entrada.", "Agrupa cada día por barrios para evitar desplazamientos innecesarios.", "Mantén una actividad flexible por si cambia el tiempo.", "Comprueba precios y horarios en las fuentes oficiales antes de pagar."] : ["Book timed-entry attractions in advance.", "Group each day by neighbourhood to avoid unnecessary travel.", "Keep one activity flexible in case the weather changes.", "Check prices and opening hours with official sources before paying."],
    warnings: es ? ["Los precios y horarios son orientativos y pueden cambiar.", "Esta vista utiliza datos de demostración cuando las claves API todavía no están configuradas."] : ["Prices and opening hours are indicative and may change.", "This view uses demo data while API keys are not configured."],
    sources: [
      { title: "OpenTripMap", url: "https://opentripmap.com/", type: "Lugares" },
      { title: "Open-Meteo", url: "https://open-meteo.com/", type: "Clima" },
      { title: es ? `Turismo oficial de ${destination}` : `${destination} official tourism`, url: `https://www.google.com/search?q=${encodeURIComponent(destination + " official tourism")}`, type: "Oficial" },
    ],
    mode: "demo" as const,
  };
}

export async function POST(request: Request) {
  const body = await request.json() as RequestBody;
  if (!body.destination) return Response.json({ error: "Destination is required" }, { status: 400 });
  const expectedCode = process.env.DEMO_ACCESS_CODE;
  if (expectedCode && body.accessCode !== expectedCode) return Response.json({ error: "Invalid access code" }, { status: 401 });

  const location = await getLocation(String(body.destination));
  const weather = location ? await getWeather(location.latitude, location.longitude, body.startDate, body.endDate) : null;
  const places = location ? await getPlaces(location.latitude, location.longitude, process.env.OPENTRIPMAP_API_KEY) : [];
  const fallback = demoPlan(body, location, places, weather);
  const openAiKey = process.env.OPENAI_API_KEY;
  if (!openAiKey) return Response.json(fallback);

  const prompt = `You are Itinera, a careful travel planner. Create a practical ${daysBetween(body.startDate, body.endDate)}-day itinerary in ${body.language === "en" ? "English" : "Spanish"}.
User: destination=${body.destination}; origin=${body.origin || "not supplied"}; dates=${body.startDate} to ${body.endDate}; travellers=${body.travelers}; travel+stay budget=${body.travelBudget}; daily local budget=${body.dailyBudget} EUR; interests=${(body.interests || []).join(",")}; extra=${body.extra || "none"}.
Location data: ${JSON.stringify(location)}.
Weather data: ${JSON.stringify(weather)?.slice(0, 5000)}.
Candidate places from OpenTripMap: ${JSON.stringify(places)?.slice(0, 6000)}.
Search the web for current, reliable travel information. Prioritise official tourism, attraction and transport websites, then recognised travel guides. Do not invent live prices or availability. Keep travel and accommodation estimates separate from activities, food and local transport. Group activities geographically. Include warnings for anything uncertain.
Return ONLY valid JSON matching exactly the same keys and shapes as this example: ${JSON.stringify(fallback)}. Replace demo content with researched content, preserve mode as "live", and include real source URLs in sources. Do not wrap JSON in markdown.`;
  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { "Authorization": `Bearer ${openAiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "gpt-5.6-luna", tools: [{ type: "web_search" }], input: prompt, max_output_tokens: 6500 }),
    });
    if (!response.ok) return Response.json(fallback);
    const raw = await response.json() as ResponsesPayload;
    const result = JSON.parse(stripJson(extractOutput(raw)));
    result.mode = "live";
    return Response.json(result);
  } catch {
    return Response.json(fallback);
  }
}
