const posterUrl = (value) => (
  typeof value === 'string' && /^https?:\/\//i.test(value) ? value : ''
);

class MovieList extends HTMLElement {
  set viewModel(model) {
    this._model = model || {};
    this.renderList();
  }

  renderList() {
    const { items = [], status = 'idle', error = '' } = this._model || {};
    this.replaceChildren();

    if (status === 'loading') {
      this.append(message('Searching…'));
      return;
    }

    if (status === 'error') {
      this.append(message(error || 'Search failed.'));
      return;
    }

    if (status === 'idle') {
      this.append(message('Search for a movie by title.'));
      return;
    }

    if (!items.length) {
      this.append(message('No matches.'));
      return;
    }

    const list = document.createElement('ul');
    items.forEach((item) => {
      if (!item || !item.imdbID) return;

      const entry = document.createElement('li');
      const link = document.createElement('a');
      const title = document.createElement('span');
      const year = document.createElement('small');

      link.href = `#/movie-details/${encodeURIComponent(item.imdbID)}`;
      title.textContent = item.Title || 'Untitled';
      year.textContent = item.Year || '';
      link.append(title);

      const src = posterUrl(item.Poster);
      if (src) {
        const image = document.createElement('img');
        image.src = src;
        image.alt = '';
        link.append(image);
      }

      link.append(year);
      entry.append(link);
      list.append(entry);
    });

    this.append(list);
  }
}

function message(text) {
  const paragraph = document.createElement('p');
  paragraph.className = 'message';
  paragraph.textContent = text;
  return paragraph;
}

customElements.define('movie-list', MovieList);
