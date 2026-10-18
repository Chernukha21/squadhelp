import { useSelector } from 'react-redux';
import DialogList from '../DialogList/DialogList';

const DialogListContainer = ({ userId }) => {
  const messagesPreview = useSelector(state => state.chatStore.messagesPreview);

  return <DialogList preview={messagesPreview} userId={userId} />;
};

export default DialogListContainer;
