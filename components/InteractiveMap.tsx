"use client";

import {
  Check,
  LocateFixed,
  MapPin,
  Minus,
  Navigation,
  Plus,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
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
  const [zoom, setZoom] = useState(1);
  const viewportRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const remainingSteps = journeyActive
    ? route.steps.filter((step) => !visited.has(step.stop.id))
    : route.steps;
  const routeOrigin = journeyActive ? currentPoint : startPoint;
  const points = [
    ...(routeOrigin ? [routeOrigin] : []),
    ...remainingSteps.map((step) => step.stop),
  ];
  const routePath = points.map((point) => `${point.x},${point.y}`).join(" ");

  function changeZoom(delta: number) {
    const viewport = viewportRef.current;
    const nextZoom = Math.max(1, Math.min(3, zoom + delta));
    if (!viewport || nextZoom === zoom) return;

    const centerX =
      (viewport.scrollLeft + viewport.clientWidth / 2) /
      Math.max(viewport.scrollWidth, 1);
    const centerY =
      (viewport.scrollTop + viewport.clientHeight / 2) /
      Math.max(viewport.scrollHeight, 1);

    setZoom(nextZoom);
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        viewport.scrollLeft =
          centerX * viewport.scrollWidth - viewport.clientWidth / 2;
        viewport.scrollTop =
          centerY * viewport.scrollHeight - viewport.clientHeight / 2;
      });
    });
  }

  function resetZoom() {
    setZoom(1);
    window.requestAnimationFrame(() => {
      viewportRef.current?.scrollTo({ left: 0, top: 0, behavior: "smooth" });
    });
  }

  return (
    <section className="map-shell" aria-label={t.map}>
      <div className="map-frame">
        <div
          ref={viewportRef}
          className={`map-canvas ${pickingStart ? "is-picking" : ""}`}
        >
          <div
            ref={stageRef}
            className="map-stage"
            style={{ width: `${zoom * 100}%` }}
            onDoubleClick={() => changeZoom(0.5)}
            onClick={(event) => {
              if (!pickingStart) return;
              const rect = stageRef.current?.getBoundingClientRect();
              if (!rect) return;
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
              draggable={false}
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
          </div>
        </div>

        <div className="map-zoom-controls" aria-label={t.mapZoom}>
          <button
            type="button"
            onClick={() => changeZoom(-0.5)}
            disabled={zoom === 1}
            aria-label={t.mapZoomOut}
          >
            <Minus size={18} />
          </button>
          <button
            type="button"
            className="map-zoom-level"
            onClick={resetZoom}
            disabled={zoom === 1}
            aria-label={t.mapZoomReset}
          >
            {zoom}×
          </button>
          <button
            type="button"
            onClick={() => changeZoom(0.5)}
            disabled={zoom === 3}
            aria-label={t.mapZoomIn}
          >
            <Plus size={18} />
          </button>
        </div>

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
