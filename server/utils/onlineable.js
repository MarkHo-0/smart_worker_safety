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
      if (data instanceof Buffer) data = JSON.parse(data.toString());
      this.emit(data.e, data.d);
    });

    this.client.once("close", this.offline);
    this.emit("connected");
    return true;
  }

  offline() {
    if (this.client && this.client.OPEN) {
      this.client.close();
    }
    this.emit("disconnected");
    this.client = null;
    this.onlineData = null;
  }

  /**
   * @param {String} event
   * @param {Object} data
   */
  send(event, data) {
    if (this.isOnline == false) return;
    data = JSON.stringify({ e: event, d: data });
    return this.client.send(data);
  }

  get isOnline() {
    return this.client != null && this.client.readyState == WebSocket.OPEN;
  }
}
