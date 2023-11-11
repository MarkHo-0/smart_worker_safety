import { JSONPreset } from "lowdb/node";
import { readFileSync } from "fs";
import { Manager, ManagerBio } from "./model.js";

/** @type {Array<Manager>} */
let managers = [];

export function readManagersFromDisk() {
  const data = readFileSync("./data/manager.json");
  const managerBios = JSON.parse(data);

  if (Array.isArray(managerBios)) {
    managers = managerBios.map(
      (bio) => new Manager(ManagerBio.fromJSON(bio))
    );
    console.log(`已載入 ${managers.length} 名工頭資料`)
  } else {
    console.log("沒有任何工頭資料被載入。");
  }
}

export function getManager(id = 0) {
  return managers.find((manager) => manager.bio.id == id);
}

export async function createRandomData() {
  await db.read();
  if (db.data && db.data.length > 0) {
    db.data = [];
  }

  const names = ["大飛", "大陳", "大周", "大劉"];

  for (let id = 0; id < names.length; id++) {
    db.data.push(new Manager(id + 1, names[id]));
  }

  return db.write();
}
