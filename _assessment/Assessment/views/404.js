import ViewBase from '../lib/viewBase.js';

export default class NotFound extends ViewBase {
  constructor(props) {
    super(props);
  }

  template() {
    return 'Page not found';
  }

  afterRender() {
    document.title = 'Page not found';
  }
}
