export type Release = {
  version: string;
  /** When it went live, in the developer's local time. */
  date: string;
  /** The most important change or changes, in a few plain words. */
  name: string;
  /** One sentence per change, about what's different for the person using the app. */
  changes: string[];
};

/** Newest first. Add an entry for every release and match `version` in app.json. */
export const RELEASES: Release[] = [
  {
    version: '0.7.0',
    date: 'Oct 5, 2026, 23:30',
    name: 'A bigger timer and a simpler way to set the time',
    changes: [
      'The timer now starts right under the top buttons, so it can be bigger.',
      'Each time box shows h, m, or s inside it, with its up and down arrows beside it.',
      'Favorites have their own section with an Add or Remove button for the time you’ve set.',
    ],
  },
  {
    version: '0.6.0',
    date: 'Oct 5, 2026, 22:58',
    name: 'Bigger buttons and more room for the timer',
    changes: [
      'History and Settings now open from small buttons in the top right, so the timer gets the whole screen.',
      'The start button now stretches across the bottom, with bigger color, sound, and reset buttons above it.',
      'The timer, the time, and the buttons are spaced evenly down the screen.',
      'Colors are bigger and easier to tap when you pick one.',
      'Sounds are now a list: tap one to choose it, or tap its play button to hear it first.',
      'The color picker no longer jumps around when you switch between one color and several.',
    ],
  },
  {
    version: '0.5.1',
    date: 'Oct 4, 2026, 22:06',
    name: 'Full color after time’s up',
    changes: [
      'When a timer finishes, the dial now stays full of color after it flashes, instead of going blank.',
    ],
  },
  {
    version: '0.5.0',
    date: 'Oct 2, 2026, 10:14',
    name: 'Version history',
    changes: [
      'You can see which version you’re using at the bottom of Settings.',
      'Tap the version to see what changed in each release.',
    ],
  },
  {
    version: '0.4.1',
    date: 'Oct 2, 2026, 09:43',
    name: 'Sound fix after switching apps',
    changes: [
      'On iPhone, the timer sound should now play even after you switch to another app and come back.',
    ],
  },
  {
    version: '0.4.0',
    date: 'Oct 1, 2026, 23:12',
    name: 'Watch alarm sound',
    changes: ['There’s a new Watch sound that beeps like a digital watch alarm.'],
  },
  {
    version: '0.3.1',
    date: 'Oct 1, 2026, 22:47',
    name: 'Timer sound fix',
    changes: ['The timer now plays its sound when it ends, even if you never opened the sound picker.'],
  },
  {
    version: '0.3.0',
    date: 'Oct 1, 2026, 22:39',
    name: 'Multi-color timer',
    changes: [
      'You can pick several colors, and each one shows as its own ring on the timer.',
      'The timer now fills all the way to the center.',
    ],
  },
  {
    version: '0.2.0',
    date: 'Sep 29, 2026, 23:55',
    name: 'New sound picker',
    changes: [
      'Pick a sound by tapping its icon: Bell, Bird, Guitar, or Silent.',
      'Bird and Guitar are new, and if you had picked a sound that was removed, you’ll now hear Bell.',
      'Icons look the same on iPhone and on the web.',
      'Screen readers now say which sound and color are selected.',
    ],
  },
  {
    version: '0.1.0',
    date: 'Sep 29, 2026, 23:16',
    name: 'First release',
    changes: [
      'A countdown timer that shows the time left as a shrinking colored circle.',
      'Save your favorite times, and see the times you’ve used recently.',
      'Choose the timer’s color and the sound it makes when time’s up.',
    ],
  },
];
