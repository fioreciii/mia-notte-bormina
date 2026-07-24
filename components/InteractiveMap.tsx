"use client";

import { Check, LocateFixed, MapPin, Navigation, X } from "lucide-react";
import { EventStop, events, formatMinutes } from "@/lib/events";
import { Language, eventTitle, ui } from "@/lib/i18n";
import { MapPoint, PlannedRoute } from "@/lib/route";
import { CategoryIcon } from "./CategoryIcon";

type Props = {
  language: Language;
  selected: Set<number>;
  activeEvent?: EventStop;
  route: PlannedRoute;
  startPoint?: MapPoint;
  currentPoint?: MapPoint;
  visited?: Set<number>;
  journeyActive?: boolean;
  nearbyStopId?: number;
  pickingStart: boolean;
  onToggle: (id: number) => void;
  onActive: (event?: EventStop) => void;
  onMapStart: (point: MapPoint) => void;
};

export function InteractiveMap({
  language,
  selected,
  activeEvent,
  route,
  startPoint,
  currentPoint,
  visited = new Set<number>(),
  journeyActive = false,
  nearbyStopId,
  pickingStart,
  onToggle,
  onActive,
  onMapStart,
}: Props) {
  const t = ui[language];
  const remainingSteps = journeyActive
    ? route.steps.filter((step) => !visited.has(step.stop.id))
    : route.steps;
  const routeOrigin = journeyActive ? currentPoint : startPoint;
  const points = [
    ...(routeOrigin ? [routeOrigin] : []),
    ...remainingSteps.map((step) => step.stop),
  ];
  const routePath = points.map((point) => `${point.x},${point.y}`).join(" ");

  return (
    <section className="map-shell" aria-label={t.map}>
      <div
        className={`map-canvas ${pickingStart ? "is-picking" : ""}`}
        onClick={(event) => {
          if (!pickingStart) return;
          const rect = event.currentTarget.getBoundingClientRect();
          onMapStart({
            x: ((event.clientX - rect.left) / rect.width) * 100,
            y: ((event.clientY - rect.top) / rect.height) * 100,
          });
        }}
      >
        {/* The illustrated base comes from the official public programme. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="map-image"
          src="/bormio-map.png"
          alt="Mappa illustrata del centro storico di Bormio"
        />

        {points.length > 1 && (
          <svg
            className="route-lines"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <polyline className="route-line-halo" points={routePath} />
            <polyline className="route-line-main" points={routePath} />
          </svg>
        )}

        {startPoint && !journeyActive && (
          <span
            className="start-marker"
            style={{ left: `${startPoint.x}%`, top: `${startPoint.y}%` }}
            aria-label={t.startTitle}
          >
            <MapPin size={16} fill="currentColor" />
          </span>
        )}

        {currentPoint && journeyActive && (
          <span
            className="current-location-marker"
            style={{ left: `${currentPoint.x}%`, top: `${currentPoint.y}%` }}
            aria-label={t.journeyActive}
          >
            <span />
            <Navigation size={14} fill="currentColor" />
          </span>
        )}

        {events.map((stop) => {
          const routeIndex = route.steps.findIndex(
            (step) => step.stop.id === stop.id,
          );
          const isSelected = selected.has(stop.id);
          const isVisited = visited.has(stop.id);
          const isNearby = nearbyStopId === stop.id;
          return (
            <button
              key={stop.id}
              className={`map-marker ${isSelected ? "is-selected" : ""} ${
                activeEvent?.id === stop.id ? "is-active" : ""
              } ${isVisited ? "is-visited" : ""} ${
                isNearby ? "is-nearby" : ""
              }`}
              style={{
                left: `${stop.x}%`,
                top: `${stop.y}%`,
                "--marker-color": isVisited
                  ? "var(--gold)"
                  : isNearby
                    ? "var(--copper)"
                    : isSelected
                      ? "var(--primary)"
                      : "var(--marker-default)",
              } as React.CSSProperties}
              onClick={(event) => {
                event.stopPropagation();
                onActive(stop);
              }}
              aria-label={`${stop.id}. ${eventTitle(stop, language)}${
                isVisited ? ` · ${t.journeyVisited}` : ""
              }`}
            >
              {isVisited ? (
                <Check size={13} strokeWidth={3} />
              ) : routeIndex >= 0 ? (
                routeIndex + 1
              ) : (
                stop.id
              )}
            </button>
          );
        })}

        {pickingStart && (
          <div className="pick-start-banner">
            <LocateFixed size={17} />
            {t.tapMap}
          </div>
        )}

        {activeEvent && (
          <article className="map-popover">
            <button
              className="icon-button popover-close"
              onClick={() => onActive(undefined)}
              aria-label="Chiudi"
            >
              <X size={17} />
            </button>
            <div className="event-number">#{activeEvent.id}</div>
            <div className="event-card-heading">
              <CategoryIcon category={activeEvent.categories[0]} />
              <div>
                <h3>{eventTitle(activeEvent, language)}</h3>
                <p>{activeEvent.host}</p>
              </div>
            </div>
            {activeEvent.timing && (
              <div className="time-row">
                {activeEvent.timing.map((time) => time.label).join(" / ")}
              </div>
            )}
            <button
              className={`button ${selected.has(activeEvent.id) ? "button-light" : "button-primary"}`}
              onClick={() => onToggle(activeEvent.id)}
            >
              {selected.has(activeEvent.id) ? t.remove : t.add}
            </button>
          </article>
        )}
      </div>
      <div className="map-footer">
        <span>{journeyActive ? t.journeyActive : t.mapHint}</span>
        {journeyActive ? (
          <span>
            {route.steps.filter((step) => visited.has(step.stop.id)).length}/
            {route.steps.length} {t.journeyVisited}
          </span>
        ) : route.steps.length > 0 ? (
          <span>
            {route.steps.length} {route.steps.length === 1 ? t.stop : t.stops} ·{" "}
            {formatMinutes(route.finishAt)}
          </span>
        ) : null}
      </div>
    </section>
  );
}
