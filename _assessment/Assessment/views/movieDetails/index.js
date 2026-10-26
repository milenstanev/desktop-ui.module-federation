import ViewBase from '../../lib/viewBase.js';
import store from './store/index.js';

const FIELDS = [
  ['Year', 'Year'],
  ['Rated', 'Rated'],
  ['Released', 'Released'],
  ['Runtime', 'Runtime'],
  ['Genre', 'Genre'],
  ['Director', 'Director'],
  ['Writer', 'Writer'],
  ['Actors', 'Actors'],
  ['Language', 'Language'],
  ['Country', 'Country'],
  ['Awards', 'Awards'],
  ['imdbRating', 'IMDb rating'],
  ['imdbVotes', 'IMDb votes'],
  ['BoxOffice', 'Box office'],
];

const shown = (value) => value != null && value !== '' && value !== 'N/A';

const ratingsText = (data) => {
  if (!Array.isArray(data.Ratings)) return '';
  return data.Ratings
    .filter((item) => item && shown(item.Source) && shown(item.Value))
    .map((item) => `${item.Source}: ${item.Value}`)
    .join(' · ');
};

const addRow = (list, label, value) => {
  if (!shown(value)) return;
  const term = document.createElement('dt');
  const detail = document.createElement('dd');
  term.textContent = label;
  detail.textContent = String(value);
  list.append(term, detail);
};

export default class MovieDetails extends ViewBase {
  constructor(_props, $main) {
    store.commit('setLoading');
    super({ store }, $main);
    store.dispatch('loadData');
  }

  template() {
    return `
      <p><a href="#/">Go to Search</a></p>
      <div class="details-root" aria-live="polite"></div>
    `;
  }

  afterRender() {
    const root = this.element.querySelector('.details-root');
    if (!root) return;

    const { status, error, data } = this.state;
    root.replaceChildren();

    if (status === 'loading' || status === 'idle') {
      root.textContent = 'Loading movie…';
      document.title = 'Loading movie';
      return;
    }

    if (status === 'error' || !data) {
      const message = document.createElement('p');
      message.className = 'message';
      message.textContent = error || 'Movie not found.';
      root.append(message);
      document.title = 'Movie not found';
      return;
    }

    const layout = document.createElement('article');
    layout.className = 'details';

    if (typeof data.Poster === 'string' && /^https?:\/\//i.test(data.Poster)) {
      const image = document.createElement('img');
      image.src = data.Poster;
      image.alt = '';
      layout.append(image);
    }

    const copy = document.createElement('div');
    const heading = document.createElement('h1');
    heading.textContent = data.Title || 'Untitled';
    copy.append(heading);

    if (shown(data.Plot)) {
      const plot = document.createElement('p');
      plot.textContent = data.Plot;
      copy.append(plot);
    }

    const facts = document.createElement('dl');
    FIELDS.forEach(([key, label]) => addRow(facts, label, data[key]));
    addRow(facts, 'Ratings', ratingsText(data));
    copy.append(facts);
    layout.append(copy);
    root.append(layout);
    document.title = data.Title || 'Movie details';
  }
}
