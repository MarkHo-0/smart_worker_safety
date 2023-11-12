import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:multicast_dns/multicast_dns.dart';
import 'package:web_socket_channel/web_socket_channel.dart';

Future<Uri> findServerAddress() {
  if (kIsWeb) {
    return Future.error('Web Not Support');
  }

  const String name = 'test';
  final MDnsClient client = MDnsClient();
  return Future.value(Uri(host: name));
}

WebSocketChannel connectServer(Uri address, int managerID) {
  address.queryParameters.addAll({'id': managerID.toString()});
  return WebSocketChannel.connect(address);
}

void onWorkerWorkingStateUpdated(WebSocketChannel channel, Function callback) {
  channel.stream.listen((msg) {
    final jsonData = jsonDecode(msg);

    if (jsonData['event'] == 'WorkerWorkingStateUpdated') {}
  });
}
