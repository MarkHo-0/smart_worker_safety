import 'dart:async';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:bonsoir/bonsoir.dart';
import 'package:web_socket_channel/web_socket_channel.dart';

final StreamController<ServerEvent> fromServer = StreamController.broadcast();
final StreamController<ServerEvent> toServer = StreamController();

Future<Uri> findServerAddress() async {
  if (kIsWeb) return Future.error(Exception('Web is not support'));

  const serverName = 'swss';
  final completer = Completer<Uri>();

  BonsoirDiscovery mdns = BonsoirDiscovery(type: '_ws._tcp');
  mdns.ready.then((_) {
    mdns.eventStream!.timeout(const Duration(seconds: 5), onTimeout: (_) {
      mdns.stop().then((_) => completer.completeError(Exception('timeout')));
    }).listen((e) {
      if (e.service?.name != serverName) return;
      if (e.type == BonsoirDiscoveryEventType.discoveryServiceFound) {
        e.service!.resolve(mdns.serviceResolver);
      }
      if (e.type == BonsoirDiscoveryEventType.discoveryServiceResolved) {
        final data = e.service!.toJson();
        final uri = Uri(host: data['service.host'], port: data['service.port']);
        mdns.stop().then((_) => completer.complete(uri));
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
    final subToServer = toServer.stream.listen((event) {
      channel.sink.add(event.toString());
    });
    channel.stream.listen(
      (rawData) {
        if (rawData is String) rawData = jsonDecode(rawData);
        if (rawData['e'] == null) return;
        fromServer.add(ServerEvent(rawData['e'], rawData['d']));
      },
      onDone: () {
        fromServer.add(ServerEvent.fromName('disconnected'));
        subToServer.cancel();
      },
    );
  });
}

class ServerEvent {
  final String name;
  final dynamic data;

  ServerEvent(this.name, this.data);

  factory ServerEvent.fromName(name) {
    return ServerEvent(name, null);
  }

  @override
  String toString() {
    final temp = {'e': name, 'd': data};
    return jsonEncode(temp);
  }
}
