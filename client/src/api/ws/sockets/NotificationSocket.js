import { toast } from 'react-toastify';
import WebSocket from './WebSocket';
import Notification from '../../../components/Notification/Notification';
import { getContestById } from '../../../store/slices/contestByIdSlice';
import CONSTANTS from '../../../constants';

class NotificationSocket extends WebSocket {
  anotherSubscribes = () => {
    this.onEntryCreated();
    this.onChangeMark();
    this.onChangeOfferStatus();
  };

  onChangeMark = () => {
    this.socket.off(CONSTANTS.NOTIFICATION_CHANGE_MARK);
    this.socket.on(CONSTANTS.NOTIFICATION_CHANGE_MARK, () => {
      toast('Your offer received a new rating');
    });
  };

  onChangeOfferStatus = () => {
    this.socket.off(CONSTANTS.NOTIFICATION_CHANGE_OFFER_STATUS);

    this.socket.on(
      CONSTANTS.NOTIFICATION_CHANGE_OFFER_STATUS,
      ({ message, contestId }) => {
        toast(<Notification message={message} contestId={contestId} />);

        this.refreshCurrentContest(contestId);
      }
    );
  };

  onEntryCreated = () => {
    this.socket.off(CONSTANTS.NOTIFICATION_ENTRY_CREATED);

    this.socket.on(
      CONSTANTS.NOTIFICATION_ENTRY_CREATED,
      ({ contestId } = {}) => {
        toast(
          <Notification message='New offer received' contestId={contestId} />
        );

        this.refreshCurrentContest(contestId);
      }
    );
  };

  refreshCurrentContest = contestId => {
    const currentContestId = this.getState().contestByIdStore.contestData?.id;

    if (contestId != null && String(currentContestId) === String(contestId)) {
      this.dispatch(getContestById({ contestId }));
    }
  };

  subscribe = id => {
    if (id != null) {
      this.socket.emit(CONSTANTS.SOCKET_SUBSCRIBE, String(id));
    }
  };

  unsubscribe = id => {
    if (id != null) {
      this.socket.emit(CONSTANTS.SOCKET_UNSUBSCRIBE, String(id));
    }
  };
}

export default NotificationSocket;
