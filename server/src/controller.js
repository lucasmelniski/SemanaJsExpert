import { constants } from "./constants.js";

export default class Controller {
  #users = new Map();
  #rooms = new Map();
  constructor({ socketServer }) {
    this.socketServer = socketServer;
  }
  async joinRoom(socketId, data) {
    const userData = data;
    console.log(`${userData.userName} joined ${socketId}`);
    const user = this.#updateGlobalUserData(socketId, userData);
    const { roomId } = userData;
    const users = this.#joinUserOnRoom(roomId, user);
    const currentUsers = Array.from(users.values()).map(({ id, userName }) => ({
      id,
      userName,
    }));

    this.socketServer.sendMessage(
      user.socket,
      constants.event.UPDATE_USERS,
      currentUsers
    );

    this.broadCast({
      socketId,
      roomId,
      event: constants.event.NEW_USER_CONNECTED,
      message: { id: socketId, userName: userData.userName },
    });
  }
  onNewConnection(socket) {
    const { id } = socket;
    console.log("connection stablished with", id);
    const userData = { id, socket };
    this.#updateGlobalUserData(id, userData);
    socket.on("data", this.#onSocketData(id));
    socket.on("error", this.#onSocketClosed(id));
    socket.on("end", this.#onSocketClosed(id));
  }
  broadCast({
    socketId,
    roomId,
    event,
    message,
    includeCurrentSocket = false,
  }) {
    const usersOnRoom = this.#rooms.get(roomId);

    for (const [key, user] of usersOnRoom) {
      if (!includeCurrentSocket && key === socketId) continue;

      this.socketServer.sendMessage(user.socket, event, message);
    }
  }
  #onSocketData(id) {
    return (data) => {
      try {
        const { event, message } = JSON.parse(data);
        this[event](id, message);
      } catch (error) {
        console.error("Evento no formato errado!", data.toString());
      }
    };
  }

  #onSocketClosed(id) {
    return () => {
      console.log("onSocketClosed", id);
    };
  }
  #joinUserOnRoom(roomId, userData) {
    const usersOnRoom = this.#rooms.get(roomId) ?? new Map();
    usersOnRoom.set(userData.id, userData);
    this.#rooms.set(roomId, usersOnRoom);
    return usersOnRoom;
  }

  #updateGlobalUserData(socketId, userData) {
    const users = this.#users;
    const user = users.get(socketId) ?? {};

    const updatedUserData = {
      ...user,
      ...userData,
    };

    users.set(socketId, updatedUserData);

    return users.get(socketId);
  }
}
