import store from '../store/index.js';

class SearchForm extends HTMLElement {
  constructor() {
    super();

    const { query = '', status = 'idle' } = store.state;
    const form = document.createElement('form');
    const label = document.createElement('label');
    const input = document.createElement('input');
    const button = document.createElement('button');

    label.htmlFor = 'movie-search-input';
    label.textContent = 'Movie title';

    input.id = 'movie-search-input';
    input.type = 'search';
    input.name = 'search';
    input.value = query;
    input.autocomplete = 'off';

    button.type = 'submit';
    button.textContent = status === 'loading' ? 'Searching…' : 'Search';
    button.disabled = status === 'loading';

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      store.dispatch('loadData', { search: input.value });
    });

    form.append(label, input, button);
    this.replaceChildren(form);
  }
}

customElements.define('search-form', SearchForm);
