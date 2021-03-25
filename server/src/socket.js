import http from "http";
import { v4 } from "uuid";
import { constants } from "./constants.js";
export default class SocketServer {
  constructor({ port }) {
    this.port = port;
  }
  async initialize(eventEmmiter) {
    const server = http.createServer((req, res) => {
      res.writeHead(200, { "Content-type": "text/plain" });
      res.end("Fala dev!");
    });

    server.on("upgrade", (req, socket) => {
      socket.id = v4();
      const headers = [
        "HTTP/1.1 101 Web Socket Protocol Handshake",
        "Upgrade: WebSocket",
        "Connection: Upgrade",
        "",
      ]
        .map((line) => line.concat("\r\n"))
        .join("");

      socket.write(headers);
      eventEmmiter.emit(constants.event.NEW_USER_CONNECTED, socket);
    });
    return new Promise((resolve, reject) => {
      server.on("error", reject);
      server.listen(this.port, () => resolve(server));
    });
  }
}
