export class WorkerCondition {
  status = WorkerStatus.HOLIDAY;
  location = "";
  bodyTemperature = 0;
  envTemperature = 0;
  startTimeMS = 0;
  withHelmet = false;
}

export class WorkerBio {
  id = 0;
  name = "";
  position = "";
  supervisorID = 0;

  constructor(id = 0, name = "", position = "", supervisorID = "") {
    this.id = id;
    this.name = name;
    this.position = position;
    this.supervisorID = supervisorID;
  }
}

export class Worker {
  bio = new WorkerBio();
  condition = new WorkerCondition();
}

export const WorkerStatus = {
  HOLIDAY: 0,
  WORKING: 1,
  RESTING: 2,
};
