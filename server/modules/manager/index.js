import { WebSocketServer } from "ws";
import { getWorkersByManager } from "../worker/db.js";
import { getManager, setFCMtoken } from "./db.js";
import { IncompleteInteraction } from "../../utils/incomplete_interaction.js";

const managerServer = new WebSocketServer({
  noServer: true,
  clientTracking: true,
});

managerServer.on("connection", async (client, req) => {
  const identity = await getManager(req.unverifiedID);
  if (!identity) return client.close();
  client.identity = identity;

  client.on("message", (eventable) => {
    if (eventable instanceof String) {
      eventable = JSON.parse(eventable);
    }

    switch (eventable.event) {
      case "get_workers":
        getWorkersByManager(identity.id).then((workers) =>
          client.send({ wokers_data_changed: workers })
        );
        break;

      case "reminder":
        break;
      case "call_to_office":
        break;
      case "request_condition":
        const targetID = parseInt(eventable.data["to"]);
        const request = new IncompleteInteraction(
          "request_condition",
          identity.id,
          targetID
        );
        request.setOnComplete((worker_condition) => {
          client.send({ from: targetID, reply_condition: worker_condition });
        });
        request.setOnTimeOut(10, () => {
          client.send({ from: targetID, reply_condition: null });
        });
        break;

      case "fcm_token":
        setFCMtoken(identity, eventable.data);
        break;
      default:
        break;
    }
  });
});

export { managerServer };
