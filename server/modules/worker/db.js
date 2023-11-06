import { JSONPreset } from "lowdb/node";
import { WorkerBio, WorkerCondition } from "./model.js";

/**
 * @typedef WorkerDatabase
 * @type {object}
 * @property {Array<WorkerBio>} people
 * @property {Array<Object>} condition
 */

/** @type {Array<WorkerBio>} */ const workersBio = [];
const workerBioDB = await JSONPreset("./data/workers.json", workersBio);

/** @type {Map<Number, WorkerCondition>} */
const currentConditions = new Map();

export async function getWorkerAndInit(id = 0) {
  await workerBioDB.read();
  const bio = workerBioDB.data.find((worker) => worker.id == id);
  if (bio == undefined) return undefined;
  const condition = new WorkerCondition();
  currentConditions.set(bio.id, condition);
  return { bio, condition };
}

export async function getWorker(id = 0) {
  await workerBioDB.read();
  const bio = workerBioDB.data.find((worker) => worker.id == id);
  const condition = currentConditions.get(bio.id);
  return { bio, condition };
}

export function clearConditionData(id = 0) {
  return currentConditions.delete(id);
}

export async function getWorkersByManager(mID = 0) {
  const workersBio = workerBioDB.data.filter((bio) => bio.supervisorID == mID);
  return workersBio.map((workerBio) => {
    return { bio: workerBio, conditions: currentConditions.get(workerBio.id) };
  });
}

export async function addWorker(name = "", position = "", supervisorID = 0) {
  const nextID = workersBio.people.length + 1;
  const worker = new WorkerBio(nextID, name, position, supervisorID);
  workerBioDB.data.push(worker);
  await workerBioDB.write();
  return worker;
}
