import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:smart_worker_safety/layouts/login_lobby.dart';
import 'package:smart_worker_safety/layouts/warning_page.dart';
import 'package:smart_worker_safety/layouts/worker_list_page.dart';
import 'package:smart_worker_safety/network.dart';

import 'firebase_options.dart';

class RouteContainer extends StatefulWidget {
  const RouteContainer({super.key});

  @override
  State<RouteContainer> createState() => _RouteContainerState();
}

class _RouteContainerState extends State<RouteContainer> {
  @override
  void initState() {
    super.initState();

    // Firebase.initializeApp(
    //   options: DefaultFirebaseOptions.currentPlatform,
    // ).then((value) async {
    //   final fcmToken = await FirebaseMessaging.instance.getToken();
    //   await FirebaseMessaging.instance.setAutoInitEnabled(true);
    //   print("FCMToken $fcmToken");

    //   FirebaseMessaging.onMessage.listen((RemoteMessage message) {
    //     final name = message.data['worker_name'] as String;
    //     final location = message.data['accident_location'] as String;
    //     final type = int.tryParse(message.data['accident_type']) ?? 0;
    //     final last = int.tryParse(message.data['last_rach_time_ms']) ?? 0;

    //     Navigator.push(
    //       context,
    //       MaterialPageRoute(
    //         builder: (context) => WarningPage(
    //           workerName: name,
    //           accidentLocation: location,
    //           accidentType: WarningType.values[type],
    //           lastReachTimeMS: last,
    //         ),
    //       ),
    //     );
    //   });

    //   FirebaseMessaging.onBackgroundMessage(messagingBackgroundHandler);
    // }).catchError((err) {
    //   print("Firebase Error");
    // });
  }

  @override
  Widget build(BuildContext context) {
    return LoginLobby();
  }
}

Future<void> messagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp();

  print("在後台收到訊息: ${message.messageId}");
}
