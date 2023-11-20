import { WebSocketServer } from "ws";
import { getManager, readManagersFromDisk } from "./db.js";
import { getWorkersByManager } from "../worker/db.js";

readManagersFromDisk();

const managerServer = new WebSocketServer({
  noServer: true,
  clientTracking: true,
});

export function connectManagerServer(req, socket, head, unverifiedID) {
  const manager = getManager(unverifiedID);

  if (manager == null) {
    socket.write("HTTP/1.1 404 Invalid ID\r\n\r\n");
    socket.destroy();
    return;
  }

  if (manager.isOnline) manager.offline();

  managerServer.handleUpgrade(req, socket, head, (ws) => {
    managerServer.emit("connection", ws, req);
    manager.online(ws, getWorkersByManager(manager.bio.id));
  });
}

export { getManager };
