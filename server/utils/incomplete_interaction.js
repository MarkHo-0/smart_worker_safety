/** @type {Set<IncompleteInteraction>} */
let interactions = new Set();

export class IncompleteInteraction {
  constructor(type, fromID, toID) {
    /** @type {String} */ this.type = type;
    /** @type {Number} */ this.fromID = fromID;
    /** @type {Number} */ this.toID = toID;
    /** @private @type {Number} */ this.timeoutID = null;
    /** @private @type {Function} */ this.onCompleteFunc = null;
    this.startAt = Date.prototype.getTime();
    interactions.push(this);
  }

  setOnTimeOut(second = 0, func) {
    this.timeoutID = setTimeout(second * 1000, func);
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
    if (!(i.fromID != undefined && i.fromID == fromID)) continue;
    if (!(i.toID != undefined && i.toID == toID)) continue;
    return i;
  }
}
