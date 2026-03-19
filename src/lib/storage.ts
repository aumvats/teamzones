import type { TeamMember, WeatherData, Holiday, CountryData } from "@/types";
import { getSupabaseClient } from "@/lib/supabase/client";

const DEVICE_ID_KEY = "teamzones-device-id";
const MEMBERS_KEY = "teamzones-members";
const WEATHER_KEY = "teamzones-weather";
const HOLIDAYS_KEY = "teamzones-holidays";
const COUNTRIES_KEY = "teamzones-countries";

// --- localStorage helpers ---

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

// --- Device ID ---

function getDeviceId(): string {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

// --- Row <-> TeamMember mapping ---

interface MemberRow {
  id: string;
  device_id: string;
  name: string;
  city: string;
  country_code: string;
  country_name: string;
  flag_emoji: string;
  timezone: string;
  lat: number;
  lng: number;
  work_start: number;
  work_end: number;
  added_at: number;
}

function rowToMember(row: MemberRow): TeamMember {
  return {
    id: row.id,
    name: row.name,
    city: row.city,
    countryCode: row.country_code,
    countryName: row.country_name,
    flagEmoji: row.flag_emoji,
    timezone: row.timezone,
    lat: row.lat,
    lng: row.lng,
    workStart: row.work_start,
    workEnd: row.work_end,
    addedAt: row.added_at,
  };
}

function memberToRow(member: TeamMember): MemberRow {
  return {
    id: member.id,
    device_id: getDeviceId(),
    name: member.name,
    city: member.city,
    country_code: member.countryCode,
    country_name: member.countryName,
    flag_emoji: member.flagEmoji,
    timezone: member.timezone,
    lat: member.lat,
    lng: member.lng,
    work_start: member.workStart,
    work_end: member.workEnd,
    added_at: member.addedAt,
  };
}

// --- Local member helpers ---

function getLocalMembers(): TeamMember[] {
  return safeGet<TeamMember[]>(MEMBERS_KEY, []);
}

function saveLocalMembers(members: TeamMember[]): void {
  safeSet(MEMBERS_KEY, members);
}

// --- Member CRUD (async, Supabase-first with localStorage fallback) ---

export async function getMembers(): Promise<TeamMember[]> {
  const client = getSupabaseClient();
  if (!client) return getLocalMembers();

  const { data, error } = await client
    .from("teamzones_members")
    .select("*")
    .eq("device_id", getDeviceId())
    .order("added_at", { ascending: true });

  if (error || !data) {
    console.warn("[storage] Supabase read failed, using localStorage:", error);
    return getLocalMembers();
  }

  const members = (data as MemberRow[]).map(rowToMember);
  saveLocalMembers(members);
  return members;
}

export async function addMember(member: TeamMember): Promise<void> {
  const locals = getLocalMembers();
  locals.push(member);
  saveLocalMembers(locals);

  const client = getSupabaseClient();
  if (!client) return;

  const { error } = await client
    .from("teamzones_members")
    .insert(memberToRow(member));

  if (error) console.warn("[storage] Supabase insert failed:", error);
}

export async function updateMember(member: TeamMember): Promise<void> {
  const locals = getLocalMembers().map((m) => (m.id === member.id ? member : m));
  saveLocalMembers(locals);

  const client = getSupabaseClient();
  if (!client) return;

  const row = memberToRow(member);
  const { id: _id, device_id: _did, ...updates } = row;
  const { error } = await client
    .from("teamzones_members")
    .update(updates)
    .eq("id", member.id);

  if (error) console.warn("[storage] Supabase update failed:", error);
}

export async function removeMember(id: string): Promise<void> {
  saveLocalMembers(getLocalMembers().filter((m) => m.id !== id));

  const client = getSupabaseClient();
  if (!client) return;

  const { error } = await client
    .from("teamzones_members")
    .delete()
    .eq("id", id);

  if (error) console.warn("[storage] Supabase delete failed:", error);
}

export async function migrateLocalToSupabase(): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  const locals = getLocalMembers();
  if (locals.length === 0) return;

  const rows = locals.map(memberToRow);
  const { error } = await client
    .from("teamzones_members")
    .upsert(rows, { onConflict: "id" });

  if (error) console.warn("[storage] Migration failed:", error);
}

// --- Weather cache (localStorage only) ---

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

// --- Holiday cache (localStorage only) ---

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

// --- Country cache (localStorage only) ---

type CountryCache = Record<string, { data: CountryData; cachedAt: number }>;

function getCountryCache(): CountryCache {
  return safeGet<CountryCache>(COUNTRIES_KEY, {});
}

export function setCountryCache(code: string, data: CountryData): void {
  const cache = getCountryCache();
  cache[code] = { data, cachedAt: Date.now() };
  safeSet(COUNTRIES_KEY, cache);
}
