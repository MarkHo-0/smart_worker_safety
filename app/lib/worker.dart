import 'package:flutter/material.dart';
import 'dart:math';

import 'package:smart_worker_safety/testdata.dart';

Random random = Random();
int workerCount = 0;

class Worker {
  final WorkerBio bio;
  WorkerCondition condition;

  Worker({required this.bio, required this.condition});

  factory Worker.random() {
    return Worker(
      bio: WorkerBio.random(),
      condition: WorkerCondition.random(),
    );
  }

  factory Worker.fromName(String name) {
    return Worker(
      bio: WorkerBio.fromName(name),
      condition: WorkerCondition.empty(),
    );
  }

  factory Worker.fromJSON(dynamic json) {
    return Worker(
      bio: WorkerBio.fromJSON(json['bio']),
      condition: WorkerCondition.fromJSON(json['condition']),
    );
  }
}

class WorkerCondition extends ChangeNotifier {
  WorkerStatus status = WorkerStatus.holiday;
  String location = '';
  double bodyTemperature = 0;
  double envTemperature = 0;
  int startTimeMS = 0;
  bool withHelmet = false;

  WorkerCondition({
    required this.location,
    required this.bodyTemperature,
    required this.envTemperature,
    required this.status,
    required this.startTimeMS,
    required this.withHelmet,
  });

  factory WorkerCondition.random() {
    final currentTime = DateTime.now().millisecondsSinceEpoch;
    return WorkerCondition(
      location: workerLocations[random.nextInt(workerLocations.length)],
      bodyTemperature: random.nextDouble() * 3 + 36,
      envTemperature: random.nextDouble() * 10 + 25,
      status: WorkerStatus.values[random.nextInt(3)],
      startTimeMS: currentTime - random.nextInt(1000 * 60 * 60 * 5),
      withHelmet: random.nextBool(),
    );
  }

  factory WorkerCondition.empty() {
    return WorkerCondition(
      location: "",
      bodyTemperature: 0,
      envTemperature: 0,
      status: WorkerStatus.holiday,
      startTimeMS: 0,
      withHelmet: false,
    );
  }

  factory WorkerCondition.fromJSON(dynamic json) {
    if (json == null) return WorkerCondition.empty();
    return WorkerCondition(
      location: json['location'],
      bodyTemperature: json['bodyTemperature'],
      envTemperature: json['envTemperature'],
      status: WorkerStatus.values[json['status']],
      startTimeMS: json['startTimeMS'],
      withHelmet: json['withHelmet'],
    );
  }
}

class WorkerBio {
  final int id;
  final String name;
  final String position;

  WorkerBio({required this.id, required this.name, required this.position});

  factory WorkerBio.random() {
    return WorkerBio(
      id: workerCount++,
      name: workerNames[workerCount % workerNames.length],
      position: workerPositions[random.nextInt(workerPositions.length)],
    );
  }

  factory WorkerBio.fromName(String name) {
    return WorkerBio(id: workerCount++, name: name, position: "");
  }

  factory WorkerBio.fromJSON(dynamic json) {
    return WorkerBio(
      id: json['id'],
      name: json['name'],
      position: json['position'],
    );
  }
}

enum WorkerStatus {
  holiday(value: 0, text: "休假", color: Colors.grey),
  working(value: 1, text: "工作中", color: Colors.green),
  resting(value: 2, text: "休息中", color: Colors.yellow);

  final int value;
  final String text;
  final Color color;

  const WorkerStatus({
    required this.value,
    required this.text,
    required this.color,
  });

  static WorkerStatus parse(int i) {
    if (i == -1) return WorkerStatus.holiday;
    return WorkerStatus.values[i];
  }
}
