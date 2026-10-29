const toPlain = entity =>
  typeof entity?.get === 'function'
    ? entity.get({ plain: true })
    : entity;

const getSafeUser = user => {
  const plainUser = toPlain(user);

  return {
    id: plainUser.id,
    firstName: plainUser.firstName,
    lastName: plainUser.lastName,
    displayName: plainUser.displayName,
    avatar: plainUser.avatar,
  };
};

const getSortedParticipantRows = participantRows =>
  [...participantRows].sort(
    (firstParticipant, secondParticipant) =>
      firstParticipant.userId - secondParticipant.userId,
  );

const getParticipantState = (
  participantRows,
  participants,
) => {
  const participantMap = new Map(
    participantRows.map(participant => [
      participant.userId,
      participant,
    ]),
  );

  return {
    blackList: participants.map(participantId =>
      Boolean(participantMap.get(participantId)?.blackList),
    ),
    favoriteList: participants.map(participantId =>
      Boolean(participantMap.get(participantId)?.favoriteList),
    ),
  };
};

const mapMessage = messageInstance => {
  const message = toPlain(messageInstance);

  return {
    _id: message._id,
    sender: message.sender,
    body: message.body,
    conversation: message.chat,
    createdAt: message.createdAt,
    updatedAt: message.updatedAt,
  };
};

const mapChatState = chatInstance => {
  const chat = toPlain(chatInstance);
  const participantRows = getSortedParticipantRows(
    chat.participantRows,
  );

  return {
    _id: chat._id,
    participants: participantRows.map(
      participant => participant.userId,
    ),
    blackList: participantRows.map(
      participant => participant.blackList,
    ),
    favoriteList: participantRows.map(
      participant => participant.favoriteList,
    ),
    createdAt: chat.createdAt,
    updatedAt: chat.updatedAt,
  };
};

const mapCatalog = catalogInstance => {
  const catalog = toPlain(catalogInstance);

  return {
    _id: catalog._id,
    userId: catalog.userId,
    catalogName: catalog.catalogName,
    chats: (catalog.catalogLinks || []).map(
      catalogLink => catalogLink.chatId,
    ),
    createdAt: catalog.createdAt,
  };
};

module.exports = {
  getSafeUser,
  getSortedParticipantRows,
  getParticipantState,
  mapMessage,
  mapChatState,
  mapCatalog,
  toPlain,
};
