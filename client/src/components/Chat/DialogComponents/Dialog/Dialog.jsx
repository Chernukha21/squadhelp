import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import className from 'classnames';
import {
  getDialogMessages,
  clearMessageList,
} from '../../../../store/slices/chatSlice';
import ChatHeader from '../../ChatComponents/ChatHeader/ChatHeader';
import styles from './Dialog.module.sass';
import ChatInput from '../../ChatComponents/ChatInut/ChatInput';

const Dialog = ({ userId }) => {
  const dispatch = useDispatch();
  const messagesEnd = useRef(null);

  const { messages, interlocutor, chatData } = useSelector(
    state => state.chatStore
  );

  const interlocutorId = interlocutor?.id;

  useEffect(() => {
    dispatch(clearMessageList());

    if (interlocutorId != null) {
      dispatch(getDialogMessages({ interlocutorId }));
    }
  }, [dispatch, interlocutorId]);

  useEffect(() => () => {
      dispatch(clearMessageList());
    }, [dispatch]);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({
      behavior: 'smooth',
    });
  }, [messages, interlocutorId]);

  const renderMainDialog = () => {
    const messagesArray = [];
    let currentTime = moment();
    messages.forEach((message, i) => {
      if (!currentTime.isSame(message.createdAt, 'date')) {
        messagesArray.push(
          <div key={message.createdAt} className={styles.date}>
            {moment(message.createdAt).format('MMMM DD, YYYY')}
          </div>
        );
        currentTime = moment(message.createdAt);
      }
      messagesArray.push(
        <div
          key={i}
          className={className(
            userId === message.sender ? styles.ownMessage : styles.message
          )}
        >
          <span>{message.body}</span>
          <span className={styles.messageTime}>
            {moment(message.createdAt).format('HH:mm')}
          </span>
        </div>
      );
    });
    return (
      <div className={styles.messageList}>
        {messagesArray}
        <div ref={messagesEnd} />
      </div>
    );
  };

  const blockMessage = () => {
    const { blackList, participants } = chatData;
    const userIndex = participants.indexOf(userId);

    const message = blackList[userIndex]
      ? 'You blocked this user'
      : 'This user blocked you';

    return <span className={styles.messageBlock}>{message}</span>;
  };

  return (
    <>
      <ChatHeader userId={userId} />

      {renderMainDialog()}

      {chatData && chatData.blackList.includes(true) ? (
        blockMessage()
      ) : (
        <ChatInput />
      )}
    </>
  );
};

export default Dialog;
