import { getWorkersByManager } from "../worker/db.js";
import { getManager } from "./db.js";
import { Manager } from "./model.js";

/**
 *
 * @param {Manager} manager
 * @param {*} data
 */
export function onManagerMessage(manager, data = {}) {
  switch (data.event) {
    case "get_workers":
      const worker = getWorkersByManager(manager.id);
      break;
    case "reminder":
      break;
    case "call_to_office":
      break;
    case "request_condition":
      break;
    default:
      break;
  }
}

export { getManager };
