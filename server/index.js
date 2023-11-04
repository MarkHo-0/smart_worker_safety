import http from "http";
import { WebSocketServer } from "ws";
import { UserMode } from "./constant.js";
import { getManager } from "./modules/manager/db.js";
import { getWorker } from "./modules/worker/db.js";
import { onWorkerMessage } from "./modules/worker/index.js";
import { onManagerMessage } from "./modules/manager/index.js";

const server = http.createServer();
const wss = new WebSocketServer({ noServer: true });

server.on("upgrade", async (req, socket, head) => {
  const params = new URL(req.url, `http://${req.headers.host}`).searchParams;
  const mode = params.get("mode");
  const id = parseInt(params.get("id"));

  // 判斷連接是 工友 還是 工頭
  let identity = null;
  if (mode == UserMode.WORKER) {
    identity = await getWorker(id);
  } else if (mode == UserMode.MANAGER) {
    identity = await getManager(id);
  }

  //如果兩者都不是就拒絕連接
  if (!identity) {
    socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
    socket.destroy();
    return;
  }
  req.identity = identity;

  //升級為ws協議
  wss.handleUpgrade(req, socket, head, (ws) => {
    wss.emit("connection", ws, req);
  });
});

wss.on("connection", (ws, request) => {
  ws.identity = request.identity;
  wss.clients.add(ws);

  ws.on("message", (data) => {
    if (ws.identity.supervisorID > 0) {
      onWorkerMessage(ws.identity, data);
    } else {
      onManagerMessage(ws.identity, data);
    }
  });

  ws.on("close", (code, reason) => {
    console.log(ws.identity.id);
    console.log(`closed connection with reason ${code}`);
    wss.clients.delete(ws);
  });
});

server.listen(8080);
