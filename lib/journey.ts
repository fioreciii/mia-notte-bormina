import { Category, EventStop } from "./events";
import { Language } from "./i18n";
import { MapPoint, distanceMeters } from "./route";

export const AUTO_VISIT_DELAY_MS = 7000;
export const MAX_AUTO_VISIT_ACCURACY_METERS = 45;

export function arrivalRadiusMeters(accuracyMeters?: number) {
  if (!accuracyMeters) return 26;
  return Math.max(24, Math.min(34, accuracyMeters * 0.75));
}

export function nearestUnvisitedStop(
  stops: EventStop[],
  visited: Set<number>,
  point?: MapPoint,
) {
  if (!point) return undefined;

  return stops
    .filter((stop) => !visited.has(stop.id))
    .map((stop) => ({
      stop,
      distance: distanceMeters(point, stop),
    }))
    .sort((a, b) => a.distance - b.distance)[0];
}

const profileLabels: Record<
  Language,
  Record<Category | "mixed", { name: string; line: string }>
> = {
  it: {
    food: { name: "Cacciatore di sapori", line: "Hai assaggiato Bormio passo dopo passo." },
    music: { name: "Anima della notte", line: "Hai seguito il ritmo fino all’ultima tappa." },
    show: { name: "Cercatore di meraviglie", line: "Fuoco, scena e sorprese hanno guidato la tua notte." },
    kids: { name: "Esploratore in famiglia", line: "Una notte di giochi, storie e scoperte condivise." },
    culture: { name: "Custode di storie", line: "Hai incontrato l’anima artigiana di Bormio." },
    shopping: { name: "Curioso di Bormio", line: "Hai scoperto dettagli e botteghe fuori dal comune." },
    mixed: { name: "Esploratore della Notte", line: "Hai costruito una Bormio tutta tua." },
  },
  en: {
    food: { name: "Flavour hunter", line: "You tasted Bormio one stop at a time." },
    music: { name: "Soul of the night", line: "You followed the rhythm to the final stop." },
    show: { name: "Wonder seeker", line: "Fire, performance and surprises led your night." },
    kids: { name: "Family explorer", line: "A night of games, stories and shared discoveries." },
    culture: { name: "Keeper of stories", line: "You met Bormio’s creative, handmade soul." },
    shopping: { name: "Bormio curious", line: "You found unusual details and local shops." },
    mixed: { name: "Night explorer", line: "You made Bormio entirely your own." },
  },
  es: {
    food: { name: "Cazador de sabores", line: "Saboreaste Bormio parada a parada." },
    music: { name: "Alma de la noche", line: "Seguiste el ritmo hasta la última parada." },
    show: { name: "Buscador de maravillas", line: "Fuego, escena y sorpresas guiaron tu noche." },
    kids: { name: "Explorador en familia", line: "Una noche de juegos, historias y descubrimientos." },
    culture: { name: "Guardián de historias", line: "Conociste el alma artesanal de Bormio." },
    shopping: { name: "Curioso de Bormio", line: "Descubriste detalles y tiendas fuera de lo común." },
    mixed: { name: "Explorador de la noche", line: "Construiste una Bormio completamente tuya." },
  },
  de: {
    food: { name: "Genussjäger", line: "Du hast Bormio Station für Station probiert." },
    music: { name: "Seele der Nacht", line: "Du bist dem Rhythmus bis zur letzten Station gefolgt." },
    show: { name: "Wundersucher", line: "Feuer, Bühne und Überraschungen führten durch deine Nacht." },
    kids: { name: "Familienentdecker", line: "Eine Nacht voller Spiele, Geschichten und Entdeckungen." },
    culture: { name: "Hüter der Geschichten", line: "Du hast Bormios handwerkliche Seele kennengelernt." },
    shopping: { name: "Bormio-Neugieriger", line: "Du hast besondere Details und Läden entdeckt." },
    mixed: { name: "Nachtentdecker", line: "Du hast dir dein ganz eigenes Bormio geschaffen." },
  },
};

export function journeyProfile(stops: EventStop[], language: Language) {
  const counts = new Map<Category, number>();
  for (const stop of stops) {
    for (const category of stop.categories) {
      counts.set(category, (counts.get(category) ?? 0) + 1);
    }
  }

  const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const distinct = ranked.length;
  const dominant =
    ranked[0] &&
    (distinct <= 2 || ranked[0][1] >= (ranked[1]?.[1] ?? 0) + 2)
      ? ranked[0][0]
      : "mixed";

  return profileLabels[language][dominant];
}
