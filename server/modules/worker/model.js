import { Onlineable } from "../../utils/onlineable.js";
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

/** @augments Onlineable<WorkerCondition> */
export class Worker extends Onlineable {
  constructor(bio) {
    super();
    /** @type {WorkerBio} */ this.bio = bio;
    /** @type {import("../manager/model.js").Manager} */ this.manager = null;
  }

  sendToWatch(data) {
    if (this.isOnline) this.client.send(data);
  }

  toJSON() {
    return {
      bio: this.bio,
      condition: this.onlineData,
    };
  }
}

export const WorkerStatus = {
  RESTING: 0,
  WORKING: 1,
};
