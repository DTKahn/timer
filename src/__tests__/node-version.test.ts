import pkg from '../../package.json';

// The project has no Node type definitions, so type the one value read here.
const { process } = globalThis as unknown as { process: { versions: { node: string } } };

const engines = (pkg as { engines?: { node?: string } }).engines;

describe('Node version', () => {
  // package.json is the one place the Node version is set: Vercel builds with it too. Running the
  // tests on another major version means this computer, or Vercel, has drifted from it.
  it('runs on the major version package.json asks for', () => {
    expect(engines?.node).toMatch(/^\d+\.x$/);
    const wanted = engines!.node!.split('.')[0];
    const running = process.versions.node.split('.')[0];
    expect(`Node ${running}`).toBe(`Node ${wanted}`);
  });
});
