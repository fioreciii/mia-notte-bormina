"use client";

import {
  AlertTriangle,
  CalendarPlus,
  Check,
  ChevronRight,
  Clock3,
  Footprints,
  MapPinned,
  Navigation,
  Share2,
} from "lucide-react";
import { downloadRouteCalendar } from "@/lib/calendar";
import { formatMinutes } from "@/lib/events";
import { Language, eventTitle, ui } from "@/lib/i18n";
import { PlannedRoute } from "@/lib/route";
import { CategoryIcon } from "./CategoryIcon";

export function RoutePanel({
  route,
  language,
  onDiscover,
  onShare,
  shareDone,
}: {
  route: PlannedRoute;
  language: Language;
  onDiscover: () => void;
  onShare: () => void;
  shareDone: boolean;
}) {
  const t = ui[language];

  if (!route.steps.length) {
    return (
      <div className="empty-state">
        <div className="empty-illustration">
          <MapPinned size={38} />
        </div>
        <h2>{t.noSelection}</h2>
        <p>{t.noSelectionHint}</p>
        <button className="button button-primary" onClick={onDiscover}>
          {t.goDiscover}
          <ChevronRight size={17} />
        </button>
      </div>
    );
  }

  return (
    <div className="route-panel">
      <div className="route-title-row">
        <div>
          <p className="section-kicker">{t.routeReady}</p>
          <h2>
            {route.steps.length}{" "}
            {route.steps.length === 1 ? t.stop : t.stops}
          </h2>
        </div>
        <button className="round-action" onClick={onShare}>
          {shareDone ? <Check size={18} /> : <Share2 size={18} />}
          <span>{shareDone ? t.shared : t.share}</span>
        </button>
      </div>

      <div className="route-stats">
        <div>
          <Footprints size={18} />
          <strong>{(route.distanceMeters / 1000).toFixed(1)} km</strong>
          <span>{route.walkMinutes} min {t.walking}</span>
        </div>
        <div>
          <Clock3 size={18} />
          <strong>{formatMinutes(route.finishAt)}</strong>
          <span>{t.finish}</span>
        </div>
        {route.missed > 0 && (
          <div className="stat-warning">
            <AlertTriangle size={18} />
            <strong>{route.missed}</strong>
            <span>{route.missed === 1 ? t.late : t.latePlural}</span>
          </div>
        )}
      </div>

      {route.steps.length > 18 && (
        <p className="route-notice">{t.everyStopWarning}</p>
      )}

      <button
        className="button button-calendar"
        onClick={() => downloadRouteCalendar(route, language)}
      >
        <CalendarPlus size={18} />
        {language === "it"
          ? "Aggiungi al calendario"
          : language === "en"
            ? "Add to calendar"
            : language === "es"
              ? "Añadir al calendario"
              : "Zum Kalender hinzufügen"}
      </button>

      <ol className="timeline">
        {route.steps.map((step, index) => (
          <li key={step.stop.id} className={step.status === "late" ? "is-late" : ""}>
            <div className="timeline-rail">
              <span>{index + 1}</span>
            </div>
            <div className="timeline-card">
              <div className="timeline-time">
                <strong>{formatMinutes(step.arrival)}</strong>
                {step.walkMinutes > 0 && (
                  <span>
                    <Navigation size={12} /> {step.walkMinutes} min {t.walk}
                  </span>
                )}
              </div>
              <div className="event-card-heading">
                <CategoryIcon category={step.stop.categories[0]} />
                <div>
                  <h3>{eventTitle(step.stop, language)}</h3>
                  <p>{step.stop.host}</p>
                </div>
              </div>
              {step.timingLabel && (
                <div className={`schedule-badge ${step.status === "late" ? "is-late" : ""}`}>
                  {step.status === "late" && <AlertTriangle size={13} />}
                  {step.timingLabel}
                </div>
              )}
              {step.waitMinutes > 4 && (
                <small>
                  {step.waitMinutes} min {t.wait}
                </small>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
