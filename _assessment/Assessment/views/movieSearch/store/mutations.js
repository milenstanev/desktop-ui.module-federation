export default {
  setLoading(_state, query) {
    return {
      status: 'loading',
      error: '',
      query,
      data: [],
    };
  },
  loadData(state, payload) {
    return {
      status: 'ready',
      error: '',
      query: state.query,
      data: payload,
    };
  },
  apiError(state, error) {
    return {
      status: 'error',
      error: String(error),
      query: state.query,
      data: [],
    };
  },
};
