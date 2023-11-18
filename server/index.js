import http from "http";
import ciao from "@homebridge/ciao";
import { managerServer } from "./modules/manager/index.js";
import { workerServer } from "./modules/worker/index.js";

const PORT = 8080;
const server = http.createServer();

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

server.listen(PORT).on("listening", () => {
  console.log("Server is online at port " + PORT);
});

ciao
  .getResponder()
  .createService({ name: "swss", type: "ws", port: PORT })
  .advertise()
  .then(() => console.log("Service discovery has been enable"));
