"use client";

import { Check, MapPinned, MapPin, Navigation } from "lucide-react";
import { Language, eventTitle, ui } from "@/lib/i18n";
import { MapPoint, PlannedRoute } from "@/lib/route";

export function RouteMapPreview({
  route,
  startPoint,
  currentPoint,
  visited = new Set<number>(),
  journeyActive = false,
  language,
  onOpenMap,
}: {
  route: PlannedRoute;
  startPoint?: MapPoint;
  currentPoint?: MapPoint;
  visited?: Set<number>;
  journeyActive?: boolean;
  language: Language;
  onOpenMap: () => void;
}) {
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
    <section className="route-map-preview" aria-labelledby="route-map-title">
      <div className="route-map-preview-heading">
        <div>
          <p>{t.routeReady}</p>
          <h2 id="route-map-title">{t.routeMapTitle}</h2>
        </div>
        <button type="button" onClick={onOpenMap}>
          <MapPinned size={16} />
          {t.routeMapOpen}
        </button>
      </div>

      <div className="route-map-preview-canvas">
        {/* The illustrated base comes from the official public programme. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/bormio-map.png"
          alt={t.routeMapTitle}
          draggable={false}
        />

        {points.length > 1 && (
          <svg
            className="route-lines route-preview-lines"
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
            className="start-marker route-preview-start"
            style={{ left: `${startPoint.x}%`, top: `${startPoint.y}%` }}
            aria-label={t.startTitle}
          >
            <MapPin size={13} fill="currentColor" />
          </span>
        )}

        {currentPoint && journeyActive && (
          <span
            className="current-location-marker route-preview-current"
            style={{ left: `${currentPoint.x}%`, top: `${currentPoint.y}%` }}
            aria-label={t.journeyActive}
          >
            <span />
            <Navigation size={12} fill="currentColor" />
          </span>
        )}

        {route.steps.map((step, index) => (
          <span
            key={step.stop.id}
            className={`route-preview-marker ${
              visited.has(step.stop.id) ? "is-visited" : ""
            }`}
            style={{
              left: `${step.stop.x}%`,
              top: `${step.stop.y}%`,
            }}
            title={`${index + 1}. ${eventTitle(step.stop, language)}`}
          >
            {visited.has(step.stop.id) ? (
              <Check size={12} strokeWidth={3} />
            ) : (
              index + 1
            )}
          </span>
        ))}
      </div>
    </section>
  );
}
