import { readFileSync } from "fs";
import { Worker, WorkerBio } from "./model.js";
import { getManager } from "../manager/db.js";

/** @type {Array<Worker>} */
let workers = [];

export function readWorkersFromDisk() {
  const data = readFileSync("./data/worker.json");
  const workerBios = JSON.parse(data);
  if (Array.isArray(workerBios)) {
    workers = workerBios.map((bio) => {
      let worker = new Worker(WorkerBio.fromJSON(bio));
      let manager = getManager(worker.bio.supervisorID);

      if (manager != null) {
        worker.manager = manager;
      }
      return worker;
    })
    console.log(`已載入 ${workers.length} 名工人資料。`);
  } else {
    console.log("沒有任何工人資料被載入。");
  }
}

export function getWorker(id = 0) {
  return workers.find((worker) => worker.bio == id);
}

export function getWorkersByManager(mID) {
  return workers.filter((worker) => worker.bio.supervisorID == mID);
}
