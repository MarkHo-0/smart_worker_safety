import { WebSocket } from "ws";
import { EventEmitter } from "events";

/** @template T */
export class Onlineable extends EventEmitter {
  constructor() {
    super();
    /** @type {WebSocket | null} @private */ this.client = null;
    /** @type {T | null} */ this.onlineData = null;
  }

  /**
   * @param {WebSocket} client
   * @param {T} data
   * @returns
   */
  online(client, data) {
    if (this.isOnline) return false;
    this.client = client;
    this.onlineData = data;

    this.client.on("message", (data) => {
      this.emit(data.e, data.d);
    });

    this.client.once("close", this.offline);

    return true;
  }

  offline() {
    this.client = null;
    this.onlineData = null;
  }

  /**
   * @param {String} event 
   * @param {Object} data 
   */
  send(event, data) {
    if (this.isOnline == false) return;
    return this.client.send({ e: event, d: data });
  }

  get isOnline() {
    return this.client != null && this.client.readyState == WebSocket.OPEN;
  }
}
