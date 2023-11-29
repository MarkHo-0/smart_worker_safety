/** @type {Map<String, AccessPoint>} */
const accessPoints = new Map();

/** @type {Array<Area>} */
const areas = [];

export function trilateration(/** @type {RawSignals} */ rawSignals) {
  const signals = parseRawSignals(rawSignals);
  if (signals.length == 0) return null;
  return solveSignals(signals);
}

function parseRawSignals(/** @type {RawSignals} */ signals) {
  return signals
    .filter((s) => accessPoints.has(s.bssid)) //刪去未記錄的信號源
    .sort((a, b) => a.rssi - b.rssi)
    .map((s) => {
      const accessPoint = accessPoints.get(s.bssid) || AccessPoint.empty();
      const distance = accessPoint.calculateDistanceFromSignal(s.rssi);
      return { accessPoint, distance };
    });
}

function solveSignals(/** @type {Signals} */ signals) {
  if (signals.length < 3) return solveOneOrTwoSignal(signals);
  if (signals.length > 3) return solveFourOrMoreSignal(signals);
  return solveThreeSignal(signals);
}

function solveOneOrTwoSignal() {
  //TODO: 數學問題，完成後移除下方返回
  return new Area();
}

function solveThreeSignal() {
  //TODO: 數學問題，完成後移除下方返回
  return new Area();
}

function solveFourOrMoreSignal() {
  //TODO: 數學問題，完成後移除下方返回
  return new Area();
}

class AccessPoint {
  constructor(macAddress, location, txPower) {
    /** @type {string} */ this.macAddress = macAddress;
    /** @type {Point} */ this.location = location;
    /** @type {number} */ this.txPower = txPower;
  }

  calculateDistanceFromSignal(rssi) {
    const PL0 = this.txPower - rssi;
    return Math.pow(10, (this.txPower - rssi - PL0) / (10 * 2));
  }

  static empty() {
    return new this("", Point.zero(), 0);
  }
}

export class Area {
  constructor(name, position, dimension, isForResting = false) {
    /** @type {string} */ this.name = name;
    /**
     * @type {Point} @description
     * @description 區域的左下後方
     */
    this.position = position;
    /**
     * @type {Point} @description
     * @description 尺寸單位為米
     */
    this.dimension = dimension;

    /** @type {boolean} */ this.isForResting = isForResting;
  }
}

class Point {
  constructor(x, y, z) {
    /** @type {number} */ this.x = x;
    /** @type {number} */ this.y = y;
    /** @type {number} */ this.z = z;
  }

  static zero() {
    return new this(0, 0, 0);
  }
}

/**
 * @typedef {Object} RawSignal
 * @property {String} bssid
 * @property {number} rssi
 */

/**
 * @typedef {Object} Signal
 * @property {AccessPoint} accessPoint
 * @property {number} distance
 */

/** @typedef {Array<RawSignal>} RawSignals */
/** @typedef {Array<Signal>} Signals */
