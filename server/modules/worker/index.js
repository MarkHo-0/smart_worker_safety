import { WebSocketServer } from "ws";
import {
  isAtRestingSites,
  wifiSignalData2Location,
} from "../wifi_signal/index.js";
import { requestHelp } from "./help.js";
import { Worker, WorkerStatus } from "./model.js";
import { clearConditionData, getWorkerAndInit } from "./db.js";
import { getIncompleteInteraction } from "../../utils/incomplete_interaction.js";

const workerServer = new WebSocketServer({
  noServer: true,
  clientTracking: true,
});

let modifiedWorkerIDList = [];

workerServer.on("connection", async (client, req) => {
  const identity = await getWorkerAndInit(req.unverifiedID);
  if (!identity) return client.close();
  client.identity = identity;

  client.on("message", (eventable) => {
    if (eventable instanceof Buffer) {
      eventable = eventable.toJSON();
    }

    switch (eventable.event) {
      case "wifi_signal_changed":
        const newLocation = wifiSignalData2Location(eventable.data);
        if (newLocation == identity.condition.location) return;
        mayChangeWorkerStatus(identity, newLocation);
        break;

      case "temperature_updated":
        identity.condition.bodyTemperature = eventable.data["body"];
        identity.condition.envTemperature = eventable.data["env"];
        break;

      case "helmet_state_updated":
        identity.condition.withHelmet = Boolean(eventable.data);
        break;

      case "reply_condition":
        const conditionReqeust = getIncompleteInteraction(
          "request_condition",
          undefined,
          identity.bio.id
        );
        if (conditionReqeust == undefined) return;
        conditionReqeust.complete(eventable.data);
        break;

      case "request_help":
        requestHelp(identity, eventable.data);
        break;

      default:
    }
  });

  client.once("close", (code) => {
    clearConditionData(identity.bio.id);
  });
});
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

export { workerServer };
