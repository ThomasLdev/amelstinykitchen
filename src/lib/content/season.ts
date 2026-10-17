export const SEASONS = ["spring", "summer", "autumn", "winter"] as const;

export type Season = (typeof SEASONS)[number];

/** Meteorological seasons, northern hemisphere (Dec–Feb is winter), in local time. */
export function currentSeason(date: Date): Season {
  const seasons: Season[] = ["winter", "spring", "summer", "autumn"];
  return seasons[Math.floor(((date.getMonth() + 1) % 12) / 3)] as Season;
}
