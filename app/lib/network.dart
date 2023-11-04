import 'dart:convert';
import 'package:smart_worker_safety/sorting.dart';
import 'package:web_socket_channel/web_socket_channel.dart';

WebSocketChannel connectServer() {
  final wsUrl = Uri.parse('ws://localhost:8080?mode=m&id=1');
  return WebSocketChannel.connect(wsUrl);
}

void onWorkerWorkingStateUpdated(WebSocketChannel channel, Function callback) {
  channel.stream.listen((msg) {
    final jsonData = jsonDecode(msg);

    if (jsonData['event'] == 'WorkerWorkingStateUpdated') {}
  });
}

void getWorkers(
    WebSocketChannel channel, SortingMethod sort, int offset, int count) {}
