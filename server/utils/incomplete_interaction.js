import { Manager } from "../modules/manager/model.js";
import { Worker } from "../modules/worker/model.js";

/** @type {Set<IncompleteInteraction>} */
let interactions = new Set();

export class IncompleteInteraction {
  constructor(type, from, to) {
    /** @type {String} */ this.type = type;
    /** @type {Worker | Manager} */ this.from = from;
    /** @type {Worker | Manager} */ this.to = to;
    /** @private @type {Number} */ this.timeoutID = null;
    /** @private @type {Function} */ this.onCompleteFunc = null;
    this.startAt = Date.prototype.getTime();
    interactions.add(this);
  }

  setOnTimeOut(second = 0, func) {
    this.timeoutID = setTimeout(second * 1000, func);
    interactions.delete(this);
  }

  setOnComplete(func) {
    this.onCompleteFunc = func;
  }

  complete(data) {
    if (this.onCompleteFunc != null) this.onCompleteFunc(data);
    if (this.timeoutID != null) clearTimeout(this.timeoutID);
    return interactions.delete(this);
  }
}

export function getIncompleteInteraction(type, fromID, toID) {
  for (const i of interactions) {
    if (i.type != type) continue;
    if (!(i.from != undefined && i.from == fromID)) continue;
    if (!(i.to != undefined && i.to == toID)) continue;
    return i;
  }
}
