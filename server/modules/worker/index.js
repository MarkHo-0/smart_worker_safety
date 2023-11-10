import { WebSocketServer } from "ws";
import {
  isAtRestingSites,
  wifiSignalData2Location,
} from "../wifi_signal/index.js";
import { requestHelp } from "./help.js";
import { Worker, WorkerCondition, WorkerStatus } from "./model.js";
import { getWorker } from "./db.js";
import { getIncompleteInteraction } from "../../utils/incomplete_interaction.js";

const workerServer = new WebSocketServer({
  noServer: true,
  clientTracking: true,
});

workerServer.on("connection", async (client, req) => {
  const worker = getWorker(client.undefined);

  //檢查工友編號是否存在，以及檢查是否重複連接
  if (!worker || worker.isOnline) return client.close();

  //將工友設為上線
  worker.online(client, new WorkerCondition());

  worker.on("wifi_signal_changed", (data) => {
    const newLocation = wifiSignalData2Location(data);
    if (newLocation == worker.onlineData.location) return;
    mayChangeWorkerStatus(worker, newLocation);
  });

  worker.on("temperature_updated", (data) => {
    worker.condition.bodyTemperature = data["body"];
    worker.condition.envTemperature = data["env"];
  });

  worker.on("helmet_state_updated", (data) => {
    worker.condition.withHelmet = Boolean(data);
  });

  worker.on("reply_condition", (data) => {
    const conditionReqeust = getIncompleteInteraction(
      "request_condition",
      undefined,
      worker.bio.id
    );
    if (conditionReqeust == undefined) return;
    conditionReqeust.complete(data);
  });

  worker.on("request_help", (data) => {
    worker.manager.pushNotification({ worker: worker.toJSON(), help: data });
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
