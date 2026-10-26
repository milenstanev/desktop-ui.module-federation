import { fetchOmdb } from '../../../lib/omdb.js';

let requestSerial = 0;

export default {
  async loadData(context, payload) {
    const search = String(payload?.search || '').trim();
    if (!search) {
      context.commit('apiError', 'Enter a movie title.');
      return;
    }

    const requestId = ++requestSerial;
    context.commit('setLoading', search);

    try {
      const result = await fetchOmdb({ s: search, page: '1' });
      if (requestId !== requestSerial) return;

      if (result.Response === 'True') {
        context.commit('loadData', result.Search || []);
      } else {
        context.commit('apiError', result.Error || 'No results');
      }
    } catch (error) {
      if (requestId !== requestSerial) return;
      context.commit('apiError', error?.message || 'Search failed');
    }
  },
};
