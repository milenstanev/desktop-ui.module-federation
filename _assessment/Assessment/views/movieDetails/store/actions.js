import { fetchOmdb } from '../../../lib/omdb.js';

let requestSerial = 0;

const movieIdFromHash = () => {
  const id = location.hash.split('/')[2] || '';
  try {
    return decodeURIComponent(id).trim();
  } catch {
    return '';
  }
};

export default {
  async loadData(context) {
    const id = movieIdFromHash();
    if (!id) {
      context.commit('apiError', 'Missing movie id.');
      return;
    }

    const requestId = ++requestSerial;
    context.commit('setLoading');

    try {
      const result = await fetchOmdb({ i: id, plot: 'full' });
      if (requestId !== requestSerial) return;
      context.commit('loadData', result);
    } catch (error) {
      if (requestId !== requestSerial) return;
      context.commit('apiError', error?.message || 'Could not load this movie.');
    }
  },
};
