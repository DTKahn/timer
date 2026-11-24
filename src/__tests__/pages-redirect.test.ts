type Loc = { pathname: string; search: string; hash: string };

// The project has no Node type definitions, so type the one fs call used here.
const { readFileSync } = jest.requireActual<{
  readFileSync(path: string, encoding: 'utf8'): string;
}>('fs');

// The old GitHub Pages site serves pages-redirect/index.html for every path.
// Pull the redirectTarget function out of the page and run it directly.
// Jest runs from the project root.
type Win = { navigator: { standalone?: boolean }; matchMedia?: (q: string) => { matches: boolean } };

function loadPageFunctions(): {
  redirectTarget: (loc: Loc) => string;
  isHomeScreenApp: (win: Win) => boolean;
} {
  const html = readFileSync('pages-redirect/index.html', 'utf8');
  const match = html.match(/\/\/ redirectTarget:start([\s\S]*?)\/\/ redirectTarget:end/);
  if (!match) throw new Error('redirectTarget markers not found');
  return new Function(`${match[1]}; return { redirectTarget, isHomeScreenApp };`)();
}

const loadRedirectTarget = () => loadPageFunctions().redirectTarget;

describe('isHomeScreenApp', () => {
  const noMedia = () => ({ matches: false });

  test('is true for an iPhone home-screen app', () => {
    expect(
      loadPageFunctions().isHomeScreenApp({ navigator: { standalone: true }, matchMedia: noMedia }),
    ).toBe(true);
  });

  test('is true for an installed web app on other platforms', () => {
    const matchMedia = (q: string) => ({ matches: q === '(display-mode: standalone)' });
    expect(loadPageFunctions().isHomeScreenApp({ navigator: {}, matchMedia })).toBe(true);
  });

  test('is false in a normal browser tab', () => {
    expect(
      loadPageFunctions().isHomeScreenApp({ navigator: { standalone: false }, matchMedia: noMedia }),
    ).toBe(false);
  });

  test('is false when the browser has no matchMedia', () => {
    expect(loadPageFunctions().isHomeScreenApp({ navigator: {} })).toBe(false);
  });
});

const at = (pathname: string, search = '', hash = '') => ({ pathname, search, hash });

test('keeps the page', () => {
  expect(loadRedirectTarget()(at('/timer/settings'))).toBe('https://colorchime.com/settings');
});

test('sends the bare old address to the home page', () => {
  expect(loadRedirectTarget()(at('/timer'))).toBe('https://colorchime.com/');
});

test('sends the old address with a trailing slash to the home page', () => {
  expect(loadRedirectTarget()(at('/timer/'))).toBe('https://colorchime.com/');
});

test('keeps the query and hash', () => {
  expect(loadRedirectTarget()(at('/timer/history', '?x=1', '#a'))).toBe(
    'https://colorchime.com/history?x=1#a',
  );
});
