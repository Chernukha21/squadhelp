import { useSelector } from 'react-redux';
import Chat from '../Chat/Chat';

const ChatContainer = () => {
  const user = useSelector(state => state.userStore.data);

  return user ? <Chat /> : null;
};

export default ChatContainer;
