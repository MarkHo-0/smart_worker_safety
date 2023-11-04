import { WebSocket } from "ws";

export class WorkerCommnication {
  constructor(self, allCients) {
    /** @type {WebSocket} */ this.self = self;
    /** @type {Set<WebSocket>} */ this.allCients = allCients || new Set();
  }

  sendToManager(data) {
    const managerID = this.self.identity.supervisorID;
    for (const client of this.allCients.values()) {
      if (client.identity.supervisorID !== undefined) continue;
      if (client.identity.id == managerID) {
        client.send(data);
      }
    }
  }

  sendToMyself(data) {
    this.self.send(data);
  }
}
