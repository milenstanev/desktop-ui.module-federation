import { resolveEsmRemoteContainer } from './loadRemoteFeature';

describe('resolveEsmRemoteContainer', () => {
  const init = jest.fn();
  const get = jest.fn();
  const entryUrl = 'https://schema-ui-mf-remote.vercel.app/remoteEntry.js';

  it('accepts named init/get exports', () => {
    const container = resolveEsmRemoteContainer({ init, get }, entryUrl);
    expect(container.init).toBe(init);
    expect(container.get).toBe(get);
  });

  it('accepts init/get on the default export', () => {
    const container = resolveEsmRemoteContainer(
      { default: { init, get } },
      entryUrl
    );
    expect(container.init).toBe(init);
    expect(container.get).toBe(get);
  });

  it('rejects modules without a container', () => {
    expect(() => resolveEsmRemoteContainer({ default: {} }, entryUrl)).toThrow(
      /does not export init\/get/
    );
  });
});
