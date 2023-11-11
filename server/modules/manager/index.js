import { WebSocketServer } from "ws";
import { getManager, readManagersFromDisk } from "./db.js";
import { getWorkersByManager } from "../worker/db.js";

readManagersFromDisk();

const managerServer = new WebSocketServer({
  noServer: true,
  clientTracking: true,
});

managerServer.on("connection", async (client, req) => {
  //根據ID獲取工頭資料
  const manager = getManager(req.unverifiedID);

  //檢查工頭ID是否存在，以及是否重複連接
  if (!manager || manager.isOnline) return client.close();

  //上線
  manager.online(client, getWorkersByManager(manager.bio.id));
});

export { managerServer };
