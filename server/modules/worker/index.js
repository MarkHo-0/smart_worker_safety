import { WebSocketServer } from "ws";
import { WorkerCondition } from "./model.js";
import { getWorker, readWorkersFromDisk } from "./db.js";

readWorkersFromDisk();

const workerServer = new WebSocketServer({
  noServer: true,
  clientTracking: true,
});

workerServer.on("connection", async (client, req) => {
  //根據工友ID獲取資料
  const worker = getWorker(client.unverifiedID);

  //檢查工友編號是否存在，以及檢查是否重複連接
  if (!worker || worker.isOnline) return client.close();

  //將工友設為上線
  worker.online(client, new WorkerCondition());
});

export { workerServer };
