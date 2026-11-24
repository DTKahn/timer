import { SITE_TITLE } from '../site';

// The project has no Node type definitions, so type the one fs call used here.
const { readFileSync } = jest.requireActual<{
  readFileSync(path: string, encoding: 'utf8'): string;
}>('fs');

// Jest runs from the project root.
const html = readFileSync('public/index.html', 'utf8');

describe('web page details', () => {
  it('gives the page the same title the app shows in the tab when idle', () => {
    expect(html).toContain(`<title>${SITE_TITLE}</title>`);
    expect(html).toContain(`<meta property="og:title" content="${SITE_TITLE}" />`);
  });

  it('describes the app as structured data that parses', () => {
    const match = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    expect(match).not.toBeNull();
    expect(JSON.parse(match![1])).toMatchObject({ '@type': 'WebApplication', name: 'Color Chime' });
  });

  it('points at files that exist', () => {
    for (const file of ['manifest.webmanifest', 'apple-touch-icon.png', 'og-image.png']) {
      expect(html).toContain(`/${file}`);
      expect(() => readFileSync(`public/${file}`, 'utf8')).not.toThrow();
    }
    const manifest = JSON.parse(readFileSync('public/manifest.webmanifest', 'utf8'));
    for (const icon of manifest.icons) {
      expect(() => readFileSync(`public${icon.src}`, 'utf8')).not.toThrow();
    }
  });
});
