export type Category =
  | "food"
  | "music"
  | "show"
  | "kids"
  | "culture"
  | "shopping";

export type TimeWindow = {
  start: number;
  end: number;
  label: string;
  fixed?: boolean;
};

export type EventStop = {
  id: number;
  title: string;
  host: string;
  categories: Category[];
  x: number;
  y: number;
  timing?: TimeWindow[];
  duration?: number;
  note?: string;
};

const hm = (hour: number, minute = 0) => hour * 60 + minute;

export const categoryMeta: Record<
  Category,
  { label: string; short: string; color: string; asset: string }
> = {
  food: {
    label: "Gusto",
    short: "Gusto",
    color: "#d95f3f",
    asset: "/event-icons/food.webp",
  },
  music: {
    label: "Musica",
    short: "Musica",
    color: "#176b83",
    asset: "/event-icons/music.webp",
  },
  show: {
    label: "Spettacoli",
    short: "Show",
    color: "#aa3e5e",
    asset: "/event-icons/show.webp",
  },
  kids: {
    label: "Bambini",
    short: "Kids",
    color: "#4d7b4b",
    asset: "/event-icons/kids.webp",
  },
  culture: {
    label: "Arte e tradizione",
    short: "Cultura",
    color: "#9a6a27",
    asset: "/event-icons/culture.webp",
  },
  shopping: {
    label: "Shopping",
    short: "Shopping",
    color: "#785b89",
    asset: "/event-icons/shopping.webp",
  },
};

export const events: EventStop[] = [
  { id: 1, title: "Trecce e colori", host: "Sarah Hairstyling & Pellerossa calzature", categories: ["kids", "shopping"], x: 62.4, y: 12.5 },
  { id: 2, title: "Panino, vino e fisarmoniche in concerto", host: "Il Fiume in Town", categories: ["music", "food"], x: 65.7, y: 18.5, timing: [{ start: hm(18), end: hm(21), label: "18.00–21.00" }] },
  { id: 3, title: "Super promo: tutto al 50%", host: "Mercatino dell’Usato", categories: ["shopping"], x: 68.5, y: 22.1 },
  { id: 4, title: "Dettagli d’inverno", host: "Anna Mode", categories: ["shopping"], x: 73.4, y: 24.2 },
  { id: 5, title: "Carne cruda & Birra Reit Weizen", host: "Tagliafood", categories: ["food"], x: 74.6, y: 26.4 },
  { id: 6, title: "Coni di polenta fritta, birra e Spritz", host: "Bar Torre", categories: ["food"], x: 72.7, y: 28.2 },
  { id: 7, title: "Valtellina in un sorso e un morso", host: "Osteria la Bajona", categories: ["food"], x: 77.6, y: 25.9, timing: [{ start: hm(17), end: hm(22), label: "17.00–22.00" }], note: "Sciatt & bollicine" },
  { id: 8, title: "Spettacoli di fuoco", host: "Zariska Fire", categories: ["show", "kids"], x: 75.8, y: 29.3, timing: [{ start: hm(21, 50), end: hm(22, 10), label: "21.50", fixed: true }, { start: hm(23, 15), end: hm(23, 35), label: "23.15", fixed: true }] },
  { id: 9, title: "I mestieri: ricamo bormino e ciabattino", host: "Bormio Ricama / Donato", categories: ["culture"], x: 78.1, y: 36.5, timing: [{ start: hm(17), end: hm(22), label: "17.00–22.00" }] },
  { id: 10, title: "I mestieri: tessitura e filatura della lana", host: "Museo Vallivo Valfurva", categories: ["culture"], x: 78.3, y: 38.9, timing: [{ start: hm(17), end: hm(22), label: "17.00–22.00" }] },
  { id: 11, title: "Live music", host: "Max Zen", categories: ["music"], x: 76.4, y: 30.9, timing: [{ start: hm(18), end: hm(21), label: "18.00–21.00" }] },
  { id: 12, title: "Spettacolo dei burattini", host: "Il burattinaio Andrea", categories: ["kids", "show"], x: 62.3, y: 30.8, timing: [{ start: hm(17), end: hm(17, 30), label: "17.00", fixed: true }, { start: hm(21), end: hm(21, 30), label: "21.00", fixed: true }] },
  { id: 13, title: "Mountain bike e Pop Corn", host: "Scuola Mountain Bike Bormio", categories: ["kids"], x: 43.1, y: 19.6 },
  { id: 14, title: "Smashed Burger, birra e Spritz", host: "Be White", categories: ["food"], x: 43.1, y: 23.6 },
  { id: 15, title: "Baby dance", host: "Animando", categories: ["kids", "music"], x: 43.6, y: 13.8, timing: [{ start: hm(20, 30), end: hm(21, 30), label: "20.30–21.30" }] },
  { id: 16, title: "Live speciale tributo 883", host: "Mondo Max", categories: ["music", "show"], x: 40.7, y: 23.3, timing: [{ start: hm(22), end: hm(23, 30), label: "22.00", fixed: true }] },
  { id: 17, title: "DJ set", host: "Be Club", categories: ["music"], x: 40.6, y: 25.6, timing: [{ start: hm(24), end: hm(26), label: "24.00–02.00" }] },
  { id: 18, title: "Carving Art: intaglio live", host: "Marco Peloni", categories: ["culture", "show"], x: 31.7, y: 27.8 },
  { id: 19, title: "Birra Reit alla segale, Gin Invitti e live music", host: "Osteria dei Magri · Luca Zazzi", categories: ["music", "food"], x: 34.2, y: 25.9 },
  { id: 20, title: "Le fiabe colorate", host: "Biblioteca Comunale", categories: ["kids", "culture"], x: 26.7, y: 21.3, timing: [{ start: hm(18), end: hm(19), label: "18.00–19.00" }, { start: hm(20, 30), end: hm(21, 30), label: "20.30–21.30" }] },
  { id: 21, title: "Degustazioni & Fisa&Friends", host: "Negozio Leggero", categories: ["food", "music", "culture"], x: 21.3, y: 15.3, note: "Canti popolari" },
  { id: 22, title: "Visita al birrificio, Sciatt e birra", host: "Pasteria Secchi · Birrificio Reit", categories: ["food", "culture"], x: 6.6, y: 10.3 },
  { id: 23, title: "Walk-in Notte Bormina", host: "Nagua Art Tattoo", categories: ["culture", "shopping"], x: 88.5, y: 41.5 },
  { id: 24, title: "Una sera da Fly Tier", host: "Patagonia Store", categories: ["culture", "kids"], x: 74.1, y: 39.6 },
  { id: 25, title: "Aperitivo e stuzzichini", host: "Ottica Occhi", categories: ["food"], x: 71.0, y: 39.6 },
  { id: 26, title: "Special promo Notte Bormina", host: "Crazy Idea", categories: ["shopping"], x: 70.9, y: 41.4 },
  { id: 27, title: "Aperi-DJ", host: "Skiata Cafè", categories: ["music", "food"], x: 70.0, y: 37.5 },
  { id: 28, title: "Stuzzichini di frutta e verdura", host: "Vanari", categories: ["food"], x: 69.3, y: 41.4 },
  { id: 29, title: "Panino con i calamari", host: "The Steak House Bormio", categories: ["food"], x: 64.7, y: 44.4 },
  { id: 30, title: "Parole e immagini nei libri di montagna", host: "Alpinia Editrice", categories: ["culture"], x: 58.2, y: 43.3 },
  { id: 31, title: "Sculture illuminanti", host: "Igor Salvadori", categories: ["culture", "show"], x: 56.7, y: 43.3 },
  { id: 32, title: "Il sorriso è gratis, il regalino anche", host: "Gran Bazar", categories: ["shopping"], x: 52.0, y: 45.4 },
  { id: 33, title: "Karaoke & Slot Fruit", host: "CMP", categories: ["music", "show"], x: 49.5, y: 45.9 },
  { id: 34, title: "Esposizione quadri di Glicerio", host: "Rino Sport", categories: ["culture"], x: 46.1, y: 43.5 },
  { id: 35, title: "Gioielli fatti a mano con amore dalla Ely", host: "Oreficeria Valentino Valgoi", categories: ["shopping", "culture"], x: 46.0, y: 46.0 },
  { id: 36, title: "Shopping & Gift Night", host: "Stracci Capricci", categories: ["shopping"], x: 43.8, y: 45.2 },
  { id: 37, title: "Love around the world by Vincent", host: "Kammi", categories: ["music"], x: 44.3, y: 43.5 },
  { id: 38, title: "Laboratorio di miele", host: "Apicoltura Lorena Sertorelli", categories: ["food", "culture"], x: 42.6, y: 43.3 },
  { id: 39, title: "DJ set Bruno Ligari e Hot Dog", host: "Bar Bormio", categories: ["music", "food"], x: 35.3, y: 45.9 },
  { id: 40, title: "Degustazione di marmellate", host: "La Sceleira", categories: ["food"], x: 33.5, y: 45.8 },
  { id: 41, title: "Gioco Quiz", host: "QC Terme", categories: ["show", "kids"], x: 31.7, y: 45.8 },
  { id: 42, title: "“Passato presente”: libro di poesie", host: "Laura Romoli", categories: ["culture"], x: 11.4, y: 49.4, timing: [{ start: hm(18), end: hm(19), label: "18.00", fixed: true }] },
  { id: 43, title: "Frittelle di mele di Piatta", host: "San Vitale shop’s", categories: ["food"], x: 23.8, y: 43.2 },
  { id: 44, title: "Indovina, pesca e festeggi", host: "Trabucchi calzature", categories: ["kids", "shopping"], x: 18.5, y: 46.7 },
  { id: 45, title: "Storia dello sci: esposizione storica", host: "Ski Trab", categories: ["culture"], x: 19.7, y: 44.6 },
  { id: 46, title: "Bracciale saldato “Sempre con me”", host: "OroTrab", categories: ["shopping", "culture"], x: 21.0, y: 45.4 },
  { id: 47, title: "Sculpture Studio: opere e scultura live", host: "FTRAB", categories: ["culture", "show"], x: 22.7, y: 45.4 },
  { id: 48, title: "Musica live", host: "Ilteodilecco & The Duke", categories: ["music"], x: 19.3, y: 43.2, timing: [{ start: hm(21, 30), end: hm(24), label: "21.30–24.00" }] },
  { id: 49, title: "Le attività del Parco", host: "Parco Nazionale dello Stelvio", categories: ["culture", "kids"], x: 20.1, y: 39.4 },
  { id: 50, title: "Apertisana: la tisana per il tuo benessere", host: "Estetica Paola Bormio", categories: ["food"], x: 18.1, y: 36.3, timing: [{ start: hm(17), end: hm(20), label: "17.00–20.00" }] },
  { id: 51, title: "Arrosticini, Birra Reit Session IPA e DJ set", host: "Clem Pub", categories: ["music", "food"], x: 31.4, y: 53.5 },
  { id: 52, title: "Dolce, salato, Birra Stelvio e live music", host: "Artidea · Punto d’oro · Il Salumaio · Aquolina · Sunrise", categories: ["music", "food"], x: 21.4, y: 69.3, timing: [{ start: hm(17), end: hm(20), label: "17.00–20.00 · Valentino Boscacci" }, { start: hm(20), end: hm(23), label: "20.00–23.00 · Gabriel Bertolina" }] },
  { id: 53, title: "Mostra: Arte e semi di meraviglia", host: "Renata Casolini", categories: ["culture"], x: 15.1, y: 61.3, timing: [{ start: hm(18), end: hm(19), label: "18.00", fixed: true }] },
  { id: 54, title: "Suona la Banda: itinerante", host: "Filarmonica Bormiese", categories: ["music", "show"], x: 74.4, y: 30.9, note: "Evento itinerante" },
];

export const presets = [
  {
    id: "family",
    label: "Con bambini",
    description: "Giochi, fiabe e spettacoli",
    ids: [12, 13, 15, 20, 8, 41, 44],
  },
  {
    id: "taste",
    label: "Sapori bormini",
    description: "Una passeggiata da assaggiare",
    ids: [7, 14, 25, 28, 38, 40, 43, 50, 51, 52],
  },
  {
    id: "music",
    label: "Musica fino a tardi",
    description: "Live, tributo 883 e DJ set",
    ids: [2, 11, 16, 17, 19, 27, 33, 37, 39, 48, 51, 52, 54],
  },
  {
    id: "culture",
    label: "Arte & tradizione",
    description: "Mestieri, libri e artigiani",
    ids: [9, 10, 18, 30, 31, 34, 35, 42, 45, 47, 49, 53],
  },
];

export function formatMinutes(value: number) {
  const normalized = value >= 24 * 60 ? value - 24 * 60 : value;
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}
