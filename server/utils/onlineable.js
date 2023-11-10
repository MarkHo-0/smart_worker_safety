import { EventEmitter, WebSocket } from "ws";

/** @template T */
export class Onlineable extends EventEmitter {
  constructor() {
    /** @type {WebSocket | null} @private */ this.client = null;
    /** @type {T | null} */ this.onlineData = null;
  }

  /**
   *
   * @param {WebSocket} client
   * @param {T} data
   * @returns
   */
  online(client, data) {
    if (this.isOnline) return false;
    this.client = client;
    this.onlineData = data;

    this.client.on("message", (data) => {
      this.emit(data.event, data);
    });

    this.client.once("close", this.offline);

    return true;
  }

  offline() {
    this.client = null;
    this.onlineData = null;
  }

  send(data) {
    if (this.isOnline == false) return;
    this.client.send(data);
  }

  get isOnline() {
    return this.client != null;
  }
}
