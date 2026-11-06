// Everything you might want to edit lives here.

export const EVENT = {
  parents: 'Nikhitha & Ebin',
  parentOne: 'Nikhitha',
  parentTwo: 'Ebin',
  title: 'Baby Shower & Gender Reveal',
  heading: 'A Little Wonder Is On The Way!',
  subtitle: 'Tiny hands, big dreams, endless possibilities.',
  intro:
    'A magical new chapter is beginning. Join us as we celebrate a tiny miracle, endless possibilities and a lifetime of love.',
  // 6:00 PM Eastern (EST, UTC-5 on Nov 21). Used by the countdown and calendar links.
  startISO: '2026-11-21T18:00:00-05:00',
  endISO: '2026-11-21T21:00:00-05:00',
  timeZone: 'America/Toronto',
  dateLabel: 'November 21, 2026',
  timeLabel: '6:00 PM',
  venueName: 'Evoke',
  venueRoom: 'Social Room, First Floor',
  venueAddress: '239 Eden Oak Trail, Kitchener, ON N2A 0L5',
  dressColours: 'Brown · Beige · Gold',
  contacts: [
    { name: 'Ebin', tel: '+15197816212', display: '519 781 6212' },
    { name: 'Nikhitha', tel: '+15197310349', display: '519 731 0349' },
  ],
} as const;

export const TEAM_LABEL = { boy: 'Team Boy', girl: 'Team Girl' } as const;

// Music: by default an original music-box lullaby is generated in the browser
// (no file, no licensing). To use your own licensed track instead, put it at
// public/audio/wonder.mp3 and set useFile to true.
export const MUSIC = {
  useFile: false,
  src: `${import.meta.env.BASE_URL}audio/wonder.mp3`,
};
