import { EVENT } from '../config';

// 2026-11-21 18:00-21:00 America/Toronto
const START_LOCAL = '20261121T180000';
const END_LOCAL = '20261121T210000';

const venue: string = EVENT.venueAddress || EVENT.venueName;
const details = `Join ${EVENT.parents} for their ${EVENT.title}!`;

export const googleCalendarUrl = () => {
  const p = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${EVENT.title} — ${EVENT.parents}`,
    dates: `${START_LOCAL}/${END_LOCAL}`,
    ctz: EVENT.timeZone,
    details,
    location: venue,
  });
  return `https://calendar.google.com/calendar/render?${p.toString()}`;
};

export const downloadIcs = () => {
  const esc = (s: string) => s.replace(/[,;]/g, (m) => `\\${m}`);
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Nikhitha and Ebin//Baby Shower//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    'UID:baby-shower-nikhitha-ebin-20261121@invitation',
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
    `DTSTART;TZID=${EVENT.timeZone}:${START_LOCAL}`,
    `DTEND;TZID=${EVENT.timeZone}:${END_LOCAL}`,
    `SUMMARY:${esc(`${EVENT.title} — ${EVENT.parents}`)}`,
    `DESCRIPTION:${esc(details)}`,
    `LOCATION:${esc(venue)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = 'baby-shower.ics';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export const directionsUrl = () =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(EVENT.venueAddress)}`;

export const mapEmbedUrl = () =>
  `https://www.google.com/maps?q=${encodeURIComponent(EVENT.venueAddress)}&output=embed`;
