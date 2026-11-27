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
    version: '0.14.6',
    date: 'Nov 27, 2026, 13:22',
    name: 'Behind-the-scenes updates',
    changes: ['Nothing changes in the timer: its building blocks were updated to keep it secure and working smoothly.'],
  },
  {
    version: '0.14.5',
    date: 'Nov 27, 2026, 12:08',
    name: 'Behind-the-scenes updates',
    changes: ['Nothing changes in the timer: its building blocks were updated to keep it secure and working smoothly.'],
  },
  {
    version: '0.14.4',
    date: 'Nov 27, 2026, 11:55',
    name: 'Behind-the-scenes upkeep',
    changes: ['Nothing changes in the timer: more checks now run before every update goes live, so a broken update can’t reach the site.'],
  },
  {
    version: '0.14.3',
    date: 'Nov 27, 2026, 10:58',
    name: 'Behind-the-scenes upkeep',
    changes: ['Nothing changes in the timer: the site is now always built with the same tools, which keeps future updates reliable.'],
  },
  {
    version: '0.14.2',
    date: 'Nov 26, 2026, 23:01',
    name: 'Analytics update',
    changes: ['Update to analytics to understand which colors and sounds are chosen.'],
  },
  {
    version: '0.14.1',
    date: 'Nov 25, 2026, 13:21',
    name: 'Analytics update',
    changes: ['Update to analytics to understand timer duration data.'],
  },
  {
    version: '0.14.0',
    date: 'Nov 24, 2026, 14:34',
    name: 'Links to the timer show a preview',
    changes: [
      'When you share a link to the timer in a message or on social media, it now shows a picture and a short description.',
      'The browser tab shows the name Color Chime and a timer icon instead of the old placeholder.',
      'Adding the timer to your home screen now uses the Color Chime name and icon.',
    ],
  },
  {
    version: '0.13.0',
    date: 'Nov 24, 2026, 13:47',
    name: 'Adding PostHog analytics to the web version',
    changes: [
      'The web version of the timer now uses PostHog, an analytics service, to learn how the timer is used so we can find what is confusing.',
    ],
  },
  {
    version: '0.12.10',
    date: 'Nov 23, 2026, 16:41',
    name: 'Timer has a new home',
    changes: [
      'The timer now lives at colorchime.com, and the old address takes you there automatically, to the same page.',
      'Your favorites, history, and settings start fresh at the new address.',
      'If you open the timer from your home screen, the old icon explains how to add the new one.',
    ],
  },
  {
    version: '0.12.9',
    date: 'Nov 20, 2026, 21:22',
    name: 'Timer no longer jumps between sizes',
    changes: [
      'Fixed the timer flickering between a smaller and a full-screen size when the app is opened from the home screen.',
    ],
  },
  {
    version: '0.12.8',
    date: 'Nov 20, 2026, 21:17',
    name: 'Fills the whole screen from the home screen',
    changes: [
      'When opened from the home screen, the timer and the color and sound choices now reach all the way to the bottom of the screen, instead of stopping short with a gap.',
    ],
  },
  {
    version: '0.12.7',
    date: 'Nov 20, 2026, 21:02',
    name: 'Timer fills the screen again',
    changes: [
      'Fixed the timer still coming out smaller than it should, with a gap at the bottom of the screen, when the app is opened from the home screen.',
    ],
  },
  {
    version: '0.12.6',
    date: 'Nov 20, 2026, 13:29',
    name: 'Timer back to full size',
    changes: [
      'Fixed the timer and buttons coming out smaller than before, with a gap at the bottom of the screen, when the app is opened from the home screen.',
    ],
  },
  {
    version: '0.12.5',
    date: 'Nov 20, 2026, 13:13',
    name: 'Screen stays in place after turning your phone',
    changes: [
      'Fixed the screen sitting too high, with its top buttons under the clock, after turning your phone sideways and back when the app is opened from the home screen.',
    ],
  },
  {
    version: '0.12.4',
    date: 'Nov 20, 2026, 12:51',
    name: 'Pickers stay open when you turn your phone',
    changes: [
      'The color and sound choices now stay open when you turn your phone, and rearrange to fit the new direction.',
    ],
  },
  {
    version: '0.12.3',
    date: 'Nov 20, 2026, 12:32',
    name: 'Everything fits on small screens',
    changes: [
      'On small screens, especially with your phone sideways, the buttons now shrink to fit so nothing gets cut off at the bottom.',
      'The timer now grows to fill the space it has, and with your phone sideways it sits together with its buttons in the middle of the screen.',
      'Fixed the screen sometimes keeping the wrong sizes after turning your phone sideways and back.',
    ],
  },
  {
    version: '0.12.2',
    date: 'Nov 15, 2026, 05:47',
    name: 'Taps line up with your phone sideways',
    changes: [
      'Fixed the screen showing shifted down, with taps missing the buttons, when using the timer from the home screen on some iPhones held sideways.',
    ],
  },
  {
    version: '0.12.1',
    date: 'Nov 12, 2026, 04:49',
    name: 'Colors fit when your phone is sideways',
    changes: [
      'With your phone sideways, the color and sound choices now spread out in wider rows so they all fit on screen, with Done at the top.',
    ],
  },
  {
    version: '0.12.0',
    date: 'Nov 11, 2026, 04:11',
    name: 'Turn your phone sideways',
    changes: [
      'Turning your phone sideways now shows the timer on the left, at the same size as when your phone is upright, with the time and buttons beside it.',
    ],
  },
  {
    version: '0.11.2',
    date: 'Oct 9, 2026, 09:57',
    name: 'The timer always finishes',
    changes: ['Fixed the timer sometimes stopping at zero without playing its sound or flashing.'],
  },
  {
    version: '0.11.1',
    date: 'Oct 8, 2026, 06:53',
    name: 'Bigger sound buttons',
    changes: ['The sound buttons and their icons are larger and easier to tap, and still fit on small phones.'],
  },
  {
    version: '0.11.0',
    date: 'Oct 8, 2026, 06:40',
    name: 'Sounds are now round buttons',
    changes: ['The sound picker now shows round buttons with larger icons and the name underneath, matching the color picker.'],
  },
  {
    version: '0.10.2',
    date: 'Oct 8, 2026, 03:32',
    name: 'Sounds play instantly when tapped',
    changes: ['Tapping a sound in the picker now plays it right away, without a short delay.'],
  },
  {
    version: '0.10.1',
    date: 'Oct 7, 2026, 09:45',
    name: 'Colors fit four across on small phones',
    changes: ['On smaller phones like the iPhone mini, the color picker shows four colors per row again instead of three.'],
  },
  {
    version: '0.10.0',
    date: 'Oct 5, 2026, 23:58',
    name: 'Tap a sound to hear it',
    changes: [
      'Tapping a sound now chooses it and plays it, so there’s no separate play button.',
      'The sound and color pickers have shorter titles: “Sound” and “Color”.',
    ],
  },
  {
    version: '0.9.0',
    date: 'Oct 5, 2026, 23:52',
    name: 'Easier scrolling through favorites',
    changes: [
      'The favorites star stays in place while you scroll through your favorites.',
      'The edges of your favorites fade out when there are more to scroll to.',
    ],
  },
  {
    version: '0.8.0',
    date: 'Oct 5, 2026, 23:49',
    name: 'Star button for favorites',
    changes: [
      'A star at the start of your favorites adds the time you’ve set, or removes it if it’s already saved.',
      'Favorites now line up in the middle of the screen on computers and tablets.',
    ],
  },
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
