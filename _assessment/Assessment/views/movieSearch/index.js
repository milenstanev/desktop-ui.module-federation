import ViewBase from '../../lib/viewBase.js';
import store from './store/index.js';
import './components/searchForm.js';
import './components/movieList.js';

export default class MovieSearch extends ViewBase {
  constructor(_props, $main) {
    super({ store }, $main);
  }

  template() {
    return `
      <search-form></search-form>
      <movie-list aria-live="polite"></movie-list>
    `;
  }

  afterRender() {
    const list = this.element.querySelector('movie-list');
    if (list) {
      list.viewModel = {
        items: this.state.data || [],
        status: this.state.status,
        error: this.state.error,
      };
    }

    document.title = this.state.query
      ? `Search: ${this.state.query}`
      : 'Movie search';
  }
}
