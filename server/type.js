import { WebSocket } from "ws";

/**
 * @template T
 * @typedef {Object} ValidUser
 * @property {T} identity
 */

/**
 * @template T
 * @typedef {WebSocket & ValidUser<T>} Client
 */

export const Types = {};
