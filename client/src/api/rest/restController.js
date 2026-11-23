import http from '../interceptor';

export const registerRequest = data => http.post('registration', data);
export const loginRequest = data => http.post('login', data);
export const getUser = () => http.get('getUser');
export const updateContest = data => http.patch('updateContest', data);
export const setNewOffer = data => http.post('setNewOffer', data);
export const setOfferStatus = data => http.patch('setOfferStatus', data);
export const downloadContestFile = data =>
  http.get(`downloadFile/${data.fileName}`);
export const payMent = data => http.post('pay', data.formData);
export const changeMark = data => http.patch('changeMark', data);
export const getPreviewChat = () => http.get('getPreview');
export const getDialog = data =>
  http.get('getChat', { params: { interlocutorId: data.interlocutorId } });
export const dataForContest = data =>
  http.get('dataForContest', { params: data });
export const cashOut = data => http.post('cashout', data);
export const updateUser = data => http.patch('updateUser', data);
export const newMessage = data => http.post('newMessage', data);
export const changeChatFavorite = data => http.patch('favorite', data);
export const changeChatBlock = data => http.patch('blackList', data);
export const getCatalogList = () => http.get('getCatalogs');
export const addChatToCatalog = data => http.post('addNewChatToCatalog', data);
export const createCatalog = data => http.post('createCatalog', data);
export const deleteCatalog = data => http.delete('deleteCatalog', { data });
export const removeChatFromCatalog = data =>
  http.delete('removeChatFromCatalog', { data });
export const changeCatalogName = data => http.patch('updateNameCatalog', data);
export const getCustomersContests = data =>
  http.get('getCustomersContests', {
    params: {
      limit: data.limit,
      offset: data.offset,
      status: data.contestStatus,
    },
  });

export const getActiveContests = ({
  offset,
  limit,
  typeIndex,
  contestId,
  industry,
  awardSort,
  ownEntries,
}) =>
  http.get('getAllContests', {
    params: {
      offset,
      limit,
      typeIndex,
      contestId,
      industry,
      awardSort,
      ownEntries,
    },
  });

export const getContestById = data =>
  http.get('getContestById', {
    headers: {
      contestId: data.contestId,
    },
  });

export const getModeratorOffers = ({
  page = 1,
  limit = 20,
  moderationStatus,
} = {}) =>
  http.get('moderator/offers', {
    params: {
      page,
      limit,
      moderationStatus,
    },
  });

export const moderateOffer = ({ offerId, decision }) =>
  http.patch(`moderator/offers/${offerId}`, {
    decision,
  });
