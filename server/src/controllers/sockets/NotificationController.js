const WebSocket = require('./WebSocket');
const CONSTANTS = require('../../constants');

const normalizeTarget = target => {
  if (target == null) {
    return [];
  }

  return Array.isArray(target)
    ? target.filter(id => id != null).map(String)
    : String(target);
};

class NotificationController extends WebSocket {
  onSubscribe(socket) {
    socket.on(CONSTANTS.SOCKET_SUBSCRIBE, id => {
      if (id == null) {
        return;
      }

      const nextRoom = String(id);
      const previousRoom = socket.data.userRoom;

      if (previousRoom && previousRoom !== nextRoom) {
        socket.leave(previousRoom);
      }

      socket.join(nextRoom);
      socket.data.userRoom = nextRoom;
    });
  }

  onUnsubscribe(socket) {
    socket.on(CONSTANTS.SOCKET_UNSUBSCRIBE, id => {
      const room = id != null
        ? String(id)
        : socket.data.userRoom;

      if (!room) {
        return;
      }

      socket.leave(room);

      if (socket.data.userRoom === room) {
        delete socket.data.userRoom;
      }
    });
  }
  emitEntryCreated(target, contestId) {
    this.io
      .to(normalizeTarget(target))
      .emit(CONSTANTS.NOTIFICATION_ENTRY_CREATED, {
        contestId: Number(contestId),
      });
  }

  emitChangeMark(target) {
    this.io
      .to(normalizeTarget(target))
      .emit(CONSTANTS.NOTIFICATION_CHANGE_MARK);
  }

  emitChangeOfferStatus(target, message, contestId) {
    const rooms = normalizeTarget(target);
    this.io
      .to(rooms)
      .emit(CONSTANTS.NOTIFICATION_CHANGE_OFFER_STATUS, {
        message,
        contestId,
      });
  }
}

module.exports = NotificationController;
