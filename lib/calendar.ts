import { EventStop } from "./events";
import { Language, eventTitle } from "./i18n";
import { PlannedRoute } from "./route";

function icsDate(minutes: number) {
  const date = new Date(2026, 6, 25, 0, 0, 0);
  date.setMinutes(minutes);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${y}${m}${d}T${h}${min}00`;
}

function escape(value: string) {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll("\n", "\\n")
    .replaceAll(",", "\\,")
    .replaceAll(";", "\\;");
}

function downloadFile(file: string, filename: string) {
  const blob = new Blob([file], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1200);
}

export function downloadRouteCalendar(
  route: PlannedRoute,
  language: Language,
) {
  const events = route.steps
    .map((step, index) => {
      const title = eventTitle(step.stop, language);
      return [
        "BEGIN:VEVENT",
        `UID:notte-bormina-${step.stop.id}-${index}@mia-notte-bormina`,
        `DTSTAMP:${icsDate(0)}Z`,
        `DTSTART;TZID=Europe/Rome:${icsDate(step.arrival)}`,
        `DTEND;TZID=Europe/Rome:${icsDate(step.departure)}`,
        `SUMMARY:${escape(`${index + 1}. ${title}`)}`,
        `LOCATION:${escape(`${step.stop.host}, Bormio`)}`,
        `DESCRIPTION:${escape(`Tappa ${step.stop.id} · ${step.stop.host}${step.timingLabel ? ` · Orario ufficiale ${step.timingLabel}` : ""}`)}`,
        "END:VEVENT",
      ].join("\r\n");
    })
    .join("\r\n");

  const file = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//La mia Notte Bormina//Route Planner//IT",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    events,
    "END:VCALENDAR",
  ].join("\r\n");

  downloadFile(file, "la-mia-notte-bormina.ics");
}

export function downloadStopCalendar(stop: EventStop, language: Language) {
  const windows = stop.timing ?? [
    { start: 17 * 60, end: 24 * 60, label: "17.00–24.00" },
  ];
  const title = eventTitle(stop, language);
  const entries = windows
    .map((window, index) =>
      [
        "BEGIN:VEVENT",
        `UID:notte-bormina-stop-${stop.id}-${index}@mia-notte-bormina`,
        `DTSTAMP:${icsDate(0)}Z`,
        `DTSTART;TZID=Europe/Rome:${icsDate(window.start)}`,
        `DTEND;TZID=Europe/Rome:${icsDate(window.end)}`,
        `SUMMARY:${escape(title)}`,
        `LOCATION:${escape(`${stop.host}, Bormio`)}`,
        `DESCRIPTION:${escape(`Tappa ${stop.id} · ${stop.host} · ${window.label}`)}`,
        "END:VEVENT",
      ].join("\r\n"),
    )
    .join("\r\n");

  const file = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//La mia Notte Bormina//Stop//IT",
    "CALSCALE:GREGORIAN",
    entries,
    "END:VCALENDAR",
  ].join("\r\n");
  downloadFile(file, `notte-bormina-${stop.id}.ics`);
}
