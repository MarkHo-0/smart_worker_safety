export function requestHelp(worker, detail) {
  const taskID = setTimeout(
    () => commnication.sendToManager(helpType),
    data.delaySecond * 1000
  );
  helpList.push(taskID);
}

export function revokeHelp(worker = {}) {
  clearTimeout();
}

/**
 * @typedef HelpContent
 * @type {Object}
 * @property {int} type
 * @property {int} delaySecond
 */
