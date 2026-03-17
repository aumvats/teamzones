export interface TeamMember {
  id: string;
  name: string;
  city: string;
  countryCode: string;
  countryName: string;
  flagEmoji: string;
  timezone: string;
  lat: number;
  lng: number;
  workStart: number;
  workEnd: number;
  addedAt: number;
}

export interface GeoResult {
  displayName: string;
  lat: number;
  lng: number;
  countryCode: string;
}

export interface WeatherData {
  temperature: number;
  weatherCode: number;
  cachedAt: number;
}

export interface Holiday {
  date: string;
  name: string;
  localName: string;
  countryCode: string;
  types: string[];
  global: boolean;
}

export interface CountryData {
  code: string;
  name: string;
  flagEmoji: string;
  timezones: string[];
}
