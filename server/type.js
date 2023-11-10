import { WebSocket } from "ws";

/**
 * @template T
 * @typedef {Object} OnlineUser
 * @property {T} identity
 */

/**
 * @template T
 * @typedef {WebSocket & OnlineUser<T>} Client
 */

export const Types = {};
