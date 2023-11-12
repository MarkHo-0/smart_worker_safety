import 'package:flutter/material.dart';

class WarningPage extends StatefulWidget {
  final String workerName;
  final String accidentLocation;
  final WarningType accidentType;
  final int lastReachTimeMS;
  const WarningPage({
    super.key,
    required this.workerName,
    required this.accidentLocation,
    required this.accidentType,
    required this.lastReachTimeMS,
  });

  @override
  State<WarningPage> createState() => _WarningPageState();
}

class _WarningPageState extends State<WarningPage> {
  @override
  Widget build(BuildContext context) {
    final timeDiff =
        (DateTime.now().millisecondsSinceEpoch - widget.lastReachTimeMS) / 1000;
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: <Color>[Colors.white, Colors.red],
          ),
        ),
        alignment: Alignment.center,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.warning,
              size: 80,
              color: Colors.redAccent,
            ),
            const Text(
              "工人意外通知",
              style: TextStyle(
                fontSize: 24,
                color: Colors.redAccent,
                fontWeight: FontWeight.w900,
              ),
            ),
            const SizedBox(height: 10),
            RichText(
              text: TextSpan(
                style: const TextStyle(fontSize: 18),
                children: [
                  TextSpan(
                    text: widget.workerName,
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                  const TextSpan(text: ' 在 '),
                  TextSpan(
                    text: widget.accidentLocation,
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                  TextSpan(
                    text: ' ${widget.accidentType.text}',
                  ),
                ],
              ),
            ),
            if (timeDiff > 0) Text('已 ${timeDiff.toInt()} 秒沒有回應'),
            const SizedBox(height: 30),
            ElevatedButton(onPressed: () {}, child: const Text("呼叫緊急醫療服務")),
            const SizedBox(height: 10),
            ElevatedButton(onPressed: () {}, child: const Text("確認及親自處理")),
            const SizedBox(height: 10),
            ElevatedButton(onPressed: () {}, child: const Text("誤報")),
          ],
        ),
      ),
    );
  }
}

enum WarningType {
  headImpact(value: 0, text: "遭頭部撞擊"),
  faint(value: 1, text: "暈倒"),
  sos(value: 2, text: "遭意外求救"),
  lostSignal(value: 3, text: "失去訊號");

  final int value;
  final String text;

  const WarningType({
    required this.value,
    required this.text,
  });
}
