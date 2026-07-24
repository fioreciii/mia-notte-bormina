"use client";

import {
  Check,
  CheckCircle2,
  LocateFixed,
  MapPinned,
  Navigation,
  Pause,
  Play,
  RotateCcw,
  Share2,
  Square,
} from "lucide-react";
import { useState } from "react";
import { Language, eventTitle, ui } from "@/lib/i18n";
import { journeyProfile } from "@/lib/journey";
import { MapPoint, PlannedRoute, distanceMeters } from "@/lib/route";
import { CategoryIcon } from "./CategoryIcon";

function formatDistance(meters: number) {
  if (meters < 950) return `${Math.max(0, Math.round(meters / 10) * 10)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

function wrapCanvasText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (context.measureText(candidate).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  lines.forEach((item, index) =>
    context.fillText(item, x, y + index * lineHeight),
  );
}

async function createPassportFile({
  profile,
  visitedCount,
}: {
  profile: { name: string; line: string };
  visitedCount: number;
}) {
  await document.fonts.ready;
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1350;
  const context = canvas.getContext("2d");
  if (!context) return undefined;

  context.fillStyle = "#20231f";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#d03a19";
  context.fillRect(0, 0, 46, canvas.height);

  context.strokeStyle = "rgba(248, 246, 237, 0.12)";
  context.lineWidth = 3;
  for (let size = 520; size <= 820; size += 75) {
    context.beginPath();
    context.arc(835, 260, size / 2, 0, Math.PI * 2);
    context.stroke();
  }

  context.fillStyle = "#ff8063";
  context.font = '600 36px "Arizona Sans", sans-serif';
  context.fillText("25 · 07 · 2026   BORMIO", 110, 140);

  context.fillStyle = "#f8f6ed";
  context.font = '500 110px "Arizona Mix", serif';
  context.fillText("La mia", 110, 310);
  context.fillStyle = "#ff8063";
  context.fillText("Notte Bormina", 110, 430);

  context.save();
  context.translate(540, 765);
  context.rotate(-0.06);
  context.strokeStyle = "#afc46d";
  context.lineWidth = 8;
  context.beginPath();
  context.arc(0, 0, 230, 0, Math.PI * 2);
  context.stroke();
  context.beginPath();
  context.arc(0, 0, 205, 0, Math.PI * 2);
  context.stroke();
  context.fillStyle = "#afc46d";
  context.textAlign = "center";
  context.font = '600 32px "Arizona Sans", sans-serif';
  context.fillText(`${visitedCount} TAPPE VISITATE`, 0, -55);
  context.fillStyle = "#f8f6ed";
  context.font = '520 54px "Arizona Mix", serif';
  wrapCanvasText(context, profile.name, 0, 30, 340, 58);
  context.restore();

  context.fillStyle = "#c2cabf";
  context.font = '430 34px "Arizona Sans", sans-serif';
  wrapCanvasText(context, profile.line, 110, 1150, 820, 46);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/png"),
  );
  return blob
    ? new File([blob], "la-mia-notte-bormina.png", { type: "image/png" })
    : undefined;
}

export function JourneyPanel({
  route,
  language,
  active,
  paused,
  visited,
  currentPoint,
  accuracyMeters,
  nearbyStopId,
  locationMessage,
  onStart,
  onPause,
  onContinue,
  onEnd,
  onReset,
  onMarkVisited,
  onOpenMap,
}: {
  route: PlannedRoute;
  language: Language;
  active: boolean;
  paused: boolean;
  visited: Set<number>;
  currentPoint?: MapPoint;
  accuracyMeters?: number;
  nearbyStopId?: number;
  locationMessage?: string;
  onStart: () => void;
  onPause: () => void;
  onContinue: () => void;
  onEnd: () => void;
  onReset: () => void;
  onMarkVisited: (id: number) => void;
  onOpenMap: () => void;
}) {
  const t = ui[language];
  const [passportShared, setPassportShared] = useState(false);
  const visitedStops = route.steps
    .filter((step) => visited.has(step.stop.id))
    .map((step) => step.stop);
  const visitedCount = visitedStops.length;
  const complete = route.steps.length > 0 && visitedCount === route.steps.length;
  const nextStep = route.steps.find((step) => !visited.has(step.stop.id));
  const nearbyStop = route.steps.find(
    (step) => step.stop.id === nearbyStopId,
  )?.stop;
  const focusStop = nearbyStop ?? nextStep?.stop;
  const distance =
    focusStop && currentPoint
      ? distanceMeters(currentPoint, focusStop)
      : undefined;
  const profile = journeyProfile(visitedStops, language);

  async function sharePassport() {
    const url = window.location.href;
    const file = await createPassportFile({ profile, visitedCount });
    const shareData: ShareData = {
      title: "La mia Notte Bormina",
      text: `${profile.name} · ${visitedCount} ${t.stops}`,
      url,
      ...(file ? { files: [file] } : {}),
    };

    const canShareFile = Boolean(
      file && navigator.canShare?.({ files: [file] }),
    );
    if (navigator.share) {
      await navigator
        .share(
          canShareFile
            ? shareData
            : {
                title: shareData.title,
                text: shareData.text,
                url: shareData.url,
              },
        )
        .catch(() => undefined);
    } else {
      await navigator.clipboard.writeText(`${shareData.text} · ${url}`);
    }
    setPassportShared(true);
    window.setTimeout(() => setPassportShared(false), 2200);
  }

  if (complete) {
    return (
      <section className="journey-complete" aria-live="polite">
        <div className="journey-seal" aria-hidden="true">
          <span>{visitedCount}</span>
          <small>{t.journeyVisited}</small>
        </div>
        <p className="section-kicker">{t.journeyMode}</p>
        <h2>{t.journeyCompleteTitle}</h2>
        <strong className="journey-profile-name">{profile.name}</strong>
        <p>{profile.line}</p>
        <p className="journey-complete-note">{t.journeyCompleteBody}</p>
        <div className="journey-complete-actions">
          <button className="button button-primary" onClick={sharePassport}>
            {passportShared ? <Check size={18} /> : <Share2 size={18} />}
            {passportShared
              ? t.journeyPassportShared
              : t.journeySharePassport}
          </button>
          <button className="button button-light" onClick={onReset}>
            <RotateCcw size={17} />
            {t.journeyReset}
          </button>
        </div>
      </section>
    );
  }

  if (!active) {
    return (
      <section className="journey-entry">
        <div className="journey-entry-icon" aria-hidden="true">
          <LocateFixed size={25} />
        </div>
        <div>
          <p className="section-kicker">{t.journeyMode}</p>
          <h2>{t.journeyIntro}</h2>
          <p>{t.journeyIntroHelp}</p>
        </div>
        <button className="button button-primary" onClick={onStart}>
          <Navigation size={18} />
          {visitedCount > 0 ? t.journeyResume : t.journeyStart}
        </button>
      </section>
    );
  }

  return (
    <section className="journey-panel" aria-live="polite">
      <div className="journey-status-row">
        <span className={`journey-live-dot ${paused ? "is-paused" : ""}`} />
        <strong>{paused ? t.journeyPaused : t.journeyActive}</strong>
        <span>
          {visitedCount}/{route.steps.length}
        </span>
      </div>

      <div className="journey-progress" aria-label={t.journeyProgress}>
        <span
          style={{
            width: `${(visitedCount / Math.max(1, route.steps.length)) * 100}%`,
          }}
        />
      </div>

      <div className={`journey-gps ${locationMessage ? "has-warning" : ""}`}>
        <LocateFixed size={16} />
        <span>
          {locationMessage ||
            (paused
              ? t.journeyPaused
              : currentPoint && accuracyMeters
                ? accuracyMeters <= 45
                  ? `${t.journeyGps} ${Math.round(accuracyMeters)} m`
                  : `${t.journeyGpsWeak} · ±${Math.round(accuracyMeters)} m`
                : t.journeyLocating)}
        </span>
      </div>

      {focusStop && (
        <article className={`journey-next ${nearbyStop ? "is-arrived" : ""}`}>
          <div className="journey-next-topline">
            <span>{nearbyStop ? t.journeyArrived : t.journeyNext}</span>
            {distance !== undefined && (
              <strong>
                {formatDistance(distance)} {t.journeyDistance}
              </strong>
            )}
          </div>
          <div className="event-card-heading">
            <CategoryIcon category={focusStop.categories[0]} />
            <div>
              <h3>{eventTitle(focusStop, language)}</h3>
              <p>{focusStop.host}</p>
            </div>
          </div>
          {nearbyStop && (
            <p className="journey-arrival-note">
              <CheckCircle2 size={16} />
              {t.journeyAutoVisit}
            </p>
          )}
          <div className="journey-primary-actions">
            <button
              className="button button-primary"
              onClick={() => onMarkVisited(focusStop.id)}
            >
              <CheckCircle2 size={18} />
              {t.journeyMarkVisited}
            </button>
            <button className="button button-light" onClick={onOpenMap}>
              <MapPinned size={18} />
              {t.journeyOpenMap}
            </button>
          </div>
        </article>
      )}

      <div className="journey-stop-strip" aria-label={t.journeyProgress}>
        {route.steps.map((step, index) => {
          const isVisited = visited.has(step.stop.id);
          return (
            <span
              key={step.stop.id}
              className={isVisited ? "is-visited" : ""}
              title={eventTitle(step.stop, language)}
            >
              {isVisited ? <Check size={13} /> : index + 1}
            </span>
          );
        })}
      </div>

      <div className="journey-secondary-actions">
        {paused ? (
          <button className="text-button" onClick={onContinue}>
            <Play size={15} />
            {t.journeyContinue}
          </button>
        ) : (
          <button className="text-button" onClick={onPause}>
            <Pause size={15} />
            {t.journeyPause}
          </button>
        )}
        <button className="text-button" onClick={onEnd}>
          <Square size={14} />
          {t.journeyEnd}
        </button>
      </div>
    </section>
  );
}
