import { Onlineable } from "../../utils/onlineable.js";
import { Worker } from "../worker/model";

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

/** @augments Onlineable<Array<Worker>> */
export class Manager extends Onlineable {
  constructor(bio) {
    super();
    /** @type {ManagerBio} */ this.bio = bio;
  }

  setFCMtoken(token) {
    this.bio.fcmToken = token;
  }

  pushNotification(data) {}
}
