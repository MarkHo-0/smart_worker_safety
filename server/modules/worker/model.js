import { getIncompleteInteraction } from "../../utils/incomplete_interaction.js";
import { Onlineable } from "../../utils/onlineable.js";
import { Area, trilateration } from "./wifi_signal.js";

/** @augments Onlineable<WorkerCondition> */
export class Worker extends Onlineable {
  constructor(bio) {
    super();
    /** @type {WorkerBio} */ this.bio = bio;
    /** @type {import("../manager/model.js").Manager | null} */ this.manager =
      null;
    /** @type {boolean} */ this.isDataDirty = false;
    this.regesterEvents();
  }

  regesterEvents() {
    this.on("connected", () => (this.isDataDirty = true));
    this.on("disconnected", () => (this.isDataDirty = true));

    this.on("report_sensors_data", (data) => this.processSensorsData(data));

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
        accident_location: this.onlineData.location,
        accident_type: String(data["help_type"]),
        last_reach_time_ms: new Date().getTime().toString(),
      });
    });
  }

  processSensorsData(data) {
    const { body_temp, env_temp, with_helmet, signals } = data;

    if (typeof body_temp == "number") {
      this.onlineData.bodyTemperature = body_temp;
    }

    if (typeof env_temp == "number") {
      this.onlineData.envTemperature = env_temp;
    }

    if (typeof with_helmet == "boolean") {
      this.onlineData.withHelmet = with_helmet;
    }

    if (Array.isArray(signals)) {
      const area = trilateration(signals);
      this.onlineData.location = this.updateStatusFromArea(area);
    }

    this.isDataDirty = true;
  }

  updateStatusFromArea(/** @type {Area | null} */ area) {
    if (area == null) return null;

    const isPreviousResting = this.onlineData.status == WorkerStatus.RESTING;

    if (isPreviousResting && area.isForResting == false) {
      this.onlineData.startTimeMS = Date.now();
      this.onlineData.status = WorkerStatus.WORKING;
    } else if (area.isForResting) {
      this.onlineData.status = WorkerStatus.RESTING;
    }

    return area.name;
  }

  checkDirtyAndClean() {
    if (this.isDataDirty == false) return false;
    this.isDataDirty = false;
    return true;
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
