import 'dart:async';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:bonsoir/bonsoir.dart';
import 'package:web_socket_channel/web_socket_channel.dart';

final StreamController<ServerEvent> fromServer = StreamController();
final StreamController<ServerEvent> toServer = StreamController();

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

Future<void> connectServer(Uri serverAddress, String managerID) {
  final fullAddress = serverAddress.replace(
    scheme: 'ws',
    path: 'manager',
    queryParameters: {'id': managerID},
  );
  final channel = WebSocketChannel.connect(fullAddress);
  return channel.ready.timeout(const Duration(seconds: 5)).then((_) {
    channel.stream.listen((rawData) {
      if (rawData is String) rawData = jsonDecode(rawData);
      if (rawData['e'] == null || rawData['d'] == null) return;
      fromServer.add(ServerEvent(rawData['e'], rawData['d']));
    });
    toServer.stream.listen((event) {
      // TODO: 增加發送邏輯
    });
  });
}

class ServerEvent {
  final String name;
  final dynamic data;

  ServerEvent(this.name, this.data);
}
