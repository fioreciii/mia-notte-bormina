"use client";

import {
  Check,
  ChevronDown,
  Compass,
  LocateFixed,
  Map as MapIcon,
  MapPin,
  Moon,
  Navigation2,
  Route,
  Search,
  Sparkles,
  Sun,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  Category,
  EventStop,
  categoryMeta,
  events,
  presets,
} from "@/lib/events";
import {
  Language,
  categoryLabel,
  eventTitle,
  languageLabels,
  ui,
} from "@/lib/i18n";
import {
  AUTO_VISIT_DELAY_MS,
  MAX_AUTO_VISIT_ACCURACY_METERS,
  arrivalRadiusMeters,
  nearestUnvisitedStop,
} from "@/lib/journey";
import {
  MapPoint,
  geolocationToMap,
  isInsideBormioMap,
  landmarkStarts,
  planRoute,
} from "@/lib/route";
import { CategoryIcon } from "./CategoryIcon";
import { EventCard } from "./EventCard";
import { EventCountdown } from "./EventCountdown";
import { InteractiveMap } from "./InteractiveMap";
import { JourneyPanel } from "./JourneyPanel";
import { RouteMapPreview } from "./RouteMapPreview";
import { RoutePanel } from "./RoutePanel";

type View = "map" | "discover" | "route";
type Theme = "light" | "dark";
type StartMode =
  | "auto"
  | "current"
  | "map"
  | "cavour"
  | "sanVitale"
  | "alpini";

const categories: Category[] = [
  "food",
  "music",
  "show",
  "kids",
  "culture",
  "shopping",
];

const presetCategories: Record<string, Category> = {
  family: "kids",
  taste: "food",
  music: "music",
  culture: "culture",
};

const themeLabels: Record<
  Language,
  Record<Theme, { label: string; action: string }>
> = {
  it: {
    dark: { label: "Notte", action: "Passa alla modalità chiara" },
    light: { label: "Chiaro", action: "Passa alla modalità notte" },
  },
  en: {
    dark: { label: "Night", action: "Switch to light mode" },
    light: { label: "Light", action: "Switch to night mode" },
  },
  es: {
    dark: { label: "Noche", action: "Cambiar al modo claro" },
    light: { label: "Claro", action: "Cambiar al modo noche" },
  },
  de: {
    dark: { label: "Nacht", action: "Zum hellen Modus wechseln" },
    light: { label: "Hell", action: "Zum Nachtmodus wechseln" },
  },
};

const presetLabels: Record<
  Language,
  Record<string, { label: string; description: string }>
> = {
  it: {
    family: { label: "Con bambini", description: "Giochi, fiabe e spettacoli" },
    taste: { label: "Sapori bormini", description: "Una passeggiata da assaggiare" },
    music: { label: "Musica fino a tardi", description: "Live, tributo 883 e DJ set" },
    culture: { label: "Arte & tradizione", description: "Mestieri, libri e artigiani" },
  },
  en: {
    family: { label: "With kids", description: "Games, stories and shows" },
    taste: { label: "A taste of Bormio", description: "A walk full of flavour" },
    music: { label: "Music till late", description: "Live sets, 883 tribute and DJs" },
    culture: { label: "Art & tradition", description: "Crafts, books and makers" },
  },
  es: {
    family: { label: "Con niños", description: "Juegos, cuentos y espectáculos" },
    taste: { label: "Sabores borminos", description: "Un paseo para saborear" },
    music: { label: "Música hasta tarde", description: "Directos, tributo a 883 y DJs" },
    culture: { label: "Arte y tradición", description: "Oficios, libros y artesanos" },
  },
  de: {
    family: { label: "Mit Kindern", description: "Spiele, Märchen und Shows" },
    taste: { label: "Bormio genießen", description: "Ein Spaziergang voller Geschmack" },
    music: { label: "Musik bis spät", description: "Live, 883 Tribute und DJs" },
    culture: { label: "Kunst & Tradition", description: "Handwerk, Bücher und Künstler" },
  },
};

function parseSelectedFromUrl() {
  if (typeof window === "undefined") return [];
  const ids = new URLSearchParams(window.location.search)
    .get("stops")
    ?.split(",")
    .map(Number)
    .filter((id) => events.some((event) => event.id === id));
  return ids ?? [];
}

export function NightPlanner() {
  const [language, setLanguage] = useState<Language>("it");
  const [view, setView] = useState<View>("discover");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [activeCategory, setActiveCategory] = useState<"all" | Category>("all");
  const [search, setSearch] = useState("");
  const [activeEvent, setActiveEvent] = useState<EventStop | undefined>();
  const [startMode, setStartMode] = useState<StartMode>("auto");
  const [customStart, setCustomStart] = useState<MapPoint>();
  const [pickingStart, setPickingStart] = useState(false);
  const [startTime, setStartTime] = useState(18 * 60);
  const [geoMessage, setGeoMessage] = useState("");
  const [shareDone, setShareDone] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [theme, setTheme] = useState<Theme>("dark");
  const [journeyActive, setJourneyActive] = useState(false);
  const [journeyPaused, setJourneyPaused] = useState(false);
  const [currentPoint, setCurrentPoint] = useState<MapPoint>();
  const [locationAccuracy, setLocationAccuracy] = useState<number>();
  const [visited, setVisited] = useState<Set<number>>(new Set());
  const [nearbyStopId, setNearbyStopId] = useState<number>();
  const [journeyLocationMessage, setJourneyLocationMessage] = useState("");

  const t = ui[language];

  useEffect(() => {
    const urlStops = parseSelectedFromUrl();
    const params = new URLSearchParams(window.location.search);
    const stored = localStorage.getItem("notte-bormina-selection");
    const storedLanguage = localStorage.getItem(
      "notte-bormina-language",
    ) as Language | null;
    const storedTheme = localStorage.getItem(
      "notte-bormina-theme",
    ) as Theme | null;
    const storedVisited = localStorage.getItem(
      "notte-bormina-visited-2026-07-25",
    );
    const initial = urlStops.length
      ? urlStops
      : stored
        ? (JSON.parse(stored) as number[])
        : [];
    setSelected(new Set(initial));
    if (storedVisited) {
      try {
        const ids = (JSON.parse(storedVisited) as number[]).filter((id) =>
          events.some((event) => event.id === id),
        );
        setVisited(new Set(ids));
      } catch {
        localStorage.removeItem("notte-bormina-visited-2026-07-25");
      }
    }
    const sharedTime = Number(params.get("time"));
    if (sharedTime >= 17 * 60 && sharedTime <= 24 * 60) {
      setStartTime(sharedTime);
    }
    const sharedMode = params.get("start") as StartMode | null;
    if (
      sharedMode &&
      ["auto", "cavour", "sanVitale", "alpini", "map"].includes(sharedMode)
    ) {
      setStartMode(sharedMode);
    }
    const sharedX = Number(params.get("x"));
    const sharedY = Number(params.get("y"));
    if (
      Number.isFinite(sharedX) &&
      Number.isFinite(sharedY) &&
      params.has("x") &&
      params.has("y")
    ) {
      setCustomStart({ x: sharedX, y: sharedY });
    }
    if (storedLanguage && languageLabels[storedLanguage]) {
      setLanguage(storedLanguage);
    } else {
      const browserLanguage = navigator.language.slice(0, 2) as Language;
      if (languageLabels[browserLanguage]) setLanguage(browserLanguage);
    }
    const initialTheme =
      storedTheme === "light" || storedTheme === "dark"
        ? storedTheme
        : new Date().getHours() >= 18 ||
            window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
    setTheme(initialTheme);
    document.documentElement.dataset.theme = initialTheme;
    setHydrated(true);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    if (hydrated) localStorage.setItem("notte-bormina-theme", theme);
  }, [theme, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(
      "notte-bormina-selection",
      JSON.stringify([...selected]),
    );
    localStorage.setItem("notte-bormina-language", language);
    const url = new URL(window.location.href);
    if (selected.size) url.searchParams.set("stops", [...selected].join(","));
    else url.searchParams.delete("stops");
    url.searchParams.set("time", String(startTime));
    url.searchParams.set("start", startMode === "current" ? "map" : startMode);
    if (customStart && (startMode === "map" || startMode === "current")) {
      url.searchParams.set("x", customStart.x.toFixed(3));
      url.searchParams.set("y", customStart.y.toFixed(3));
    } else {
      url.searchParams.delete("x");
      url.searchParams.delete("y");
    }
    window.history.replaceState({}, "", url);
  }, [selected, language, startTime, startMode, customStart, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(
      "notte-bormina-visited-2026-07-25",
      JSON.stringify([...visited]),
    );
  }, [visited, hydrated]);

  const selectedStops = useMemo(
    () => events.filter((event) => selected.has(event.id)),
    [selected],
  );

  const startPoint = useMemo(() => {
    if (startMode === "auto") return undefined;
    if (startMode === "cavour") return landmarkStarts.cavour;
    if (startMode === "sanVitale") return landmarkStarts.sanVitale;
    if (startMode === "alpini") return landmarkStarts.alpini;
    return customStart;
  }, [startMode, customStart]);

  const route = useMemo(
    () => planRoute(selectedStops, startTime, startPoint),
    [selectedStops, startTime, startPoint],
  );
  const journeyComplete =
    route.steps.length > 0 &&
    route.steps.every((step) => visited.has(step.stop.id));

  useEffect(() => {
    if (
      !hydrated ||
      !journeyActive ||
      journeyPaused ||
      journeyComplete
    ) {
      return;
    }

    if (!navigator.geolocation) {
      setJourneyLocationMessage(ui[language].journeyLocationError);
      return;
    }

    setJourneyLocationMessage("");
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        if (!isInsideBormioMap(latitude, longitude)) {
          setCurrentPoint(undefined);
          setLocationAccuracy(accuracy);
          setJourneyLocationMessage(ui[language].journeyOutsideArea);
          return;
        }
        setCurrentPoint(geolocationToMap(latitude, longitude));
        setLocationAccuracy(accuracy);
        setJourneyLocationMessage("");
      },
      () => {
        setJourneyLocationMessage(ui[language].journeyLocationError);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 4000,
        timeout: 12000,
      },
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [
    hydrated,
    journeyActive,
    journeyPaused,
    journeyComplete,
    language,
  ]);

  useEffect(() => {
    if (
      !journeyActive ||
      journeyPaused ||
      journeyComplete ||
      !currentPoint ||
      locationAccuracy === undefined ||
      locationAccuracy > MAX_AUTO_VISIT_ACCURACY_METERS
    ) {
      setNearbyStopId(undefined);
      return;
    }

    const nearest = nearestUnvisitedStop(
      route.steps.map((step) => step.stop),
      visited,
      currentPoint,
    );
    const radius = arrivalRadiusMeters(locationAccuracy);
    setNearbyStopId(
      nearest && nearest.distance <= radius ? nearest.stop.id : undefined,
    );
  }, [
    journeyActive,
    journeyPaused,
    journeyComplete,
    currentPoint,
    locationAccuracy,
    route,
    visited,
  ]);

  useEffect(() => {
    if (
      !journeyActive ||
      journeyPaused ||
      journeyComplete ||
      !nearbyStopId
    ) {
      return;
    }

    const timer = window.setTimeout(
      () => markJourneyVisited(nearbyStopId),
      AUTO_VISIT_DELAY_MS,
    );
    return () => window.clearTimeout(timer);
  }, [
    journeyActive,
    journeyPaused,
    journeyComplete,
    nearbyStopId,
  ]);

  const visibleEvents = useMemo(() => {
    const term = search.trim().toLocaleLowerCase(language);
    return events.filter((event) => {
      const inCategory =
        activeCategory === "all" || event.categories.includes(activeCategory);
      const inSearch =
        !term ||
        eventTitle(event, language).toLocaleLowerCase(language).includes(term) ||
        event.host.toLocaleLowerCase(language).includes(term);
      return inCategory && inSearch;
    });
  }, [activeCategory, language, search]);

  function markJourneyVisited(id: number) {
    setVisited((current) => {
      if (current.has(id)) return current;
      const next = new Set(current);
      next.add(id);
      return next;
    });
    setNearbyStopId(undefined);
    if (typeof navigator.vibrate === "function") navigator.vibrate(90);
  }

  function startJourney() {
    setJourneyActive(true);
    setJourneyPaused(false);
    setJourneyLocationMessage("");
    setView("route");
  }

  function pauseJourney() {
    setJourneyPaused(true);
    setNearbyStopId(undefined);
  }

  function continueJourney() {
    setJourneyActive(true);
    setJourneyPaused(false);
    setJourneyLocationMessage("");
  }

  function endJourney() {
    setJourneyActive(false);
    setJourneyPaused(false);
    setCurrentPoint(undefined);
    setLocationAccuracy(undefined);
    setNearbyStopId(undefined);
    setJourneyLocationMessage("");
  }

  function resetJourney() {
    const routeIds = new Set(route.steps.map((step) => step.stop.id));
    setVisited((current) => {
      const next = new Set(current);
      for (const id of routeIds) next.delete(id);
      return next;
    });
    endJourney();
  }

  function toggleStop(id: number) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectPreset(ids: number[]) {
    setSelected(new Set(ids));
    setView("route");
  }

  function useCurrentLocation() {
    setStartMode("current");
    setGeoMessage(t.geoWaiting);
    if (!navigator.geolocation) {
      setGeoMessage(t.geoError);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCustomStart(
          geolocationToMap(
            position.coords.latitude,
            position.coords.longitude,
          ),
        );
        setGeoMessage("");
      },
      () => setGeoMessage(t.geoError),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  function setStart(mode: StartMode) {
    setStartMode(mode);
    setGeoMessage("");
    setPickingStart(mode === "map");
    if (mode === "map") setView("map");
    if (mode === "current") useCurrentLocation();
  }

  async function shareRoute() {
    const url = window.location.href;
    const shareData = {
      title: "La mia Notte Bormina",
      text: `${selected.size} ${t.stops} · Notte Bormina 2026`,
      url,
    };
    if (navigator.share) await navigator.share(shareData).catch(() => undefined);
    else await navigator.clipboard.writeText(url);
    setShareDone(true);
    window.setTimeout(() => setShareDone(false), 2200);
  }

  const startOptions: {
    id: StartMode;
    label: string;
    icon: React.ReactNode;
    hint?: string;
  }[] = [
    {
      id: "auto",
      label: t.startAuto,
      hint: t.startAutoHint,
      icon: <Sparkles size={18} />,
    },
    {
      id: "current",
      label: t.startCurrent,
      icon: <LocateFixed size={18} />,
    },
    { id: "map", label: t.startMap, icon: <MapPin size={18} /> },
    { id: "cavour", label: t.startCavour, icon: <Navigation2 size={18} /> },
    { id: "sanVitale", label: t.startSanVitale, icon: <Navigation2 size={18} /> },
    { id: "alpini", label: t.startAlpini, icon: <Navigation2 size={18} /> },
  ];

  return (
    <main className="app-shell" data-theme={theme}>
      <header className="site-header">
        <EventCountdown language={language} />
        <div className="header-actions">
          <button
            className="theme-toggle"
            onClick={() =>
              setTheme((current) => (current === "dark" ? "light" : "dark"))
            }
            aria-label={themeLabels[language][theme].action}
            aria-pressed={theme === "dark"}
            title={themeLabels[language][theme].action}
          >
            {theme === "dark" ? <Moon size={15} /> : <Sun size={15} />}
            <span>{themeLabels[language][theme].label}</span>
          </button>
          <div className="language-switcher">
            <button
              className="language-current"
              onClick={() => setLanguageOpen((open) => !open)}
              aria-expanded={languageOpen}
            >
              {languageLabels[language]}
              <ChevronDown size={14} />
            </button>
            {languageOpen && (
              <div className="language-menu">
                {(Object.keys(languageLabels) as Language[]).map((item) => (
                  <button
                    key={item}
                    className={item === language ? "is-active" : ""}
                    onClick={() => {
                      setLanguage(item);
                      setLanguageOpen(false);
                    }}
                  >
                    <span>{languageLabels[item]}</span>
                    {item === language && <Check size={14} />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">{t.eyebrow}</p>
          <h1>
            {t.titleA} <em>{t.titleB}</em>
          </h1>
          <p>{t.subtitle}</p>
        </div>
        <div className="selection-pill">
          <strong>{selected.size}</strong>
          <span>{t.selected}</span>
        </div>
      </section>

      <div className="desktop-grid">
        <div className={`map-column mobile-view ${view === "map" ? "is-visible" : ""}`}>
          <InteractiveMap
            language={language}
            selected={selected}
            activeEvent={activeEvent}
            route={route}
            startPoint={startPoint}
            currentPoint={currentPoint}
            visited={visited}
            journeyActive={journeyActive}
            nearbyStopId={nearbyStopId}
            pickingStart={pickingStart}
            onToggle={toggleStop}
            onActive={setActiveEvent}
            onMapStart={(point) => {
              setCustomStart(point);
              setStartMode("map");
              setPickingStart(false);
              setView("route");
            }}
          />
        </div>

        <div className="content-column">
          <section
            className={`mobile-view ${view === "discover" ? "is-visible" : ""}`}
          >
            <div className="toolbar">
              <label className="search-box">
                <Search size={18} />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={t.search}
                />
                {search && (
                  <button onClick={() => setSearch("")} aria-label="Clear">
                    <X size={15} />
                  </button>
                )}
              </label>
            </div>

            <div className="category-scroll">
              <button
                className={`category-chip ${activeCategory === "all" ? "is-active" : ""}`}
                onClick={() => setActiveCategory("all")}
              >
                <Compass size={17} />
                {t.all}
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  className={`category-chip ${activeCategory === category ? "is-active" : ""}`}
                  onClick={() => setActiveCategory(category)}
                  style={{
                    "--chip-color": categoryMeta[category].color,
                  } as React.CSSProperties}
                >
                  <CategoryIcon category={category} size={16} />
                  {categoryLabel(category, language)}
                </button>
              ))}
            </div>

            {!search && activeCategory === "all" && (
              <section className="inspiration">
                <div className="section-heading">
                  <h2>{language === "it" ? "Che notte vuoi vivere?" : language === "en" ? "What kind of night are you after?" : language === "es" ? "¿Qué noche quieres vivir?" : "Welche Nacht möchtest du erleben?"}</h2>
                </div>
                <div className="preset-grid">
                  {presets.map((preset) => {
                    const copy = presetLabels[language][preset.id];
                    return (
                      <button
                        key={preset.id}
                        className="preset-card"
                        onClick={() => selectPreset(preset.ids)}
                      >
                        <CategoryIcon
                          category={presetCategories[preset.id]}
                          size={20}
                        />
                        <span className="preset-copy">
                          <strong>{copy.label}</strong>
                          <small>{copy.description}</small>
                        </span>
                        <Route className="preset-route" size={18} />
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            <section className="event-list-section">
              <div className="section-heading event-list-heading">
                <h2>{visibleEvents.length} {t.stops}</h2>
                <div className="list-actions">
                  <button
                    onClick={() =>
                      setSelected(
                        new Set(visibleEvents.map((event) => event.id)),
                      )
                    }
                  >
                    {t.selectAll}
                  </button>
                  {selected.size > 0 && (
                    <button onClick={() => setSelected(new Set())}>
                      {t.clear}
                    </button>
                  )}
                </div>
              </div>
              <div className="event-list">
                {visibleEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    language={language}
                    selected={selected.has(event.id)}
                    onToggle={() => toggleStop(event.id)}
                    onLocate={() => {
                      setActiveEvent(event);
                      setView("map");
                    }}
                  />
                ))}
              </div>
            </section>
          </section>

          <section
            className={`mobile-view route-view ${view === "route" ? "is-visible" : ""}`}
          >
            {route.steps.length > 0 && (
              <JourneyPanel
                route={route}
                language={language}
                active={journeyActive}
                paused={journeyPaused}
                visited={visited}
                currentPoint={currentPoint}
                accuracyMeters={locationAccuracy}
                nearbyStopId={nearbyStopId}
                locationMessage={journeyLocationMessage}
                onStart={startJourney}
                onPause={pauseJourney}
                onContinue={continueJourney}
                onEnd={endJourney}
                onReset={resetJourney}
                onMarkVisited={markJourneyVisited}
                onOpenMap={() => {
                  setActiveEvent(undefined);
                  setView("map");
                }}
              />
            )}

            {route.steps.length > 0 && (
              <RouteMapPreview
                route={route}
                startPoint={startPoint}
                currentPoint={currentPoint}
                visited={visited}
                journeyActive={journeyActive}
                language={language}
                onOpenMap={() => {
                  setActiveEvent(undefined);
                  setView("map");
                }}
              />
            )}

            {!journeyActive && (
              <div className="route-controls">
                <div className="section-heading">
                  <h2>
                    {selected.size}{" "}
                    {selected.size === 1 ? t.stop : t.stops} {t.selected}
                  </h2>
                  {selected.size > 0 && (
                    <button className="text-button" onClick={() => setSelected(new Set())}>
                      {t.clear}
                    </button>
                  )}
                </div>

                <div className="start-explainer">
                  <strong>{t.startTitle}</strong>
                  <span>{t.startHelp}</span>
                </div>

                <div className="start-options">
                  {startOptions.map((option) => (
                    <button
                      key={option.id}
                      className={startMode === option.id ? "is-active" : ""}
                      onClick={() => setStart(option.id)}
                    >
                      {option.icon}
                      <span>
                        <strong>{option.label}</strong>
                        {option.hint && <small>{option.hint}</small>}
                      </span>
                      {startMode === option.id && <Check size={16} />}
                    </button>
                  ))}
                </div>
                {geoMessage && <p className="geo-message">{geoMessage}</p>}

                <label className="time-control">
                  <span>{t.startTime}</span>
                  <input
                    type="time"
                    min="17:00"
                    max="23:59"
                    value={`${String(Math.floor(startTime / 60)).padStart(2, "0")}:${String(startTime % 60).padStart(2, "0")}`}
                    onChange={(event) => {
                      const [hours, minutes] = event.target.value
                        .split(":")
                        .map(Number);
                      setStartTime(hours * 60 + minutes);
                    }}
                  />
                </label>
              </div>
            )}

            <RoutePanel
              route={route}
              language={language}
              onDiscover={() => setView("discover")}
              onShare={shareRoute}
              shareDone={shareDone}
            />
          </section>
        </div>
      </div>

      <footer className="site-footer">
        <div className="footer-source">
          <span>{t.unofficial}</span>
          <a
            href="https://www.bormio.eu/it/eventi/experience/notte-bormina"
            target="_blank"
            rel="noreferrer"
          >
            bormio.eu
          </a>
        </div>
        <div className="footer-signature">
          <span>
            {t.madeWithLove}
            <span className="footer-love-mark" aria-hidden="true">
              (づ๑•ᴗ•๑)づ♡
            </span>
          </span>
          <a href="mailto:fioreci.works@gmail.com">
            fioreci.works@gmail.com
          </a>
        </div>
      </footer>

      <nav className="mobile-nav" aria-label="Navigazione principale">
        <button
          className={view === "map" ? "is-active" : ""}
          onClick={() => setView("map")}
        >
          <MapIcon size={20} />
          <span>{t.map}</span>
        </button>
        <button
          className={view === "discover" ? "is-active" : ""}
          onClick={() => setView("discover")}
        >
          <Compass size={20} />
          <span>{t.discover}</span>
        </button>
        <button
          className={view === "route" ? "is-active" : ""}
          onClick={() => setView("route")}
        >
          <Route size={20} />
          <span>{t.route}</span>
          {selected.size > 0 && <b>{selected.size}</b>}
        </button>
      </nav>
    </main>
  );
}
