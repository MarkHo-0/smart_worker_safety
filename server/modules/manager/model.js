import { IncompleteInteraction } from "../../utils/incomplete_interaction.js";
import { Onlineable } from "../../utils/onlineable.js";
import { Worker } from "../worker/model.js";

/** @augments Onlineable<Array<Worker>> */
export class Manager extends Onlineable {
  constructor(bio) {
    super();
    /** @type {ManagerBio} */ this.bio = bio;
    this.registerEvent();
  }

  registerEvent() {
    this.on("get_workers", (_) => {
      const result = this.onlineData
        .sort((a, b) => a.onlineData?.status - b.onlineData?.status)
        .map((worker) => worker.toJSON());
      manager.send("wokers_data_changed", { workers: result });
    })
    this.on("request_condition", (data) => {
      const targetID = parseInt(data["target"]);
      const targetWorker = this.onlineData.find((w) => w.bio.id == targetID);
      targetWorker.send("request_condition", { from: this.bio.id });

      const request = new IncompleteInteraction(
        "request_condition",
        manager,
        targetWorker
      );
      request.setOnComplete((worker_condition) => {
        manager.send("reply_condition", { from: targetID, condition: worker_condition });
      });
      request.setOnTimeOut(10, () => {
        manager.send("reply_condition", { from: targetID, condition: null });
      });
    });
  }

  setFCMtoken(token) {
    this.bio.fcmToken = token;
  }

  pushNotification(data) { }
}

export class ManagerBio {
  constructor(id, name, fcmToken = null) {
    /** @type {Number} */ this.id = id;
    /** @type {String} */ this.name = name;
    /** @type {String | null} */ this.fcmToken = fcmToken;
  }

  static fromJSON(d) {
    return new this(d["id"], d["name"], d["null"]);
  }
}

