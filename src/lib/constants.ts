export const CATEGORIES = [
  {
    id: 'wohnen',
    label: 'Wohnen',
    placeholder:
      'z.B. Küchenzeile mit Kochinsel, offener Grundriss, Decke 3.20m, Einzug September.',
  },
  {
    id: 'arbeiten',
    label: 'Arbeiten',
    placeholder:
      'z.B. Großraumbüro, 12 Arbeitsplätze, Stauraumlösung, Meetingraum, Akustik wichtig. Bezug Q3.',
  },
  {
    id: 'empfangen',
    label: 'Empfangen',
    placeholder:
      'z.B. Empfangstresen Arztpraxis mit Rückwand, Wartezone, 3 Behandlungsräume. Bezug Q4.',
  },
] as const;

export const TIMELINES = [
  { id: 'sofort', label: 'Sofort' },
  { id: '1-3m', label: '1–3 Mon.' },
  { id: '3-6m', label: '3–6 Mon.' },
  { id: 'offen', label: 'Offen' },
] as const;
