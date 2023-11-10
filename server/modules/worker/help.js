export function requestHelp(worker, detail) {}

export function revokeHelp(worker = {}) {
  clearTimeout();
}

/**
 * @typedef HelpContent
 * @type {Object}
 * @property {int} type
 * @property {int} delaySecond
 */
