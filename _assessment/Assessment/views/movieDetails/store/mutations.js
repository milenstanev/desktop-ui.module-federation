export default {
  setLoading() {
    return {
      status: 'loading',
      error: '',
      data: null,
    };
  },
  loadData(_state, payload) {
    if (payload && payload.Response === 'False') {
      return {
        status: 'error',
        error: payload.Error || 'Movie not found.',
        data: null,
      };
    }

    return {
      status: 'ready',
      error: '',
      data: payload,
    };
  },
  apiError(_state, error) {
    return {
      status: 'error',
      error: String(error),
      data: null,
    };
  },
};
