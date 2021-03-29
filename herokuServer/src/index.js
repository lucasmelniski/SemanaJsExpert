import SocketServer from "./socket.js";
import Event from "events";
import { constants } from "./constants.js";
import Controller from "./controller.js";

const eventEmmiter = new Event();
const port = process.env.PORT || 3838;
const socketServer = new SocketServer({ port });
const server = await socketServer.initialize(eventEmmiter);
console.log("socket", server.address().port);

const controller = new Controller({ socketServer });

eventEmmiter.on(
  constants.event.NEW_USER_CONNECTED,
  controller.onNewConnection.bind(controller)
);
