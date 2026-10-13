import { DEFAULT_JSPM_APP_URL, getJspmAppUrl } from './jspmAppUrl';

describe('getJspmAppUrl', () => {
  it('defaults to the public JSPM AngularJS app', () => {
    expect(getJspmAppUrl({})).toBe(DEFAULT_JSPM_APP_URL);
  });

  it('uses REACT_APP_JSPM_APP_URL when set', () => {
    expect(
      getJspmAppUrl({ REACT_APP_JSPM_APP_URL: 'https://jspm.example.com/' })
    ).toBe('https://jspm.example.com');
  });
});
