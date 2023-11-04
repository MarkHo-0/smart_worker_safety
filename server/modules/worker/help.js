import { WorkerCommnication } from "./commnication.js";

const helpList = new Map();

/**
 * @description 工友發送援助請求
 * @param {WorkerCommnication} commnication
 * @param {HelpContent} data
 * @returns
 */
export function requestHelp(commnication, helpType) {
  const taskID = setTimeout(
    () => commnication.sendToManager(data.type),
    data.delaySecond * 1000
  );
  helpList.push(taskID);
}

export function revokeHelp(worker = {}) {
  clearTimeout();
}

function sendHelp(fromWorker = {}, reasonID = 0) {
  return true;
}

/**
 * @typedef HelpContent
 * @type {Object}
 * @property {int} type
 * @property {int} delaySecond
 */
