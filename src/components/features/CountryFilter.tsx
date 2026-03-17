"use client";

interface CountryFilterProps {
  countries: { code: string; name: string; flagEmoji: string }[];
  selected: string; // "ALL" or country code
  onChange: (code: string) => void;
}

export default function CountryFilter({ countries, selected, onChange }: CountryFilterProps) {
  return (
    <select
      value={selected}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Filter by country"
      className="px-3 py-2 text-sm bg-surface border border-border rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors duration-150"
    >
      <option value="ALL">All Countries</option>
      {countries.map((c) => (
        <option key={c.code} value={c.code}>
          {c.flagEmoji} {c.name}
        </option>
      ))}
    </select>
  );
}
