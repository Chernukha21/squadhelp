const CONSTANTS = require('../../constants');

class WebSocket {
  connect(namespace, io) {
    this.io = io.of(namespace);
    this.listen();
  }

  listen() {
    this.io.on(CONSTANTS.SOCKET_CONNECTION, socket => {
      this.onSubscribe(socket);
      this.onUnsubscribe(socket);
      this.anotherSubscribes(socket);
    });
  }

  anotherSubscribes() {}

  onSubscribe(socket) {
    socket.on(CONSTANTS.SOCKET_SUBSCRIBE, id => {
      if (id == null) {
        return;
      }

      socket.join(String(id));
    });
  }

  onUnsubscribe(socket) {
    socket.on(CONSTANTS.SOCKET_UNSUBSCRIBE, id => {
      if (id == null) {
        return;
      }

      socket.leave(String(id));
    });
  }
}

module.exports = WebSocket;
