"use client";

import { CalendarPlus, Check, Clock3, Plus } from "lucide-react";
import { downloadStopCalendar } from "@/lib/calendar";
import { EventStop } from "@/lib/events";
import { Language, categoryLabel, eventTitle, ui } from "@/lib/i18n";
import { CategoryIcon } from "./CategoryIcon";

export function EventCard({
  event,
  language,
  selected,
  onToggle,
  onLocate,
}: {
  event: EventStop;
  language: Language;
  selected: boolean;
  onToggle: () => void;
  onLocate: () => void;
}) {
  const t = ui[language];
  return (
    <article className={`event-card ${selected ? "is-selected" : ""}`}>
      <button className="event-card-main" onClick={onLocate}>
        <div className="event-card-topline">
          <span className="event-number">#{event.id}</span>
          <span className="event-category">
            {categoryLabel(event.categories[0], language)}
          </span>
        </div>
        <div className="event-card-heading">
          <CategoryIcon category={event.categories[0]} size={20} />
          <div>
            <h3>{eventTitle(event, language)}</h3>
            <p>{event.host}</p>
          </div>
        </div>
        {event.timing && (
          <div className="time-row">
            <Clock3 size={14} />
            {event.timing.map((time) => time.label).join(" · ")}
          </div>
        )}
      </button>
      <div className="event-card-actions">
        <button
          className={`select-stop ${selected ? "is-selected" : ""}`}
          onClick={onToggle}
          aria-label={selected ? t.remove : t.add}
        >
          {selected ? <Check size={18} /> : <Plus size={18} />}
        </button>
        {event.timing && (
          <button
            className="calendar-stop"
            onClick={() => downloadStopCalendar(event, language)}
            aria-label={
              language === "it"
                ? "Aggiungi al calendario"
                : language === "en"
                  ? "Add to calendar"
                  : language === "es"
                    ? "Añadir al calendario"
                    : "Zum Kalender hinzufügen"
            }
          >
            <CalendarPlus size={15} />
          </button>
        )}
      </div>
    </article>
  );
}
