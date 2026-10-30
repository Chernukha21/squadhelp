import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames';
import DialogListContainer from '../../DialogComponents/DialogListContainer/DialogListContainer';
import styles from './Chat.module.sass';
import Dialog from '../../DialogComponents/Dialog/Dialog';
import {
  changeChatShow,
  getPreviewChat,
  setPreviewChatMode,
} from '../../../../store/slices/chatSlice';
import { chatController } from '../../../../api/ws/socketController';
import CONSTANTS from '../../../../constants';
import CatalogListContainer from '../../CatalogComponents/CatalogListContainer/CatalogListContainer';
import CatalogListHeader from '../../CatalogComponents/CatalogListHeader/CatalogListHeader';
import ChatError from '../../../ChatError/ChatError';
import CatalogCreation from '../../CatalogComponents/CatalogCreation/CatalogCreation';

const Chat = () => {
  const dispatch = useDispatch();

  const userId = useSelector(state => state.userStore.data?.id);

  const {
    chatMode,
    isShowChatsInCatalog,
    isExpanded,
    isShow,
    isShowCatalogCreation,
    error,
  } = useSelector(state => state.chatStore);

  useEffect(() => {
    if (userId == null) {
      return undefined;
    }

    chatController.subscribeChat(userId);
    dispatch(getPreviewChat());

    return () => {
      chatController.unsubscribeChat(userId);
    };
  }, [dispatch, userId]);

  const handleToggleChat = () => {
    dispatch(changeChatShow());
  };

  const handlePreviewModeChange = mode => {
    dispatch(setPreviewChatMode(mode));
  };

  const handleRetry = () => dispatch(getPreviewChat());

  if (userId == null) {
    return null;
  }

  const renderDialogList = () => {
    const {
      NORMAL_PREVIEW_CHAT_MODE,
      FAVORITE_PREVIEW_CHAT_MODE,
      BLOCKED_PREVIEW_CHAT_MODE,
      CATALOG_PREVIEW_CHAT_MODE,
    } = CONSTANTS;
    return (
      <div>
        {isShowChatsInCatalog && <CatalogListHeader />}
        {!isShowChatsInCatalog && (
          <div className={styles.chatHeader}>
            <img src={`${CONSTANTS.STATIC_IMAGES_PATH}logo.png`} alt='logo' />
          </div>
        )}
        {!isShowChatsInCatalog && (
          <div className={styles.buttonsContainer}>
            <span
              onClick={() => handlePreviewModeChange(NORMAL_PREVIEW_CHAT_MODE)}
              className={classNames(styles.button, {
                [styles.activeButton]: chatMode === NORMAL_PREVIEW_CHAT_MODE,
              })}
            >
              Normal
            </span>
            <span
              onClick={() =>
                handlePreviewModeChange(FAVORITE_PREVIEW_CHAT_MODE)
              }
              className={classNames(styles.button, {
                [styles.activeButton]: chatMode === FAVORITE_PREVIEW_CHAT_MODE,
              })}
            >
              Favorite
            </span>
            <span
              onClick={() => handlePreviewModeChange(BLOCKED_PREVIEW_CHAT_MODE)}
              className={classNames(styles.button, {
                [styles.activeButton]: chatMode === BLOCKED_PREVIEW_CHAT_MODE,
              })}
            >
              Blocked
            </span>
            <span
              onClick={() => handlePreviewModeChange(CATALOG_PREVIEW_CHAT_MODE)}
              className={classNames(styles.button, {
                [styles.activeButton]: chatMode === CATALOG_PREVIEW_CHAT_MODE,
              })}
            >
              Catalog
            </span>
          </div>
        )}
        {chatMode === CATALOG_PREVIEW_CHAT_MODE ? (
          <CatalogListContainer />
        ) : (
          <DialogListContainer userId={userId} />
        )}
      </div>
    );
  };

  return (
    <div
      className={classNames(styles.chatContainer, {
        [styles.showChat]: isShow,
      })}
    >
      {error && <ChatError getData={handleRetry} />}
      {isShowCatalogCreation && <CatalogCreation />}
      {isExpanded ? <Dialog userId={userId} /> : renderDialogList()}
      <div className={styles.toggleChat} onClick={handleToggleChat}>
        {isShow ? 'Hide Chat' : 'Show Chat'}
      </div>
    </div>
  );
};

export default Chat;
