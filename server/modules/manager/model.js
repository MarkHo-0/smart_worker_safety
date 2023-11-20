import { IncompleteInteraction } from "../../utils/incomplete_interaction.js";
import { Onlineable } from "../../utils/onlineable.js";
import { Worker, WorkerCondition } from "../worker/model.js";

/** @augments Onlineable<Array<Worker>> */
export class Manager extends Onlineable {
  constructor(bio) {
    super();
    /** @type {ManagerBio} */ this.bio = bio;
    /** @type {number | null} */ this.updateClientFunc = null;
    this.registerEvent();
  }

  registerEvent() {
    this.on("get_workers", (_) => {
      const result = this.onlineData
        .sort((a, b) => a.onlineData?.status - b.onlineData?.status)
        .map((worker) => worker.toJSON());
      this.send("workers_data_all", result);
      this.rescheduleUpdateClient();
    });
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
        manager.send("reply_condition", {
          from: targetID,
          condition: worker_condition,
        });
      });
      request.setOnTimeOut(10, () => {
        manager.send("reply_condition", { from: targetID, condition: null });
      });
    });

    this.on("connected", () => this.rescheduleUpdateClient());
    this.on("disconnected", () => this.stopUpdateClient());
  }

  rescheduleUpdateClient() {
    this.stopUpdateClient();
    this.updateClientFunc = setInterval(
      () => this.sendDirtyWorkersCondition(),
      5000
    );
  }

  stopUpdateClient() {
    if (this.updateClientFunc == null) return;
    clearInterval(this.updateClientFunc);
    this.updateClientFunc = null;
  }

  sendDirtyWorkersCondition() {
    const dirtyConditions = this.onlineData
      .filter((w) => w.checkDirtyAndClean())
      .map((w) => ({ id: w.bio.id, c: w.onlineData }));
    if (dirtyConditions == 0) return;
    this.send("workers_condition_updated", dirtyConditions);
  }

  setFCMtoken(token) {
    this.bio.fcmToken = token;
  }

  pushNotification(data) {}
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
