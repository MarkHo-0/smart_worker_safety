import 'dart:async';
import 'package:flutter/material.dart';
import 'package:smart_worker_safety/layouts/login_lobby.dart';
import 'package:smart_worker_safety/network.dart';

import '../sorting.dart';
import '../worker.dart';

class WorkerListPage extends StatefulWidget {
  const WorkerListPage({super.key});

  @override
  State<WorkerListPage> createState() => _WorkerListPageState();
}

class _WorkerListPageState extends State<WorkerListPage> {
  List<Worker> workers = [];
  late StreamSubscription<ServerEvent> sub;

  Future<void> onRefresh() async {
    final event = ServerEvent.fromName('get_workers');
    toServer.sink.add(event);
    return Future.value();
  }

  @override
  void initState() {
    super.initState();
    sub = fromServer.stream.listen(onServerEvent);
    onRefresh();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        title: const Text("智能工友管理"),
        actions: [
          DropdownButton(
            value: 0,
            items: List.generate(
              SortingMethod.values.length,
              (index) => DropdownMenuItem(
                value: SortingMethod.values[index].value,
                child: Text(SortingMethod.values[index].name),
              ),
            ).toList(),
            onChanged: (selected) {},
          )
        ],
      ),
      body: RefreshIndicator(
        onRefresh: onRefresh,
        child: ListView.builder(
          itemBuilder: (c, i) {
            return Material(
              child: InkWell(
                onTap: () => showWorkerAction(workers[i]),
                child: Container(
                  width: double.infinity,
                  alignment: Alignment.centerLeft,
                  padding: const EdgeInsets.symmetric(
                    horizontal: 15,
                    vertical: 10,
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              Text(
                                workers[i].bio.name,
                                style: Theme.of(context).textTheme.titleLarge,
                              ),
                              const SizedBox(width: 10),
                              Text(workers[i].bio.position)
                            ],
                          ),
                          Visibility(
                            visible: workers[i].condition.status !=
                                WorkerStatus.holiday,
                            child: WorkerConditionInfoBox(workers[i].condition),
                          ),
                        ],
                      ),
                      Text(
                        workers[i].condition.status.text,
                        style: TextStyle(
                          color: workers[i].condition.status.color,
                        ),
                      )
                    ],
                  ),
                ),
              ),
            );
          },
          itemCount: workers.length,
        ),
      ),
    );
  }

  void onServerEvent(ServerEvent event) {
    if (event.name == 'workers_data_all') {
      final rawData = event.data as Iterable<dynamic>;
      if (rawData.isEmpty) return;
      workers = rawData.map((w) => Worker.fromJSON(w)).toList();
      setState(() {});
      return;
    }

    if (event.name == 'workers_condition_updated') {
      for (var condition in event.data as Iterable<dynamic>) {
        final workerID = condition['id'] as int;
        final newCondition = WorkerCondition.fromJSON(condition['c']);
        final listIdx = workers.indexWhere((w) => w.bio.id == workerID);
        if (listIdx == -1) return;
        workers[listIdx].condition = newCondition;
      }
      setState(() {});
      return;
    }

    if (event.name == 'disconnected') {
      Navigator.of(context).pushReplacement(MaterialPageRoute(
        builder: (__) => LoginLobby(),
      ));
    }
  }

  void showWorkerAction(Worker worker) {
    showDialog(
      context: context,
      builder: (ctx) {
        return Dialog(
          child: Container(
            padding: const EdgeInsets.symmetric(
              horizontal: 30,
              vertical: 15,
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  worker.bio.name,
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                const SizedBox(height: 30),
                OutlinedButton(
                  onPressed: () {},
                  child: const Text("呼叫前往辦公室"),
                ),
                const SizedBox(height: 5),
                OutlinedButton(
                  onPressed: () {},
                  child: const Text("要求回報身體狀況"),
                ),
                const SizedBox(height: 5),
                OutlinedButton(
                  onPressed: () {},
                  child: const Text("提醒注意休息"),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  @override
  void dispose() {
    sub.cancel();
    super.dispose();
  }
}

class WorkerConditionInfoBox extends StatelessWidget {
  final WorkerCondition condition;
  const WorkerConditionInfoBox(
    this.condition, {
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    return RichText(
      text: TextSpan(
        style: const TextStyle(color: Colors.black),
        children: [
          TextSpan(text: condition.location),
          const TextSpan(text: '  •  '),
          WidgetSpan(
            child: TempertureText(
              icon: Icons.accessibility,
              degree: condition.bodyTemperature,
              warmingThreshold: 37.8,
            ),
          ),
          const TextSpan(text: ' • '),
          WidgetSpan(
            child: TempertureText(
              icon: Icons.wb_sunny,
              degree: condition.envTemperature,
              warmingThreshold: 30,
            ),
          ),
          const TextSpan(text: ' • '),
          WidgetSpan(
            child: Icon(
              Icons.room_service,
              size: 20,
              color: condition.withHelmet ? Colors.green : Colors.red,
            ),
          ),
          if (condition.withHelmet == false)
            const TextSpan(text: " 沒有頭盔", style: TextStyle(color: Colors.red)),
        ],
      ),
    );
  }
}

class TempertureText extends StatelessWidget {
  final IconData icon;
  final double degree;
  final double warmingThreshold;
  const TempertureText({
    required this.icon,
    required this.degree,
    required this.warmingThreshold,
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    final myColor = degree >= warmingThreshold ? Colors.red : Colors.grey;
    return Row(
      children: [
        Icon(icon, size: 18, color: myColor),
        const SizedBox(width: 5),
        Text(
          '${degree.toStringAsFixed(1)}°C',
          style: TextStyle(color: myColor, fontSize: 14),
        )
      ],
    );
  }
}
