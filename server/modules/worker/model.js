import { getIncompleteInteraction } from "../../utils/incomplete_interaction.js";
import { Onlineable } from "../../utils/onlineable.js";

/** @augments Onlineable<WorkerCondition> */
export class Worker extends Onlineable {
  constructor(bio) {
    super();
    /** @type {WorkerBio} */ this.bio = bio;
    /** @type {import("../manager/model.js").Manager | null} */ this.manager = null;
    this.regesterEvents()
  }

  regesterEvents() {
    this.on("wifi_signal_changed", (data) => {
      const newLocation = wifiSignalData2Location(data);
      if (newLocation == this.onlineData.location) return;
      mayChangeWorkerStatus(newLocation);
      this.onlineData.location = newLocation;
    });

    this.on("temperature_updated", (data) => {
      worker.condition.bodyTemperature = data["body"];
      worker.condition.envTemperature = data["env"];
    });

    this.on("helmet_state_updated", (data) => {
      worker.condition.withHelmet = Boolean(data["withHelmet"]);
    });

    this.on("reply_condition", (data) => {
      const conditionReqeust = getIncompleteInteraction(
        "request_condition",
        undefined,
        this.bio.id
      );
      if (conditionReqeust == undefined) return;
      conditionReqeust.complete(data);
    });

    this.on("request_help", (data) => {
      this.manager.pushNotification({
        worker_id: worker.bio.id,
        worker_name: worker.bio.name,
        accident_location: worker.onlineData.location,
        accident_type: String(data['help_type']),
        last_reach_time_ms: new Date().getTime().toString(),
      });
    });
  }

  mayChangeWorkerStatus(newLocation) {
    const isWorking = this.onlineData.status == WorkerStatus.WORKING;

    if (isWorking == isAtRestingSites(newLocation)) {
      this.onlineData.status = isWorking
        ? WorkerStatus.RESTING
        : WorkerStatus.WORKING;
      this.onlineData.startTimeMS = new Date().getTime();
      return true;
    }
    return false;
  }

  toJSON() {
    return {
      bio: this.bio,
      condition: this.onlineData,
    };
  }
}

export class WorkerCondition {
  status = WorkerStatus.WORKING;
  location = "";
  bodyTemperature = 0;
  envTemperature = 0;
  startTimeMS = 0;
  withHelmet = false;
}

export class WorkerBio {
  constructor(id = 0, name = "", position = "", supervisorID = "") {
    /** @type {number} */ this.id = id;
    /** @type {string} */ this.name = name;
    /** @type {string} */ this.position = position;
    /** @type {number} */ this.supervisorID = supervisorID;
  }

  static fromJSON(d) {
    return new this(d["id"], d["name"], d["position"], d["supervisorID"]);
  }
}

export const WorkerStatus = {
  RESTING: 0,
  WORKING: 1,
};
