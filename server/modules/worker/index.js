import {
  isAtRestingSites,
  wifiSignalData2Location,
} from "../wifi_signal/index.js";
import { requestHelp, revokeHelp } from "./help.js";
import { Worker, WorkerStatus } from "./model.js";

/**
 *
 * @param {Worker} worker
 * @param {Object} rawData
 */
export function onWorkerMessage(worker = {}, rawData) {
  switch (rawData.event) {
    case "wifi_signal_changed":
      const newLocation = wifiSignalData2Location(rawData.data);
      if (newLocation == worker.condition.location) return;
      mayChangeWorkerStatus(worker, newLocation);
      break;

    case "update_temperature":
      break;

    case "request_help":
      requestHelp(worker, rawData.data);
      break;

    case "revoke_help":
      revokeHelp(worker);
      break;

    default:
  }
}

/**
 * @param {Worker} worker
 * @param {String} newLocation
 */
function mayChangeWorkerStatus(worker, newLocation) {
  const isWorking = worker.condition.status == WorkerStatus.WORKING;

  if (isWorking == isAtRestingSites(newLocation)) {
    worker.condition.status = isWorking
      ? WorkerStatus.RESTING
      : WorkerStatus.WORKING;
    worker.condition.startTimeMS = new Date().getTime();
    return true;
  }
  return false;
}

export { getWorker } from "./db.js";
