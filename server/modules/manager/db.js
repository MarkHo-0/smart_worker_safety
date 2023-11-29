import { readFileSync, writeFile, writeFileSync } from "fs";
import { Manager, ManagerBio } from "./model.js";

const filePath = "./data/manager.json";

/** @type {Array<Manager>} */
let managers = [];

export function readManagersFromDisk() {
  const data = readFileSync(filePath);
  const managerBios = JSON.parse(data);

  if (Array.isArray(managerBios)) {
    managers = managerBios.map((bio) => new Manager(ManagerBio.fromJSON(bio)));
    console.log(`已載入 ${managers.length} 名工頭資料`);
  } else {
    console.log("沒有任何工頭資料被載入。");
  }
}

export function getManager(id = 0) {
  return managers.find((manager) => manager.bio.id == id);
}

export function writeManagersToDisk() {
  const data = JSON.stringify(managers.map((m) => m.bio));
  writeFile(filePath, data, (error) => {
    if (error) {
      return console.log("寫入工頭資料失敗");
    }
  });
}
