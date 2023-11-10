import { WebSocketServer } from "ws";
import { getManager } from "./db.js";
import { IncompleteInteraction } from "../../utils/incomplete_interaction.js";
import { getWorkersByManager } from "../worker/db.js";

const managerServer = new WebSocketServer({
  noServer: true,
  clientTracking: true,
});

managerServer.on("connection", async (client, req) => {
  const manager = getManager(req.unverifiedID);

  //檢查工頭ID是否存在，//以及是否重複連接
  if (!manager || manager.isOnline) return client.close();

  //上線
  manager.online(client, getWorkersByManager(manager.bio.id));

  manager
    .on("get_workers", (_) => {
      const result = manager.onlineData
        .sort((a, b) => a.onlineData?.status - b.onlineData?.status)
        .map((worker) => worker.toJSON());
      manager.send({ wokers_data_changed: result });
    })
    .on("request_condition", (data) => {
      const targetID = parseInt(data["target"]);
      const targetWorker = manager.onlineData.find((w) => w.bio.id == targetID);
      targetWorker.send({ request_condition: manager.bio.id });

      const request = new IncompleteInteraction(
        "request_condition",
        manager,
        targetWorker
      );
      request.setOnComplete((worker_condition) => {
        manager.send({ from: targetID, reply_condition: worker_condition });
      });
      request.setOnTimeOut(10, () => {
        manager.send({ from: targetID, reply_condition: null });
      });
    });
});

export { managerServer };
