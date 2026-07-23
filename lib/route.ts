import { EventStop } from "./events";

export type MapPoint = { x: number; y: number };

export type RouteStep = {
  stop: EventStop;
  arrival: number;
  departure: number;
  walkMinutes: number;
  waitMinutes: number;
  status: "ok" | "late";
  timingLabel?: string;
};

export type PlannedRoute = {
  steps: RouteStep[];
  distanceMeters: number;
  walkMinutes: number;
  finishAt: number;
  missed: number;
};

export const landmarkStarts = {
  cavour: { x: 75.2, y: 33.3 },
  sanVitale: { x: 21.7, y: 40.8 },
  alpini: { x: 40.0, y: 10.2 },
};

export function distanceMeters(a: MapPoint, b: MapPoint) {
  const dx = (a.x - b.x) * 18;
  const dy = (a.y - b.y) * 17;
  return Math.sqrt(dx * dx + dy * dy);
}

function travelMinutes(a: MapPoint, b: MapPoint) {
  const distance = distanceMeters(a, b);
  if (distance < 8) return 0;
  return Math.max(1, Math.ceil(distance / 72));
}

function evaluateTiming(stop: EventStop, arrival: number) {
  if (!stop.timing?.length) {
    return { serviceAt: arrival, status: "ok" as const, wait: 0 };
  }

  for (const window of stop.timing) {
    if (arrival <= window.end) {
      const serviceAt = Math.max(arrival, window.start);
      return {
        serviceAt,
        status: "ok" as const,
        wait: Math.max(0, window.start - arrival),
        label: window.label,
      };
    }
  }

  return {
    serviceAt: arrival,
    status: "late" as const,
    wait: 0,
    label: stop.timing.at(-1)?.label,
  };
}

function buildFromStart(
  stops: EventStop[],
  start: MapPoint,
  startTime: number,
): PlannedRoute {
  const remaining = [...stops];
  const steps: RouteStep[] = [];
  let point = start;
  let clock = startTime;
  let totalDistance = 0;
  let totalWalk = 0;

  while (remaining.length) {
    const ranked = remaining
      .map((stop) => {
        const distance = distanceMeters(point, stop);
        const walk = travelMinutes(point, stop);
        const arrival = clock + walk;
        const timing = evaluateTiming(stop, arrival);
        let score = distance;

        if (stop.timing?.length) {
          if (timing.status === "late") score += 2600;
          else if (timing.wait <= 35) score -= 520 - timing.wait * 8;
          else if (timing.wait <= 70) score -= 120;
          else score += timing.wait * 22;
        }

        return { stop, distance, walk, timing, score };
      })
      .sort((a, b) => a.score - b.score);

    const next = ranked[0];
    const duration = next.stop.duration ?? 18;
    const serviceAt = next.timing.serviceAt;
    const departure = serviceAt + duration;

    steps.push({
      stop: next.stop,
      arrival: serviceAt,
      departure,
      walkMinutes: next.walk,
      waitMinutes: next.timing.wait,
      status: next.timing.status,
      timingLabel: next.timing.label,
    });

    totalDistance += next.distance;
    totalWalk += next.walk;
    clock = departure;
    point = next.stop;
    remaining.splice(
      remaining.findIndex((item) => item.id === next.stop.id),
      1,
    );
  }

  return {
    steps,
    distanceMeters: Math.round(totalDistance),
    walkMinutes: totalWalk,
    finishAt: clock,
    missed: steps.filter((step) => step.status === "late").length,
  };
}

export function planRoute(
  stops: EventStop[],
  startTime: number,
  start?: MapPoint,
): PlannedRoute {
  if (!stops.length) {
    return {
      steps: [],
      distanceMeters: 0,
      walkMinutes: 0,
      finishAt: startTime,
      missed: 0,
    };
  }

  if (start) return buildFromStart(stops, start, startTime);

  const candidates =
    stops.length <= 18
      ? stops
      : [
          stops.reduce((a, b) => (a.x < b.x ? a : b)),
          stops.reduce((a, b) => (a.x > b.x ? a : b)),
          stops.reduce((a, b) => (a.y < b.y ? a : b)),
          stops.reduce((a, b) => (a.y > b.y ? a : b)),
        ];

  return candidates
    .map((candidate) => buildFromStart(stops, candidate, startTime))
    .sort(
      (a, b) =>
        a.missed - b.missed ||
        a.distanceMeters - b.distanceMeters ||
        a.finishAt - b.finishAt,
    )[0];
}

export function geolocationToMap(latitude: number, longitude: number): MapPoint {
  const west = 10.3578;
  const east = 10.3832;
  const north = 46.4776;
  const south = 46.4588;
  return {
    x: Math.max(0, Math.min(100, ((longitude - west) / (east - west)) * 100)),
    y: Math.max(0, Math.min(100, ((north - latitude) / (north - south)) * 100)),
  };
}
