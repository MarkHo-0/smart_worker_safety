import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:smart_worker_safety/layouts/worker_list_page.dart';
import 'package:smart_worker_safety/network.dart';

class LoginLobby extends StatefulWidget {
  LoginLobby({super.key});

  @override
  State<LoginLobby> createState() => _LoginLobbyState();
}

class _LoginLobbyState extends State<LoginLobby>
    with SingleTickerProviderStateMixin {
  final addressInput = TextEditingController();
  final managerIdInput = TextEditingController();
  final addressFocusNode = FocusNode();
  final managerIdFocusNode = FocusNode();

  late AnimationController spinController;
  late final Animation<double> spinAnimation;

  bool isLogining = false;
  bool isSearchingServer = false;
  bool isFaildFindServer = false;

  @override
  void initState() {
    super.initState();
    spinController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 1),
    );
    spinAnimation = Tween<double>(begin: 0, end: 1).animate(spinController);

    searchServer();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              "智能工友安全",
              style: TextStyle(fontSize: 24, color: Colors.yellow.shade600),
            ),
            const SizedBox(height: 50),
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text('伺服器地址: '),
                SizedBox(
                  width: 200,
                  child: TextField(
                    decoration: InputDecoration(
                      hintText: isSearchingServer
                          ? "正在搜尋伺服器..."
                          : isFaildFindServer
                              ? "搜尋失敗，請手動輸入"
                              : "",
                    ),
                    readOnly: isLogining,
                    controller: addressInput,
                    focusNode: addressFocusNode,
                  ),
                ),
                IconButton(
                  onPressed: searchServer,
                  icon: RotationTransition(
                    turns: spinAnimation,
                    child: const Icon(Icons.sync),
                  ),
                ),
              ],
            ),
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text("  工頭編號: "),
                SizedBox(
                  width: 200,
                  child: TextField(
                    readOnly: isLogining,
                    controller: managerIdInput,
                    focusNode: managerIdFocusNode,
                    inputFormatters: <TextInputFormatter>[
                      FilteringTextInputFormatter.digitsOnly
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 30),
            ElevatedButton(
              onPressed: login,
              child: Text(isLogining ? "登入中" : "登入"),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> showLoginFailedPopup(Object? error) {
    return showDialog(
      context: context,
      builder: (BuildContext ctx) {
        return AlertDialog(
          title: const Text('連接伺服器失敗'),
          content: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('請檢查伺服器地址或工頭編號是否正確'),
              Text(error.toString(), style: const TextStyle(fontSize: 12))
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(ctx).pop(),
              child: const Text('返回'),
            ),
          ],
        );
      },
    );
  }

  void login() {
    if (isLogining || isSearchingServer) return;
    if (addressInput.text.isEmpty || managerIdInput.text.isEmpty) return;

    final ipAndPort = addressInput.text.split(':');
    if (ipAndPort.length != 2) return;

    setState(() => isLogining = true);

    final address = Uri(host: ipAndPort[0], port: int.tryParse(ipAndPort[1]));
    connectServer(address, managerIdInput.text).then((_) {
      Navigator.of(context).pushReplacement(MaterialPageRoute(
        builder: (__) => const WorkerListPage(),
      ));
    }).onError((error, stackTrace) {
      showLoginFailedPopup(error).then(
        (_) => setState(() => isLogining = false),
      );
    });
  }

  void searchServer() {
    if (isSearchingServer) return;

    setState(() {
      isSearchingServer = true;
      isFaildFindServer = false;
    });
    addressInput.clear();
    spinController.repeat();

    findServerAddress().then((uri) {
      addressInput.text = '${uri.host}:${uri.port}';
      isFaildFindServer = false;
    }).onError((error, stackTrace) {
      isFaildFindServer = true;
    }).whenComplete(() {
      spinController.stop();
      isSearchingServer = false;
      setState(() {});
      WidgetsBinding.instance.addPostFrameCallback((_) {
        isFaildFindServer
            ? addressFocusNode.requestFocus()
            : managerIdFocusNode.requestFocus();
      });
    });
  }
}
