// Static map of country code → primary IANA timezone for common countries
const COUNTRY_TO_IANA: Record<string, string> = {
  US: "America/New_York",
  GB: "Europe/London",
  DE: "Europe/Berlin",
  FR: "Europe/Paris",
  IN: "Asia/Kolkata",
  JP: "Asia/Tokyo",
  CN: "Asia/Shanghai",
  AU: "Australia/Sydney",
  BR: "America/Sao_Paulo",
  CA: "America/Toronto",
  MX: "America/Mexico_City",
  KR: "Asia/Seoul",
  RU: "Europe/Moscow",
  ZA: "Africa/Johannesburg",
  NG: "Africa/Lagos",
  EG: "Africa/Cairo",
  KE: "Africa/Nairobi",
  IL: "Asia/Jerusalem",
  AE: "Asia/Dubai",
  SA: "Asia/Riyadh",
  PK: "Asia/Karachi",
  BD: "Asia/Dhaka",
  ID: "Asia/Jakarta",
  PH: "Asia/Manila",
  TH: "Asia/Bangkok",
  VN: "Asia/Ho_Chi_Minh",
  MY: "Asia/Kuala_Lumpur",
  SG: "Asia/Singapore",
  NZ: "Pacific/Auckland",
  AR: "America/Argentina/Buenos_Aires",
  CL: "America/Santiago",
  CO: "America/Bogota",
  PE: "America/Lima",
  ES: "Europe/Madrid",
  IT: "Europe/Rome",
  PT: "Europe/Lisbon",
  NL: "Europe/Amsterdam",
  BE: "Europe/Brussels",
  CH: "Europe/Zurich",
  AT: "Europe/Vienna",
  PL: "Europe/Warsaw",
  SE: "Europe/Stockholm",
  NO: "Europe/Oslo",
  DK: "Europe/Copenhagen",
  FI: "Europe/Helsinki",
  IE: "Europe/Dublin",
  CZ: "Europe/Prague",
  RO: "Europe/Bucharest",
  HU: "Europe/Budapest",
  GR: "Europe/Athens",
  TR: "Europe/Istanbul",
  UA: "Europe/Kyiv",
  TW: "Asia/Taipei",
  HK: "Asia/Hong_Kong",
};

export function getIANATimezone(countryCode: string): string | null {
  return COUNTRY_TO_IANA[countryCode.toUpperCase()] ?? null;
}

/** Parse "UTC+5:30" style string into offset hours */
function parseUtcOffset(tz: string): number | null {
  const match = tz.match(/^UTC([+-])(\d{1,2}):?(\d{2})?$/);
  if (!match) return null;
  const sign = match[1] === "+" ? 1 : -1;
  const hours = parseInt(match[2], 10);
  const minutes = parseInt(match[3] || "0", 10);
  return sign * (hours + minutes / 60);
}

/** Get IANA timezone from country code, falling back to UTC offset string from REST Countries */
export function resolveTimezone(countryCode: string, restCountryTimezones?: string[]): string {
  const iana = getIANATimezone(countryCode);
  if (iana) return iana;

  if (restCountryTimezones?.length) {
    const ianaLike = restCountryTimezones.find((tz) => tz.includes("/"));
    if (ianaLike) return ianaLike;

    const offset = parseUtcOffset(restCountryTimezones[0]);
    if (offset !== null) {
      // Etc/GMT signs are inverted: Etc/GMT-5 means UTC+5, Etc/GMT+5 means UTC-5
      const rounded = Math.round(offset);
      if (rounded === 0) return "Etc/GMT";
      return `Etc/GMT${rounded > 0 ? "-" : "+"}${Math.abs(rounded)}`;
    }
  }

  return "UTC";
}

/** Get UTC offset in hours for a timezone on a given date */
export function getUtcOffsetHours(timezone: string, date: Date = new Date()): number {
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      timeZoneName: "shortOffset",
    });
    const parts = formatter.formatToParts(date);
    const tzPart = parts.find((p) => p.type === "timeZoneName")?.value || "";
    const match = tzPart.match(/GMT([+-])(\d{1,2}):?(\d{2})?$/);
    if (!match) return 0;
    const sign = match[1] === "+" ? 1 : -1;
    const hours = parseInt(match[2], 10);
    const minutes = parseInt(match[3] || "0", 10);
    return sign * (hours + minutes / 60);
  } catch (err) {
    console.warn("[timezone] getUtcOffsetHours failed for timezone:", timezone, err);
    return 0;
  }
}

/** Format time in a given timezone */
export function formatLocalTime(timezone: string, date: Date = new Date()): string {
  try {
    return date.toLocaleTimeString("en-US", {
      timeZone: timezone,
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch (err) {
    console.warn("[timezone] formatLocalTime failed for timezone:", timezone, err);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }
}

/** Check if the hour at the given date in a timezone falls within working hours */
export function isInWorkingHours(timezone: string, workStart: number, workEnd: number, date: Date = new Date()): boolean {
  try {
    const hour = parseInt(
      date.toLocaleTimeString("en-US", {
        timeZone: timezone,
        hour: "numeric",
        hour12: false,
      }),
      10
    );
    return hour >= workStart && hour < workEnd;
  } catch (err) {
    console.warn("[timezone] isInWorkingHours failed for timezone:", timezone, err);
    return false;
  }
}

/** Get a UTC offset label. Returns "UTC" for zero offset, or "UTC+5:30" / "UTC-8" style for non-zero. */
export function getOffsetLabel(timezone: string, date: Date = new Date()): string {
  const offset = getUtcOffsetHours(timezone, date);
  if (offset === 0) return "UTC";
  const sign = offset > 0 ? "+" : "-";
  const abs = Math.abs(offset);
  const hours = Math.floor(abs);
  const minutes = Math.round((abs - hours) * 60);
  return `UTC${sign}${hours}${minutes > 0 ? `:${minutes.toString().padStart(2, "0")}` : ""}`;
}
