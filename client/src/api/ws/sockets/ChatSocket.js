import { toast } from 'react-toastify';
import WebSocket from './WebSocket';
import CONSTANTS from '../../../constants';
import {
  addMessage,
  changeBlockStatusInStore,
} from '../../../store/slices/chatSlice';

class ChatSocket extends WebSocket {
  constructor(dispatch, getState, room) {
    super(dispatch, getState, room);
  }

  userId = null;

  anotherSubscribes = () => {
    this.onNewMessage();
    this.onChangeBlockStatus();

    if (this.userId !== null) {
      this.socket.emit('subscribeChat', this.userId);
    }
  };

  onChangeBlockStatus = () => {
    this.socket.on(CONSTANTS.CHANGE_BLOCK_STATUS, data => {
      this.dispatch(changeBlockStatusInStore(data.message));
    });
  };

  onNewMessage = () => {
    this.socket.off(CONSTANTS.NEW_MESSAGE);

    this.socket.on(CONSTANTS.NEW_MESSAGE, data => {
      const payload = data.message;
      const { message, preview } = payload;
      const { chatStore } = this.getState();

      const isCurrentDialogOpen =
        chatStore.isShow &&
        chatStore.isExpanded &&
        chatStore.interlocutor?.id === message.sender;

      this.dispatch(addMessage(payload));

      if (!isCurrentDialogOpen) {
        const senderName =
          preview.interlocutor?.displayName ||
          preview.interlocutor?.firstName ||
          'Someone';
        const toastId = toast.info(`${senderName}: ${message.body}`);
      }
    });
  };

  subscribeChat = id => {
    this.userId = String(id);

    if (this.socket.connected) {
      this.socket.emit('subscribeChat', this.userId);
    }
  };

  unsubscribeChat = id => {
    const userId = String(id);

    if (this.socket.connected) {
      this.socket.emit('unsubscribeChat', userId);
    }

    if (this.userId === userId) {
      this.userId = null;
    }
  };
}

export default ChatSocket;
