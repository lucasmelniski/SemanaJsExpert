import ComponentBuilder from "./components.js";
import { constants } from "./constants.js";

export default class TerminalController {
  #userCollors = new Map();
  constructor() {}

  #getUserCollors(userName) {
    if (this.#userCollors.has(userName)) return this.#userCollors.get(userName);
    const collor = this.#pickCollor();
    this.#userCollors.set(userName, collor);
    return collor;
  }
  #pickCollor() {
    return `#${(((1 << 24) * Math.random()) | 0).toString(16)}-fg`;
  }
  #onInputReceived(eventEmitter) {
    return function () {
        const message = this.getValue()
        eventEmitter.emit(constants.events.app.MESSAGE_SENT, message)
        this.clearValue()
    }
}

  #onMessageReceived({ screen, chat }) {
    return (msg) => {
      const { userName, message } = msg;
      const collor = this.#getUserCollors(userName);
      chat.addItem(`{${collor}}{bold}${userName}{/}: ${message}`);
      screen.render();
    };
  }
  #onActivityLogChaged({ screen, activityLog }) {
    return (msg) => {
      const [userName] = msg.split(" ");
      const collor = this.#getUserCollors(userName);
      activityLog.addItem(`{${collor}}{bold}${msg.toString()}{/}`);
      screen.render();
    };
  }
  #onStatusChanged({ screen, status }) {
    return (userNames) => {
      const { content } = status.items.shift();
      status.clearItems();
      status.addItem(content);
      userNames.forEach((userName) => {
        const collor = this.#getUserCollors(userName);
        status.addItem(`{${collor}}{bold}${userName}{/}`);
      });
      screen.render();
    };
  }
  #registerEvents(eventEmitter, components) {
    eventEmitter.on(
      constants.events.app.MESSAGE_RECEIVED,
      this.#onMessageReceived(components)
    );
    eventEmitter.on(
      constants.events.app.ACTIVITYLOG_UPDATED,
      this.#onActivityLogChaged(components)
    );
    eventEmitter.on(
      constants.events.app.STATUS_UPDATED,
      this.#onStatusChanged(components)
    );
  }
  async initializeTable(eventEmitter) {
    const components = new ComponentBuilder()
      .setScreen({ title: "Bora que vamo" })
      .setLayoutComponent()
      .setInputComponent(this.#onInputReceived(eventEmitter))
      .setChatComponent()
      .setStatusComponent()
      .setActivityLogComponent()
      .build();
    this.#registerEvents(eventEmitter, components);
    components.input.focus();
    components.screen.render();


    // eventEmitter.emit(constants.events.app.ACTIVITYLOG_UPDATED, "Lucas entrou");
    // eventEmitter.emit(
    //   constants.events.app.ACTIVITYLOG_UPDATED,
    //   "Melissa entrou"
    // );
    // eventEmitter.emit(
    //   constants.events.app.ACTIVITYLOG_UPDATED,
    //   "Kit Kat entrou"
    // );
    // eventEmitter.emit(
    //   constants.events.app.ACTIVITYLOG_UPDATED,
    //   "Panqueca entrou"
    // );
    // setTimeout(() => {
    //   eventEmitter.emit(
    //     constants.events.app.ACTIVITYLOG_UPDATED,
    //     "Winky entrou"
    //   );
    //   eventEmitter.emit(constants.events.app.MESSAGE_RECEIVED, {
    //     userName: "Winky",
    //     message: "MEEEEEEEEAWWWWWW",
    //   });
    // }, 6000);
    // eventEmitter.emit(constants.events.app.STATUS_UPDATED, [
    //   "Lucas",
    //   "Melissa",
    //   "Panqueca",
    //   "Kit Kat",
    // ]);
    // setTimeout(() => {
    //   eventEmitter.emit(constants.events.app.MESSAGE_RECEIVED, {
    //     userName: "Lucas",
    //     message: "Mensagem",
    //   });
    //   eventEmitter.emit(constants.events.app.MESSAGE_RECEIVED, {
    //     userName: "Melissa",
    //     message: "Mensagem",
    //   });
    //   eventEmitter.emit(constants.events.app.MESSAGE_RECEIVED, {
    //     userName: "Kit Kat",
    //     message: "Miau",
    //   });
    //   eventEmitter.emit(constants.events.app.MESSAGE_RECEIVED, {
    //     userName: "Panqueca",
    //     message: "Miau",
    //   });
    // }, 2000);
    // setTimeout(() => {
    //   eventEmitter.emit(constants.events.app.MESSAGE_RECEIVED, {
    //     userName: "Lucas",
    //     message: "Mensagem",
    //   });
    //   eventEmitter.emit(constants.events.app.MESSAGE_RECEIVED, {
    //     userName: "Melissa",
    //     message: "Mensagem",
    //   });
    //   eventEmitter.emit(constants.events.app.MESSAGE_RECEIVED, {
    //     userName: "Kit Kat",
    //     message: "Miau",
    //   });
    //   eventEmitter.emit(constants.events.app.MESSAGE_RECEIVED, {
    //     userName: "Panqueca",
    //     message: "Miau",
    //   });
    // }, 4000);
  }
}
