import PubSub from './pubsub.js';

export default class Store {
  constructor(params) {
    this.actions = {};
    this.mutations = {};
    this.status = 'resting';
    this.events = new PubSub();
    this._notify = true;

    if (Object.prototype.hasOwnProperty.call(params, 'actions')) {
      this.actions = params.actions;
    }

    if (Object.prototype.hasOwnProperty.call(params, 'mutations')) {
      this.mutations = params.mutations;
    }

    this.state = new Proxy(params.state, {
      set: (state, key, value) => {
        state[key] = value;

        if (this._notify) {
          this.events.publish('stateChange', this.state);
          this.status = 'resting';
        }

        return true;
      },
    });
  }

  dispatch(actionKey, payload) {
    if (typeof this.actions[actionKey] !== 'function') {
      console.error(`Action "${actionKey}" doesn't exist.`);
      return false;
    }

    this.status = 'action';
    this.actions[actionKey](this, payload);
    return true;
  }

  commit(mutationKey, payload) {
    if (typeof this.mutations[mutationKey] !== 'function') {
      console.error(`Mutation "${mutationKey}" doesn't exist.`);
      return false;
    }

    const patch = this.mutations[mutationKey](this.state, payload) || {};
    this.status = 'mutation';
    this._notify = false;
    Object.assign(this.state, patch);
    this._notify = true;
    this.status = 'resting';
    this.events.publish('stateChange', this.state);
    return true;
  }
}
