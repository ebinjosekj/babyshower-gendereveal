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
  // Put the venue's real street address here (e.g. 'Evoke, 123 Main St, Kitchener, ON').
  // While it is empty, the Directions button and map are hidden — no address is invented.
  venueAddress: '',
  contacts: [
    { name: 'Ebin', tel: '+15197816212', display: '519 781 6212' },
    { name: 'Nikhitha', tel: '+15197310349', display: '519 731 0349' },
  ],
} as const;

export const TEAM_LABEL = { sunshine: 'Team Sunshine', wonder: 'Team Wonder' } as const;

// Photos live in /public/photos. Missing files are skipped automatically.
// "invitation.jpg" is the artwork from your original invitation site.
export const GALLERY: { file: string; caption: string }[] = [
  { file: 'invitation.jpg', caption: 'Our invitation' },
  { file: '01.jpg', caption: 'Together' },
  { file: '02.jpg', caption: 'Little moments' },
  { file: '03.jpg', caption: 'Waiting for you' },
  { file: '04.jpg', caption: 'Growing love' },
  { file: '05.jpg', caption: 'Almost here' },
  { file: '06.jpg', caption: 'Our family' },
  { file: '07.jpg', caption: 'Forever grateful' },
];

// Optional framed couple photo in "Our Little Adventure": public/photos/couple.jpg
export const COUPLE_PHOTO = 'couple.jpg';

// Music: by default an original music-box lullaby is generated in the browser
// (no file, no licensing). To use your own licensed track instead, put it at
// public/audio/wonder.mp3 and set useFile to true.
export const MUSIC = {
  useFile: false,
  src: `${import.meta.env.BASE_URL}audio/wonder.mp3`,
};
