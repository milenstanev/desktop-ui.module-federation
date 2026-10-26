export default class PubSub {
  constructor() {
    this.events = {};
  }

  subscribe(event, callback) {
    if (!Object.prototype.hasOwnProperty.call(this.events, event)) {
      this.events[event] = [];
    }

    this.events[event].push(callback);

    return () => {
      this.events[event] = this.events[event].filter((item) => item !== callback);
    };
  }

  publish(event, data = {}) {
    const callbacks = this.events[event];
    if (!callbacks) {
      return [];
    }

    return callbacks.slice().map((callback) => {
      try {
        return callback(data);
      } catch (error) {
        console.error(error);
        return undefined;
      }
    });
  }
}
