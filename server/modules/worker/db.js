import { JSONPreset } from "lowdb/node";
import { WorkerBio, WorkerCondition } from "./model.js";

/**
 * @typedef WorkerDatabase
 * @type {object}
 * @property {Array<WorkerBio>} people
 * @property {Array<Object>} condition
 */

/** @type {Array<WorkerBio>} */ const workersBio = [];
/** @type {Array<Object>} */ const conditions = [];
const workerDB = await JSONPreset("./data/worker.json", workersBio);
const conditionRecord = await JSONPreset(
  "./data/worker_condition.json",
  conditions
);

/** @type {Map<Number, WorkerCondition>} */
const currentCondition = new Map();

export async function getWorker(id = 0) {
  await workerDB.read();
  const bio = workerDB.data.find((worker) => worker.id == id);
  if (bio == undefined) return undefined;
  const condition = currentCondition.get(bio.id);
  return { bio, condition };
}

export async function getWorkersByManager(mID = 0) {
  const workersBio = workerDB.data.filter((bio) => bio.supervisorID == mID);
  return workersBio.map((workerBio) => {
    return { bio: workerBio, conditions: currentCondition.get(workerBio.id) };
  });
}

export async function addWorker(name = "", position = "", supervisorID = 0) {
  const nextID = workersBio.people.length + 1;
  const worker = new WorkerBio(nextID, name, position, supervisorID);
  workerDB.data.push(worker);
  await workerDB.write();
  return worker;
}
