import 'dart:async';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:bonsoir/bonsoir.dart';
import 'package:web_socket_channel/web_socket_channel.dart';

Future<Uri> findServerAddress() async {
  if (kIsWeb) return Future.error(Exception('Web is not support'));

  const serverName = 'swss';
  const eFound = BonsoirDiscoveryEventType.discoveryServiceFound;
  const eSolved = BonsoirDiscoveryEventType.discoveryServiceResolved;

  final completer = Completer<Uri>();

  BonsoirDiscovery mdns = BonsoirDiscovery(type: '_ws._tcp');
  mdns.ready.then((_) {
    mdns.eventStream!.timeout(const Duration(seconds: 5), onTimeout: (_) {
      mdns.stop();
      completer.completeError(
        Exception('timeout'),
      );
    }).listen((e) {
      if (e.type == eFound && e.service!.name == serverName) {
        e.service!.resolve(mdns.serviceResolver);
      }
      if (e.type == eSolved && e.service!.name == serverName) {
        final record = e.service!.toJson();
        final uri = Uri(
          host: record['service.host'],
          port: record['service.port'],
          scheme: 'ws',
        );
        mdns.stop();
        completer.complete(uri);
      }
    });
    mdns.start();
  });

  return completer.future;
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
