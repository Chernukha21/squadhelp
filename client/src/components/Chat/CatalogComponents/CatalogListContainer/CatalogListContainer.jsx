import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getCatalogList,
  removeChatFromCatalog,
} from '../../../../store/slices/chatSlice';
import CatalogList from '../CatalogList/CatalogList';
import DialogList from '../../DialogComponents/DialogList/DialogList';

const CatalogListContainer = () => {
  const dispatch = useDispatch();

  const userId = useSelector(state => state.userStore.data?.id);

  const { catalogList, isShowChatsInCatalog, messagesPreview, currentCatalog } =
    useSelector(state => state.chatStore);

  useEffect(() => {
    dispatch(getCatalogList());
  }, [dispatch]);

  const handleRemoveChat = (event, chatId) => {
    event.stopPropagation();

    if (!currentCatalog) {
      return;
    }

    dispatch(
      removeChatFromCatalog({
        chatId,
        catalogId: currentCatalog._id,
      })
    );
  };

  const dialogsInCatalog = messagesPreview.filter(preview =>
    currentCatalog?.chats.includes(preview._id)
  );

  return isShowChatsInCatalog ? (
    <DialogList
      userId={userId}
      preview={dialogsInCatalog}
      removeChat={handleRemoveChat}
    />
  ) : (
    <CatalogList catalogList={catalogList} />
  );
};

export default CatalogListContainer;
