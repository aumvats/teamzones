import type { TeamMember, WeatherData, Holiday, CountryData } from "@/types";

const MEMBERS_KEY = "teamzones-members";
const WEATHER_KEY = "teamzones-weather";
const HOLIDAYS_KEY = "teamzones-holidays";
const COUNTRIES_KEY = "teamzones-countries";

function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn("[storage] Failed to read key:", key, err);
    return fallback;
  }
}

function safeSet(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn("[storage] Failed to write key:", key, err);
  }
}

export function getMembers(): TeamMember[] {
  return safeGet<TeamMember[]>(MEMBERS_KEY, []);
}

export function saveMembers(members: TeamMember[]): void {
  safeSet(MEMBERS_KEY, members);
}

type WeatherCache = Record<string, WeatherData>;

function getWeatherCache(): WeatherCache {
  return safeGet<WeatherCache>(WEATHER_KEY, {});
}

export function setWeatherCache(key: string, data: WeatherData): void {
  const cache = getWeatherCache();
  cache[key] = data;
  safeSet(WEATHER_KEY, cache);
}

export function getWeatherForLocation(lat: number, lng: number): WeatherData | null {
  const key = `${lat.toFixed(2)}:${lng.toFixed(2)}`;
  const cache = getWeatherCache();
  const entry = cache[key];
  if (!entry) return null;
  // Client-side cache TTL: 30 min
  if (Date.now() - entry.cachedAt > 30 * 60 * 1000) return null;
  return entry;
}

type HolidayCache = Record<string, { data: Holiday[]; cachedAt: number }>;

function getHolidayCache(): HolidayCache {
  return safeGet<HolidayCache>(HOLIDAYS_KEY, {});
}

export function setHolidayCache(countryCode: string, year: number, data: Holiday[]): void {
  const cache = getHolidayCache();
  cache[`${countryCode}:${year}`] = { data, cachedAt: Date.now() };
  safeSet(HOLIDAYS_KEY, cache);
}

export function getHolidaysForCountry(countryCode: string, year: number): Holiday[] | null {
  const cache = getHolidayCache();
  const entry = cache[`${countryCode}:${year}`];
  if (!entry) return null;
  // Client-side cache TTL: 24h
  if (Date.now() - entry.cachedAt > 24 * 60 * 60 * 1000) return null;
  return entry.data;
}

type CountryCache = Record<string, { data: CountryData; cachedAt: number }>;

function getCountryCache(): CountryCache {
  return safeGet<CountryCache>(COUNTRIES_KEY, {});
}

export function setCountryCache(code: string, data: CountryData): void {
  const cache = getCountryCache();
  cache[code] = { data, cachedAt: Date.now() };
  safeSet(COUNTRIES_KEY, cache);
}
