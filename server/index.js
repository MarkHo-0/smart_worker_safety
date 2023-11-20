import http from "http";
import ciao from "@homebridge/ciao";
import { connectManagerServer } from "./modules/manager/index.js";
import { connectWorkerServer } from "./modules/worker/index.js";

const PORT = 8080;
const server = http.createServer();

server.on("upgrade", async (req, socket, head) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const id = parseInt(url.searchParams.get("id"));

  switch (url.pathname) {
    case "/worker":
      connectWorkerServer(req, socket, head, id);
      break;
    case "/manager":
      connectManagerServer(req, socket, head, id);
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
