import 'package:flutter/material.dart';
import 'package:smart_worker_safety/network.dart';
import 'package:smart_worker_safety/route.dart';

final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();

void main() async {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      key: navigatorKey,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.yellow),
        useMaterial3: true,
      ),
      home: const RouteContainer(),
      debugShowCheckedModeBanner: false,
    );
  }
}
