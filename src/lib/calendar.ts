import { EVENT } from '../config';

// 2026-11-21 18:00-21:00 America/Toronto
const START_LOCAL = '20261121T180000';
const END_LOCAL = '20261121T210000';

const venue: string = `${EVENT.venueName} - ${EVENT.venueRoom}, ${EVENT.venueAddress}`;
const details = `Join ${EVENT.parents} for their ${EVENT.title}! Guest recommended dress colours: ${EVENT.dressColours.replace(/ · /g, ', ')}.`;

const utc = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

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
    `DTSTART:${utc(EVENT.startISO)}`,
    `DTEND:${utc(EVENT.endISO)}`,
    `SUMMARY:${esc(`${EVENT.title} — ${EVENT.parents}`)}`,
    `DESCRIPTION:${esc(details)}`,
    `LOCATION:${esc(venue)}`,
    'BEGIN:VALARM',
    'TRIGGER:-P1D',
    'ACTION:DISPLAY',
    'DESCRIPTION:The baby shower is tomorrow',
    'END:VALARM',
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
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(EVENT.venueAddress)}`;

export const mapEmbedUrl = () =>
  `https://www.google.com/maps?q=${encodeURIComponent(EVENT.venueAddress)}&output=embed`;
