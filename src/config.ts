// Everything you might want to edit lives here.

export const EVENT = {
  parents: 'Nikhitha & Ebin',
  parentOne: 'Nikhitha',
  parentTwo: 'Ebin',
  title: 'Baby Shower & Gender Reveal',
  tagline: 'A little love is on the way',
  // 6:00 PM Eastern (EST, UTC-5 on Nov 21). Used by countdown + calendar links.
  startISO: '2026-11-21T18:00:00-05:00',
  endISO: '2026-11-21T21:00:00-05:00',
  timeZone: 'America/Toronto',
  dateLabel: 'Saturday, November 21, 2026',
  timeLabel: '6:00 PM',
  venueName: 'Evoke',
  // TODO: replace with the venue's full street address for an exact pin
  // (e.g. 'Evoke, 123 Main St, Kitchener, ON'). Used by the map + directions.
  venueQuery: 'Evoke, Kitchener, ON',
  venueAddressLine: '', // optional line shown under the venue name
  dressCode: 'Brown, beige or gold are recommended.',
  contacts: [
    { name: 'Ebin', tel: '+15197816212', display: '519 781 6212' },
    { name: 'Nikhitha', tel: '+15197310349', display: '519 731 0349' },
  ],
} as const;

// Photos live in /public/gallery. Missing files are skipped automatically.
export const GALLERY: { file: string; caption: string }[] = [
  { file: '01.jpg', caption: 'Our story' },
  { file: '02.jpg', caption: 'Together' },
  { file: '03.jpg', caption: 'Little moments' },
  { file: '04.jpg', caption: 'Waiting for you' },
  { file: '05.jpg', caption: 'Growing love' },
  { file: '06.jpg', caption: 'Almost here' },
  { file: '07.jpg', caption: 'Our family' },
  { file: '08.jpg', caption: 'Forever grateful' },
];

export const MUSIC_SRC = `${import.meta.env.BASE_URL}audio/lullaby.mp3`;
