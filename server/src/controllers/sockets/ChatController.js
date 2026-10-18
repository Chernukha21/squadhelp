const WebSocket = require('./WebSocket');
const CONSTANTS = require('../../constants');

class ChatController extends WebSocket{

  anotherSubscribes (socket) {
    this.onSubscribeChat(socket);
    this.onUnsubscribeChat(socket);
  }

  onSubscribeChat(socket) {
    socket.on('subscribeChat', id => {
      const roomId = String(id);

      socket.join(roomId);
      console.log(`Socket ${socket.id} joined chat room ${roomId}`);
    });
  }

  onUnsubscribeChat(socket) {
    socket.on('unsubscribeChat', id => {
      socket.leave(String(id));
    });
  }

  emitNewMessage(target, payload) {
    const roomId = String(target);

    console.log(`Sending new message to chat room ${roomId}`);

    this.io.to(roomId).emit(CONSTANTS.NEW_MESSAGE, {
      message: payload,
    });
  }

  emitChangeBlockStatus (target, message) {
    this.io.to(parseInt(target)).emit(CONSTANTS.CHANGE_BLOCK_STATUS,
      { message });
  }
}

module.exports = ChatController;
