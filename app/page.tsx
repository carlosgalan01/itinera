"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Language = "es" | "en";
type Theme = "light" | "dark";

type Activity = {
  time: string;
  title: string;
  description: string;
  duration: string;
  cost: string;
  category: string;
  image?: string;
};

type DayPlan = {
  day: number;
  date: string;
  title: string;
  weather: string;
  activities: Activity[];
};

type PlanResult = {
  destination: string;
  country: string;
  summary: string;
  heroImage?: string;
  arrival: { title: string; detail: string; estimate: string };
  stay: { area: string; detail: string; estimate: string };
  budget: { travelStay: string; daily: string; total: string; note: string };
  days: DayPlan[];
  tips: string[];
  warnings: string[];
  sources: { title: string; url: string; type: string }[];
  mode: "live" | "demo";
};

const copy = {
  es: {
    navHow: "Cómo funciona",
    navSaved: "Mi viaje",
    eyebrow: "PLANIFICACIÓN INTELIGENTE · INFORMACIÓN ACTUAL",
    titleA: "Tu próximo viaje,",
    titleB: "pensado de verdad.",
    subtitle:
      "Itinerarios personalizados con lugares, precios orientativos y recomendaciones contrastadas en la web.",
    destination: "¿Dónde quieres ir?",
    destinationPh: "Lisboa, Kioto, Buenos Aires…",
    origin: "¿Desde dónde viajas?",
    originPh: "Sevilla (opcional)",
    start: "Fecha de ida",
    end: "Fecha de vuelta",
    travelers: "Viajeros",
    travelBudget: "Vuelo + alojamiento",
    dailyBudget: "Actividades + comida",
    interests: "¿Qué te apetece?",
    extra: "Algo más que debamos saber",
    extraPh: "Viajo con niños, prefiero caminar, necesito opciones vegetarianas…",
    trusted: "Fuentes oficiales y guías reconocidas",
    limit: "Máximo 7 días para mantener esta demo rápida y económica.",
    submit: "Diseñar mi viaje",
    loading: "Diseñando tu viaje",
    loadingSub: "Buscando lugares, clima y recomendaciones fiables…",
    sample: "Ver viaje de ejemplo",
    resultEyebrow: "TU VIAJE PERSONALIZADO",
    arrival: "Llegada",
    stay: "Dónde alojarse",
    budget: "Presupuesto",
    itinerary: "Itinerario",
    practical: "Antes de viajar",
    sources: "Fuentes consultadas",
    warning: "Información orientativa",
    refine: "Refinar el viaje",
    cheaper: "Hacerlo más barato",
    relaxed: "Más relajado",
    rain: "Adaptar por lluvia",
    print: "Imprimir",
    newTrip: "Nuevo viaje",
    demo: "Vista de demostración",
    live: "Información actualizada",
    error: "No hemos podido crear el viaje. Prueba de nuevo en unos segundos.",
    access: "Código de acceso",
    accessPh: "Solo si la demo está protegida",
    footer: "Viaja con curiosidad. Reserva con criterio.",
  },
  en: {
    navHow: "How it works",
    navSaved: "My trip",
    eyebrow: "SMART PLANNING · CURRENT INFORMATION",
    titleA: "Your next journey,",
    titleB: "properly thought through.",
    subtitle:
      "Personalised itineraries with places, estimated prices and web-sourced recommendations.",
    destination: "Where do you want to go?",
    destinationPh: "Lisbon, Kyoto, Buenos Aires…",
    origin: "Where are you travelling from?",
    originPh: "Seville (optional)",
    start: "Departure date",
    end: "Return date",
    travelers: "Travellers",
    travelBudget: "Travel + accommodation",
    dailyBudget: "Activities + food",
    interests: "What are you into?",
    extra: "Anything else we should know",
    extraPh: "Travelling with children, vegetarian options, prefer walking…",
    trusted: "Official sources and recognised guides",
    limit: "Maximum 7 days to keep this demo fast and affordable.",
    submit: "Design my trip",
    loading: "Designing your journey",
    loadingSub: "Finding places, weather and reliable recommendations…",
    sample: "View sample trip",
    resultEyebrow: "YOUR PERSONALISED JOURNEY",
    arrival: "Getting there",
    stay: "Where to stay",
    budget: "Budget",
    itinerary: "Itinerary",
    practical: "Before you go",
    sources: "Sources consulted",
    warning: "Indicative information",
    refine: "Refine this trip",
    cheaper: "Make it cheaper",
    relaxed: "More relaxed",
    rain: "Adapt for rain",
    print: "Print",
    newTrip: "New trip",
    demo: "Demo view",
    live: "Current information",
    error: "We couldn't create the trip. Please try again in a few seconds.",
    access: "Access code",
    accessPh: "Only if the demo is protected",
    footer: "Travel with curiosity. Book with care.",
  },
};

const interests = [
  ["culture", "Arte y cultura", "Art & culture", "◫"],
  ["food", "Gastronomía", "Food", "◇"],
  ["nature", "Naturaleza", "Nature", "⌁"],
  ["local", "Vida local", "Local life", "○"],
  ["history", "Historia", "History", "⌂"],
  ["night", "Noche", "Nightlife", "✦"],
] as const;

function dateOffset(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export default function Home() {
  const [language, setLanguage] = useState<Language>("es");
  const [theme, setTheme] = useState<Theme>("light");
  const [selected, setSelected] = useState<string[]>(["culture", "food", "local"]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [plan, setPlan] = useState<PlanResult | null>(null);
  const t = copy[language];

  useEffect(() => {
    const savedTheme = (localStorage.getItem("itinera-theme") as Theme) || "light";
    const savedPlan = localStorage.getItem("itinera-plan");
    const frame = requestAnimationFrame(() => {
      setTheme(savedTheme);
      document.documentElement.dataset.theme = savedTheme;
      if (savedPlan) {
        try { setPlan(JSON.parse(savedPlan)); } catch { /* ignore stale local data */ }
      }
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  function toggleTheme() {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    localStorage.setItem("itinera-theme", next);
  }

  function toggleInterest(id: string) {
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  async function submit(event: FormEvent<HTMLFormElement>, refinement?: string) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination: form.get("destination"),
          origin: form.get("origin"),
          startDate: form.get("startDate"),
          endDate: form.get("endDate"),
          travelers: Number(form.get("travelers")),
          travelBudget: form.get("travelBudget"),
          dailyBudget: form.get("dailyBudget"),
          interests: selected,
          extra: form.get("extra"),
          accessCode: form.get("accessCode"),
          language,
          refinement,
          previousPlan: refinement ? plan : undefined,
        }),
      });
      if (!response.ok) throw new Error("request failed");
      const result = (await response.json()) as PlanResult;
      setPlan(result);
      localStorage.setItem("itinera-plan", JSON.stringify(result));
      setTimeout(() => document.getElementById("trip")?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch {
      setError(t.error);
    } finally {
      setLoading(false);
    }
  }

  function refinePlan(kind: "cheaper" | "relaxed" | "rain") {
    if (!plan) return;
    const es = language === "es";
    const refined: PlanResult = structuredClone(plan);
    if (kind === "cheaper") {
      refined.days = refined.days.map((day) => ({
        ...day,
        activities: day.activities.map((activity) => ({
          ...activity,
          cost: activity.cost.includes("Gratis") || activity.cost.includes("Free") ? activity.cost : es ? "Gratis / €" : "Free / €",
        })),
      }));
      refined.budget.note = es
        ? "Versión ajustada: mercados, paseos y espacios gratuitos. Verifica siempre las tarifas actuales."
        : "Budget version: markets, walks and free spaces. Always verify current prices.";
      refined.tips = [es ? "Prioriza menús del día, transporte público y reservas directas." : "Prioritise lunch menus, public transport and direct bookings.", ...refined.tips];
    }
    if (kind === "relaxed") {
      refined.days = refined.days.map((day) => ({ ...day, activities: day.activities.slice(0, 3) }));
      refined.summary = es ? `${refined.summary} Esta versión deja más tiempo libre entre paradas.` : `${refined.summary} This version leaves more free time between stops.`;
    }
    if (kind === "rain") {
      refined.days = refined.days.map((day) => ({
        ...day,
        weather: es ? `${day.weather} · plan de lluvia` : `${day.weather} · rain plan`,
        activities: day.activities.map((activity, index) => index % 2 === 0 ? {
          ...activity,
          description: `${activity.description} ${es ? "Si llueve, prioriza el interior y confirma el horario." : "If it rains, prioritise indoor time and confirm opening hours."}`,
        } : activity),
      }));
      refined.tips = [es ? "Lleva una alternativa cubierta en el mismo barrio para cada tramo." : "Keep a covered alternative in the same neighbourhood for each part of the day.", ...refined.tips];
    }
    setPlan(refined);
    localStorage.setItem("itinera-plan", JSON.stringify(refined));
  }

  const totalActivities = useMemo(
    () => plan?.days.reduce((sum, day) => sum + day.activities.length, 0) || 0,
    [plan],
  );

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Itinera home">
          <span className="brandMark">i</span><span>itinera</span>
        </a>
        <nav>
          <a href="#planner">{t.navHow}</a>
          <a href="#trip">{t.navSaved}</a>
        </nav>
        <div className="controls">
          <button className="iconButton" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === "light" ? "◐" : "☼"}
          </button>
          <div className="languageToggle" aria-label="Language">
            <button className={language === "es" ? "active" : ""} onClick={() => setLanguage("es")}>ES</button>
            <button className={language === "en" ? "active" : ""} onClick={() => setLanguage("en")}>EN</button>
          </div>
        </div>
      </header>

      <section className="hero" id="top">
        <div className="heroBackdrop" />
        <div className="heroContent">
          <p className="eyebrow light">{t.eyebrow}</p>
          <h1>{t.titleA}<br/><em>{t.titleB}</em></h1>
          <p className="heroSubtitle">{t.subtitle}</p>
          <a className="heroCta" href="#planner">{t.submit}<span>↓</span></a>
        </div>
        <div className="heroCaption">41.3874° N&nbsp;&nbsp; 2.1686° E</div>
      </section>

      <section className="plannerSection" id="planner">
        <div className="sectionIntro">
          <p className="eyebrow">01 · THE BRIEF</p>
          <h2>{language === "es" ? "Cuéntanos el viaje." : "Tell us about the trip."}</h2>
          <p>{language === "es" ? "Lo imprescindible primero. Los detalles pueden venir después." : "Start with the essentials. Details can come later."}</p>
        </div>

        <form className="plannerForm" onSubmit={submit}>
          <div className="field span2 featuredField">
            <label htmlFor="destination">{t.destination}</label>
            <input id="destination" name="destination" placeholder={t.destinationPh} required defaultValue="Lisboa" />
          </div>
          <div className="field span2">
            <label htmlFor="origin">{t.origin}</label>
            <input id="origin" name="origin" placeholder={t.originPh} defaultValue="Sevilla" />
          </div>
          <div className="field">
            <label htmlFor="startDate">{t.start}</label>
            <input id="startDate" name="startDate" type="date" required defaultValue={dateOffset(14)} />
          </div>
          <div className="field">
            <label htmlFor="endDate">{t.end}</label>
            <input id="endDate" name="endDate" type="date" required defaultValue={dateOffset(17)} />
          </div>
          <div className="field">
            <label htmlFor="travelers">{t.travelers}</label>
            <select id="travelers" name="travelers" defaultValue="2">
              {[1,2,3,4,5,6].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="travelBudget">{t.travelBudget}</label>
            <select id="travelBudget" name="travelBudget" defaultValue="medium">
              <option value="low">€ · {language === "es" ? "Ajustado" : "Budget"}</option>
              <option value="medium">€€ · {language === "es" ? "Equilibrado" : "Balanced"}</option>
              <option value="high">€€€ · {language === "es" ? "Cómodo" : "Comfort"}</option>
            </select>
          </div>
          <div className="field span2">
            <label htmlFor="dailyBudget">{t.dailyBudget}</label>
            <div className="currencyInput"><span>€</span><input id="dailyBudget" name="dailyBudget" type="number" min="20" max="1000" defaultValue="90" /></div>
          </div>
          <fieldset className="interests span4">
            <legend>{t.interests}</legend>
            <div className="interestGrid">
              {interests.map(([id, es, en, icon]) => (
                <button type="button" key={id} className={selected.includes(id) ? "selected" : ""} onClick={() => toggleInterest(id)} aria-pressed={selected.includes(id)}>
                  <span>{icon}</span>{language === "es" ? es : en}
                </button>
              ))}
            </div>
          </fieldset>
          <div className="field span4">
            <label htmlFor="extra">{t.extra}</label>
            <textarea id="extra" name="extra" placeholder={t.extraPh} rows={3} />
          </div>
          <div className="field span2 compactField">
            <label htmlFor="accessCode">{t.access}</label>
            <input id="accessCode" name="accessCode" type="password" placeholder={t.accessPh} />
          </div>
          <div className="trustNote span2"><span>✓</span><div><strong>{t.trusted}</strong><small>{t.limit}</small></div></div>
          <div className="formFooter span4">
            {error && <p className="formError">{error}</p>}
            <button className="primaryButton" disabled={loading} type="submit">
              {loading ? <><span className="spinner" />{t.loading}</> : <>{t.submit}<span>→</span></>}
            </button>
          </div>
        </form>
      </section>

      {loading && (
        <section className="loadingPanel" aria-live="polite">
          <div className="orbit"><span>i</span></div>
          <h2>{t.loading}</h2><p>{t.loadingSub}</p>
          <div className="loadingSteps"><span className="done">Destino</span><span className="active">Fuentes</span><span>Clima</span><span>Itinerario</span></div>
        </section>
      )}

      {plan && !loading && (
        <section className="trip" id="trip">
          <div className="tripHero" style={{ backgroundImage: `linear-gradient(90deg, rgba(16,22,19,.8), rgba(16,22,19,.1)), url('${plan.heroImage || "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=1800&q=85"}')` }}>
            <div><p className="eyebrow light">{t.resultEyebrow}</p><h2>{plan.destination}</h2><p>{plan.country}</p></div>
            <span className={`modeBadge ${plan.mode}`}>{plan.mode === "live" ? t.live : t.demo}</span>
          </div>
          <div className="tripBody">
            <div className="tripLead"><p>{plan.summary}</p><div><strong>{plan.days.length}</strong><span>días</span><strong>{totalActivities}</strong><span>planes</span></div></div>
            <div className="overviewGrid">
              <article><span className="cardIndex">01</span><p>{t.arrival}</p><h3>{plan.arrival.title}</h3><small>{plan.arrival.detail}</small><strong>{plan.arrival.estimate}</strong></article>
              <article><span className="cardIndex">02</span><p>{t.stay}</p><h3>{plan.stay.area}</h3><small>{plan.stay.detail}</small><strong>{plan.stay.estimate}</strong></article>
              <article className="budgetCard"><span className="cardIndex">03</span><p>{t.budget}</p><h3>{plan.budget.total}</h3><small>{plan.budget.note}</small><div><span>{plan.budget.travelStay}</span><span>{plan.budget.daily}</span></div></article>
            </div>

            <div className="itineraryHeader"><div><p className="eyebrow">02 · THE ROUTE</p><h2>{t.itinerary}</h2></div><button onClick={() => window.print()}>{t.print} ↗</button></div>
            <div className="days">
              {plan.days.map((day) => (
                <article className="day" key={day.day}>
                  <aside><span>DÍA</span><strong>{String(day.day).padStart(2,"0")}</strong><small>{day.date}</small><p>{day.weather}</p></aside>
                  <div className="dayContent"><h3>{day.title}</h3>
                    {day.activities.map((activity, index) => (
                      <div className="activity" key={`${day.day}-${index}`}>
                        <div className="activityTime">{activity.time}</div>
                        <div className="activityLine"><span /></div>
                        <div className="activityText"><p>{activity.category}</p><h4>{activity.title}</h4><span>{activity.description}</span><div><small>{activity.duration}</small><small>{activity.cost}</small></div></div>
                        {activity.image && <div className="activityImage" style={{ backgroundImage: `url('${activity.image}')` }} />}
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>

            <div className="practicalGrid">
              <section><p className="eyebrow">03 · GOOD TO KNOW</p><h2>{t.practical}</h2><ul>{plan.tips.map((tip, i) => <li key={i}><span>{String(i+1).padStart(2,"0")}</span>{tip}</li>)}</ul></section>
              <section className="sourcesPanel"><h3>{t.sources}</h3>{plan.sources.slice(0,8).map((source, i) => <a key={i} href={source.url} target="_blank" rel="noreferrer"><span>{source.type}</span>{source.title}<b>↗</b></a>)}</section>
            </div>
            <div className="warningBox"><span>!</span><div><strong>{t.warning}</strong>{plan.warnings.map((warning, i) => <p key={i}>{warning}</p>)}</div></div>
            <div className="refineBar"><div><p>{t.refine}</p><button onClick={() => refinePlan("cheaper")}>{t.cheaper}</button><button onClick={() => refinePlan("relaxed")}>{t.relaxed}</button><button onClick={() => refinePlan("rain")}>{t.rain}</button></div><button className="newTrip" onClick={() => { setPlan(null); localStorage.removeItem("itinera-plan"); document.getElementById("planner")?.scrollIntoView({behavior:"smooth"}); }}>{t.newTrip} +</button></div>
          </div>
        </section>
      )}

      <footer><div className="brand"><span className="brandMark">i</span><span>itinera</span></div><p>{t.footer}</p><small>© 2026 · MVP académico</small></footer>
    </main>
  );
}
