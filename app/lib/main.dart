import 'package:flutter/material.dart';
import 'package:smart_worker_safety/layouts/warning_page.dart';
import 'package:smart_worker_safety/layouts/worker_list_page.dart';
import 'package:smart_worker_safety/worker.dart';

import 'package:firebase_core/firebase_core.dart';
import 'firebase_options.dart';
import 'package:firebase_messaging/firebase_messaging.dart';

void main() async {
  runApp(const MyApp());
  Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  ).then((value) async {
    final fcmToken = await FirebaseMessaging.instance.getToken();
    await FirebaseMessaging.instance.setAutoInitEnabled(true);
    print("FCMToken $fcmToken");
  }).catchError((err) {
    print("Firebase Error");
  });

  // 測試網絡用
  // final s = connectServer();
  // s.ready.then((value) {
  //   s.sink.add("Hello Server!");
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
      // home: WarningPage(
      //   worker: Worker.random(),
      //   type: WarningType.headImpact,
      //   lastReachTimeMS: DateTime.now().millisecondsSinceEpoch - 10000, //測試用
      // ),
      home: const WorkerListPage(),
      debugShowCheckedModeBanner: false,
    );
  }
}
