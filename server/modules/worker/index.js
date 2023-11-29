import { WebSocketServer } from "ws";
import { WorkerCondition } from "./model.js";
import { getWorker, readWorkersFromDisk } from "./db.js";

readWorkersFromDisk();

const workerServer = new WebSocketServer({
  noServer: true,
  clientTracking: true,
});

export function connectWorkerServer(req, socket, head, unverifiedID) {
  const worker = getWorker(unverifiedID);

  if (worker == null) {
    socket.write("HTTP/1.1 404 Invalid ID\r\n\r\n");
    socket.destroy();
    return;
  }

  if (worker.isOnline) worker.offline();

  workerServer.handleUpgrade(req, socket, head, (ws) => {
    workerServer.emit("connection", ws, req);
    worker.online(ws, new WorkerCondition());
  });
}
