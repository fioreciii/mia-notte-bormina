"use client";

import { useEffect, useMemo, useState } from "react";
import { Language } from "@/lib/i18n";

const EVENT_START = new Date("2026-07-25T17:00:00+02:00").getTime();
const EVENT_END = new Date("2026-07-26T02:00:00+02:00").getTime();

const countdownCopy: Record<
  Language,
  {
    before: string;
    date: string;
    day: string;
    days: string;
    hours: string;
    minutes: string;
    after: string;
  }
> = {
  it: {
    before: "Ci vediamo tra",
    date: "25 luglio · Bormio",
    day: "giorno",
    days: "giorni",
    hours: "ore",
    minutes: "minuti",
    after: "Grazie per questa notte, Bormio",
  },
  en: {
    before: "See you in",
    date: "25 July · Bormio",
    day: "day",
    days: "days",
    hours: "hours",
    minutes: "minutes",
    after: "Thank you for this night, Bormio",
  },
  es: {
    before: "Nos vemos en",
    date: "25 de julio · Bormio",
    day: "día",
    days: "días",
    hours: "horas",
    minutes: "minutos",
    after: "Gracias por esta noche, Bormio",
  },
  de: {
    before: "Wir sehen uns in",
    date: "25. Juli · Bormio",
    day: "Tag",
    days: "Tagen",
    hours: "Stunden",
    minutes: "Minuten",
    after: "Danke für diese Nacht, Bormio",
  },
};

const greetings = [
  { language: "IT", text: "Benvenuti a Bormio" },
  { language: "EN", text: "Welcome to Bormio" },
  { language: "ES", text: "Bienvenidos a Bormio" },
  { language: "DE", text: "Willkommen in Bormio" },
] as const;

function countdownParts(milliseconds: number) {
  const totalMinutes = Math.max(0, Math.ceil(milliseconds / 60_000));
  const days = Math.floor(totalMinutes / (24 * 60));
  const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
  const minutes = totalMinutes % 60;
  return { days, hours, minutes };
}

export function EventCountdown({ language }: { language: Language }) {
  const [now, setNow] = useState<number>();
  const [greetingIndex, setGreetingIndex] = useState(0);
  const copy = countdownCopy[language];

  useEffect(() => {
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const phase =
    now === undefined
      ? "waiting"
      : now < EVENT_START
        ? "countdown"
        : now < EVENT_END
          ? "live"
          : "after";

  useEffect(() => {
    if (phase !== "live") return;
    const timer = window.setInterval(
      () => setGreetingIndex((current) => (current + 1) % greetings.length),
      4_200,
    );
    return () => window.clearInterval(timer);
  }, [phase]);

  const remaining = useMemo(
    () => countdownParts(EVENT_START - (now ?? EVENT_START)),
    [now],
  );

  if (phase === "live") {
    const greeting = greetings[greetingIndex];
    return (
      <div className="event-countdown is-live" aria-label={greeting.text}>
        <span className="event-countdown-language">{greeting.language}</span>
        <strong key={greeting.language}>{greeting.text}</strong>
      </div>
    );
  }

  if (phase === "after") {
    return (
      <div className="event-countdown is-after">
        <span>Notte Bormina · 2026</span>
        <strong>{copy.after}</strong>
      </div>
    );
  }

  if (phase === "waiting") {
    return (
      <div className="event-countdown">
        <span>Notte Bormina</span>
        <strong>{copy.date}</strong>
      </div>
    );
  }

  const fullCountdown = [
    remaining.days
      ? `${remaining.days} ${remaining.days === 1 ? copy.day : copy.days}`
      : "",
    `${remaining.hours} ${copy.hours}`,
    `${remaining.minutes} ${copy.minutes}`,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div
      className="event-countdown"
      aria-label={`${copy.before} ${fullCountdown}`}
    >
      <span>{copy.before}</span>
      <strong>
        {remaining.days > 0 && (
          <>
            {remaining.days}{" "}
            {remaining.days === 1 ? copy.day : copy.days} <i>·</i>{" "}
          </>
        )}
        {remaining.hours}h <i>·</i> {remaining.minutes}m
      </strong>
    </div>
  );
}
