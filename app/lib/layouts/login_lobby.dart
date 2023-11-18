import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
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
    return Center(
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
                    hintText: isFaildFindServer ? "搜尋失敗，請手動輸入" : "",
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
                  child: Icon(Icons.sync),
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
    );
  }

  void login() {
    if (isLogining || isSearchingServer) return;

    if (addressInput.text.isEmpty || managerIdInput.text.isEmpty) return;
    setState(() => isLogining = true);
  }

  void searchServer() {
    if (isSearchingServer) return;

    setState(() {
      isSearchingServer = true;
      isFaildFindServer = false;
    });
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
