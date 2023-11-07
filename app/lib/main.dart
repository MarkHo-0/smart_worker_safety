import 'package:flutter/material.dart';
import 'package:smart_worker_safety/network.dart';
import 'package:smart_worker_safety/sorting.dart';
import 'package:smart_worker_safety/testdata.dart';
import 'package:smart_worker_safety/worker.dart';

void main() {
  runApp(const MyApp());
  // final s = connectServer();
  // s.ready.then((value) {
  //   s.sink.add("Hello There!");
  //   Future.delayed(const Duration(seconds: 3), () {
  //     s.sink.close(3000, "manuel");
  //   });
  // });
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.yellow),
        useMaterial3: true,
      ),
      home: const MyHomePage(),
      debugShowCheckedModeBanner: false,
    );
  }
}

class MyHomePage extends StatefulWidget {
  const MyHomePage({super.key});

  @override
  State<MyHomePage> createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  List<Worker> workers = List.generate(
    workerNames.length,
    (i) => Worker.random(),
  );

  Future<void> onRefresh() async {
    await Future.delayed(const Duration(seconds: 2), () {
      setState(() {
        workers = List.generate(workerNames.length, (i) => Worker.random());
      });
    });
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
                              SizedBox(width: 10),
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
                const SizedBox(height: 15),
                OutlinedButton(
                  onPressed: () {},
                  child: const Text("呼叫前往辦公室"),
                ),
                OutlinedButton(
                  onPressed: () {},
                  child: const Text("要求回報身體狀況"),
                ),
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
          const TextSpan(text: '  •  '),
          WidgetSpan(
            child: TempertureText(
              icon: Icons.wb_sunny,
              degree: condition.envTemperature,
              warmingThreshold: 30,
            ),
          ),
          const TextSpan(text: '  •  '),
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
