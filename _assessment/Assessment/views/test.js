import ViewBase from '../lib/viewBase.js';

export default class Test extends ViewBase {
  constructor(props) {
    super(props);
  }

  template() {
    return 'Test';
  }

  afterRender() {
    document.title = 'Test';
  }
}
