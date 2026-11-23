type Loc = { pathname: string; search: string; hash: string };

// The project has no Node type definitions, so type the one fs call used here.
const { readFileSync } = jest.requireActual<{
  readFileSync(path: string, encoding: 'utf8'): string;
}>('fs');

// The old GitHub Pages site serves pages-redirect/index.html for every path.
// Pull the redirectTarget function out of the page and run it directly.
// Jest runs from the project root.
function loadRedirectTarget(): (loc: Loc) => string {
  const html = readFileSync('pages-redirect/index.html', 'utf8');
  const match = html.match(/\/\/ redirectTarget:start([\s\S]*?)\/\/ redirectTarget:end/);
  if (!match) throw new Error('redirectTarget markers not found');
  return new Function(`${match[1]}; return redirectTarget;`)();
}

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
