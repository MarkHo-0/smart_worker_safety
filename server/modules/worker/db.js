import { readFileSync } from "fs";
import { Worker, WorkerBio } from "./model.js";

/** @type {Array<Worker>} */
let workers = [];

export function readWorkers() {
  const data = readFileSync("./data/worker.json");
  const workerBios = JSON.parse(data);
  if (Array.isArray(workerBios) == false) throw "Invalid Worker Data";
  workers = workerBios.forEach(
    (bio) => new Worker(new WorkerBio.fromJSON(bio))
  );
}

export function getWorker(id = 0) {
  return workers.find((worker) => worker.bio == id);
}

export function getWorkersByManager(mID) {
  return workers.filter((worker) => worker.bio.supervisorID == mID);
}
