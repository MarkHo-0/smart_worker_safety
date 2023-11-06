import http from "http";
import { Bonjour } from "bonjour-service";
import { managerServer } from "./modules/manager";
import { workerServer } from "./modules/worker";

const PORT = 8080;
const server = http.createServer();

const mdns = new Bonjour().publish({
  name: "Smart Worker Safety Server",
  host: "sws_s",
  type: "ws",
  port: PORT,
});

server.on("upgrade", async (req, socket, head) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const id = url.searchParams.get("id");
  req.unverifiedID = parseInt(id);

  switch (url.pathname) {
    case "/worker":
      workerServer.handleUpgrade(req, socket, head, (ws) =>
        workerServer.emit("connection", ws, req)
      );
      break;
    case "/manager":
      managerServer.handleUpgrade(req, socket, head, (ws) =>
        managerServer.emit("connection", ws, req)
      );
      break;
    default:
      socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
      socket.destroy();
  }
});

server.listen(PORT);
