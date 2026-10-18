import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import classNames from 'classnames';
import isEqual from 'lodash/isEqual';
import LightBox from 'react-18-image-lightbox';
import { goToExpandedDialog } from '../../store/slices/chatSlice';
import {
  getContestById,
  setOfferStatus,
  clearSetOfferStatusError,
  changeEditContest,
  changeContestViewMode,
  changeShowImage,
} from '../../store/slices/contestByIdSlice';
import ContestSideBar from '../../components/ContestSideBar/ContestSideBar';
import OfferBox from '../../components/OfferBox/OfferBox';
import OfferForm from '../../components/OfferForm/OfferForm';
import Brief from '../../components/Brief/Brief';
import Spinner from '../../components/Spinner/Spinner';
import TryAgain from '../../components/TryAgain/TryAgain';
import Error from '../../components/Error/Error';
import CONSTANTS from '../../constants';
import styles from './ContestPage.module.sass';
import 'react-18-image-lightbox/style.css';

const ContestPage = () => {
  const dispatch = useDispatch();
  const { id } = useParams();

  const user = useSelector(state => state.userStore.data);
  const messagesPreview = useSelector(state => state.chatStore.messagesPreview);

  const {
    isShowOnFull,
    imagePath,
    error,
    isFetching,
    isBrief,
    contestData,
    offers,
    setOfferStatusError,
  } = useSelector(state => state.contestByIdStore);

  const getData = useCallback(
    () => dispatch(getContestById({ contestId: id })),
    [dispatch, id]
  );

  useEffect(() => {
    getData();
  }, [getData]);

  useEffect(
    () => () => {
      dispatch(changeEditContest(false));
    },
    [dispatch]
  );

  const needButtons = offerStatus =>
    contestData.User.id === user.id &&
    contestData.status === CONSTANTS.CONTEST_STATUS_ACTIVE &&
    offerStatus === CONSTANTS.OFFER_STATUS_PENDING;

  const handleClearOfferStatusError = () => {
    dispatch(clearSetOfferStatusError());
  };

  const handleSetOfferStatus = (creatorId, offerId, command) => {
    handleClearOfferStatusError();

    const { id: contestId, orderId, priority } = contestData;

    return dispatch(
      setOfferStatus({
        command,
        offerId,
        creatorId,
        orderId,
        priority,
        contestId,
      })
    );
  };

  const findConversationInfo = interlocutorId => {
    const participants = [user.id, interlocutorId].sort(
      (first, second) => first - second
    );

    const conversation = messagesPreview.find(item =>
      isEqual(participants, item.participants)
    );

    if (!conversation) {
      return null;
    }

    return {
      participants: conversation.participants,
      _id: conversation._id,
      blackList: conversation.blackList,
      favoriteList: conversation.favoriteList,
    };
  };

  const goChat = () => {
    const { User } = contestData;

    dispatch(
      goToExpandedDialog({
        interlocutor: User,
        conversationData: findConversationInfo(User.id),
      })
    );
  };

  const handleCloseImage = () => {
    dispatch(
      changeShowImage({
        isShowOnFull: false,
        imagePath: null,
      })
    );
  };

  if (error) {
    return (
      <div className={styles.tryContainer}>
        <TryAgain getData={getData} />
      </div>
    );
  }

  if (isFetching || !contestData || !user) {
    return (
      <div className={styles.containerSpinner}>
        <Spinner />
      </div>
    );
  }

  const { role } = user;

  return (
    <div>
      {isShowOnFull && (
        <LightBox
          mainSrc={`${CONSTANTS.publicURL}${imagePath}`}
          onCloseRequest={handleCloseImage}
          reactModalProps={{
            appElement: document.getElementById('root'),
          }}
        />
      )}

      <div className={styles.mainInfoContainer}>
        <div className={styles.infoContainer}>
          <div className={styles.buttonsContainer}>
            <span
              onClick={() => dispatch(changeContestViewMode(true))}
              className={classNames(styles.btn, {
                [styles.activeBtn]: isBrief,
              })}
            >
              Brief
            </span>

            <span
              onClick={() => dispatch(changeContestViewMode(false))}
              className={classNames(styles.btn, {
                [styles.activeBtn]: !isBrief,
              })}
            >
              Offer
            </span>
          </div>

          {isBrief ? (
            <Brief contestData={contestData} role={role} goChat={goChat} />
          ) : (
            <div className={styles.offersContainer}>
              {role === CONSTANTS.CREATOR &&
                contestData.status === CONSTANTS.CONTEST_STATUS_ACTIVE && (
                  <OfferForm
                    contestType={contestData.contestType}
                    contestId={contestData.id}
                    customerId={contestData.User.id}
                  />
                )}

              {setOfferStatusError && (
                <Error
                  data={setOfferStatusError.data}
                  status={setOfferStatusError.status}
                  clearError={handleClearOfferStatusError}
                />
              )}

              <div className={styles.offers}>
                {offers.length > 0 ? (
                  offers.map(offer => (
                    <OfferBox
                      key={offer.id}
                      data={offer}
                      needButtons={needButtons}
                      setOfferStatus={handleSetOfferStatus}
                      contestType={contestData.contestType}
                      date={new Date()}
                    />
                  ))
                ) : (
                  <div className={styles.notFound}>
                    There is no suggestion at this moment
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <ContestSideBar
          contestData={contestData}
          totalEntries={offers.length}
        />
      </div>
    </div>
  );
};

export default ContestPage;
