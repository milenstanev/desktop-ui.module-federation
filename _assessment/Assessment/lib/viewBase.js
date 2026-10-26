import Store from './store.js';

export default class ViewBase {
  constructor(props = {}, $main = document.getElementById('main')) {
    this.constructor.initStore.call(this, props);
    this._element = document.createElement('div');
    this.$viewPlaceholder = $main;
    this.render();
  }

  static cleanMain() {
    this.$viewPlaceholder.replaceChildren();
  }

  static initStore(props) {
    if (props.store instanceof Store) {
      this._unsubscribe = props.store.events.subscribe('stateChange', () => {
        this.render();
      });
      this.state = props.store.state;
    }
  }

  template() {
    return '404';
  }

  afterRender() {}

  destroy() {
    if (typeof this._unsubscribe === 'function') {
      this._unsubscribe();
      this._unsubscribe = null;
    }
  }

  get element() {
    return this._element;
  }

  render() {
    this.constructor.cleanMain.call(this);
    this.element.innerHTML = this.template();
    this.$viewPlaceholder.append(this.element);
    this.afterRender();
  }
}
