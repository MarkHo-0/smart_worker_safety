import { JSONPreset } from "lowdb/node";
import { Manager } from "./model.js";

/** @type {Array<Manager>} */
const managerData = [];
const db = await JSONPreset("./data/manager.json", managerData);

export async function getManager(id = 0) {
  await db.read();
  return db.data.find((manager) => manager.id == id);
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
