import 'package:flutter/material.dart';
import 'package:smart_worker_safety/network.dart';

class LoginLobby extends StatelessWidget {
  LoginLobby({super.key});

  final addressInput = TextEditingController();
  final managerIdInput = TextEditingController();

  final addressFocusNode = FocusNode();
  final managerIdFocusNode = FocusNode();

  @override
  Widget build(BuildContext context) {
    return FutureBuilder(
      future: findServerAddress(),
      builder: ((context, snapshot) {
        if (snapshot.hasData || snapshot.hasError) {
          if (snapshot.hasData) {
            print(snapshot.data.toString());
            addressInput.text = snapshot.data.toString();
            WidgetsBinding.instance
                .addPostFrameCallback((_) => managerIdFocusNode.requestFocus());
          }
          if (snapshot.hasError) {
            WidgetsBinding.instance
                .addPostFrameCallback((_) => addressFocusNode.requestFocus());
          }
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              mainAxisSize: MainAxisSize.min,
              children: [
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Text('伺服器地址: '),
                    SizedBox(
                      width: 200,
                      child: TextField(
                        controller: addressInput,
                        focusNode: addressFocusNode,
                      ),
                    ),
                  ],
                ),
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Text("工頭編號: "),
                    SizedBox(
                        width: 200,
                        child: TextField(
                          controller: managerIdInput,
                          focusNode: managerIdFocusNode,
                        )),
                  ],
                ),
                const SizedBox(height: 30),
                ElevatedButton(
                  onPressed: () {},
                  child: Text("登入"),
                ),
              ],
            ),
          );
        }
        return const Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            mainAxisSize: MainAxisSize.min,
            children: [
              CircularProgressIndicator(),
              Text("尋找伺服器中..."),
            ],
          ),
        );
      }),
    );
  }
}
