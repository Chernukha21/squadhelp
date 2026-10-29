const db = require('../models');
const CONSTANTS = require('../constants');
const BadRequestError = require('../errors/BadRequestError');
const UserNotFoundError = require('../errors/UserNotFoundError');
const createDatabaseId = require('../utils/databaseId');
const {
  getSafeUser,
  getSortedParticipantRows,
  getParticipantState,
  mapMessage,
  mapChatState,
} = require('../utils/chatMappers');

const sortParticipants = participants =>
  [...participants].sort(
    (firstId, secondId) => firstId - secondId,
  );

const findPrivateChat = async (
  participants,
  transaction,
) => {
  const firstParticipantChats =
    await db.ConversationParticipants.findAll({
      where: {
        userId: participants[0],
      },
      attributes: ['chat'],
      raw: true,
      transaction,
    });

  if (firstParticipantChats.length === 0) {
    return null;
  }

  const chatIds = firstParticipantChats.map(
    participant => participant.chat,
  );

  const chats = await db.Chats.findAll({
    where: {
      _id: {
        [db.Sequelize.Op.in]: chatIds,
      },
    },
    include: [
      {
        model: db.ConversationParticipants,
        as: 'participantRows',
        attributes: [
          'userId',
          'blackList',
          'favoriteList',
        ],
      },
    ],
    transaction,
  });

  return (
    chats.find(chat => {
      const chatParticipantIds = sortParticipants(
        chat.participantRows.map(
          participant => participant.userId,
        ),
      );

      return (
        chatParticipantIds.length === participants.length &&
        chatParticipantIds.every(
          (participantId, index) =>
            participantId === participants[index],
        )
      );
    }) || null
  );
};

const getChatState = async chatId => {
  const chat = await db.Chats.findByPk(chatId, {
    include: [
      {
        model: db.ConversationParticipants,
        as: 'participantRows',
        attributes: [
          'userId',
          'blackList',
          'favoriteList',
        ],
      },
    ],
  });

  return chat ? mapChatState(chat) : null;
};

const addMessage = async ({
  senderId,
  recipientId,
  messageBody,
}) => {
  if (
    !Number.isInteger(recipientId) ||
    recipientId <= 0 ||
    recipientId === senderId
  ) {
    throw new BadRequestError('Invalid message recipient');
  }

  if (
    typeof messageBody !== 'string' ||
    !messageBody.trim()
  ) {
    throw new BadRequestError('Message cannot be empty');
  }

  const participants = sortParticipants([
    senderId,
    recipientId,
  ]);

  const result = await db.sequelize.transaction(
    async transaction => {
      const recipient = await db.Users.findOne({
        where: {
          id: recipientId,
          role: {
            [db.Sequelize.Op.in]: [
              CONSTANTS.CUSTOMER,
              CONSTANTS.CREATOR,
            ],
          },
        },
        attributes: [
          'id',
          'firstName',
          'lastName',
          'displayName',
          'avatar',
        ],
        transaction,
      });

      if (!recipient) {
        throw new BadRequestError(
          'Message recipient not found',
        );
      }

      let chat = await findPrivateChat(
        participants,
        transaction,
      );

      let participantRows;

      if (!chat) {
        chat = await db.Chats.create(
          {
            _id: createDatabaseId(),
          },
          {
            transaction,
          },
        );

        participantRows =
          await db.ConversationParticipants.bulkCreate(
            participants.map(userId => ({
              chat: chat._id,
              userId,
              blackList: false,
              favoriteList: false,
            })),
            {
              transaction,
              returning: true,
            },
          );
      } else {
        participantRows = chat.participantRows;
      }

      const message = await db.Messages.create(
        {
          _id: createDatabaseId(),
          sender: senderId,
          body: messageBody.trim(),
          chat: chat._id,
        },
        {
          transaction,
        },
      );

      return {
        chat,
        message,
        participantRows,
        recipient,
      };
    },
  );

  const { blackList, favoriteList } = getParticipantState(
    result.participantRows,
    participants,
  );

  const message = {
    ...mapMessage(result.message),
    participants,
  };

  return {
    recipientId,
    recipient: getSafeUser(result.recipient),
    message,
    preview: {
      _id: result.chat._id,
      sender: senderId,
      text: result.message.body,
      createAt: result.message.createdAt,
      participants,
      blackList,
      favoriteList,
    },
  };
};

const getChat = async ({
  currentUserId,
  interlocutorId,
}) => {
  if (
    !Number.isInteger(interlocutorId) ||
    interlocutorId <= 0
  ) {
    throw new BadRequestError('Invalid interlocutor ID');
  }

  const participants = sortParticipants([
    currentUserId,
    interlocutorId,
  ]);

  const chat = await findPrivateChat(participants);

  let messages = [];

  if (chat) {
    const storedMessages = await db.Messages.findAll({
      where: {
        chat: chat._id,
      },
      attributes: [
        '_id',
        'sender',
        'body',
        'chat',
        'createdAt',
        'updatedAt',
      ],
      order: [['createdAt', 'ASC']],
    });

    messages = storedMessages.map(mapMessage);
  }

  const interlocutor = await db.Users.findByPk(
    interlocutorId,
    {
      attributes: [
        'id',
        'firstName',
        'lastName',
        'displayName',
        'avatar',
      ],
    },
  );

  if (!interlocutor) {
    throw new UserNotFoundError(
      'user with this data didn\'t exist',
    );
  }

  return {
    messages,
    interlocutor: getSafeUser(interlocutor),
  };
};

const getPreviews = async currentUserId => {
  const userParticipations =
    await db.ConversationParticipants.findAll({
      where: {
        userId: currentUserId,
      },
      attributes: ['chat'],
    });

  const chatIds = userParticipations.map(
    participation => participation.chat,
  );

  if (chatIds.length === 0) {
    return [];
  }

  const chats = await db.Chats.findAll({
    where: {
      _id: {
        [db.Sequelize.Op.in]: chatIds,
      },
    },
    include: [
      {
        model: db.ConversationParticipants,
        as: 'participantRows',
        attributes: [
          'userId',
          'blackList',
          'favoriteList',
        ],
      },
      {
        model: db.Messages,
        as: 'messages',
        attributes: [
          '_id',
          'sender',
          'body',
          'createdAt',
        ],
        separate: true,
        limit: 1,
        order: [['createdAt', 'DESC']],
      },
    ],
  });

  const interlocutorIds = chats
    .flatMap(chat => chat.participantRows)
    .map(participant => participant.userId)
    .filter(userId => userId !== currentUserId);

  const interlocutors = await db.Users.findAll({
    where: {
      id: {
        [db.Sequelize.Op.in]: interlocutorIds,
      },
    },
    attributes: [
      'id',
      'firstName',
      'lastName',
      'displayName',
      'avatar',
    ],
  });

  const interlocutorsById = new Map(
    interlocutors.map(user => [
      user.id,
      getSafeUser(user),
    ]),
  );

  return chats
    .map(chatInstance => {
      const chat = chatInstance.get({ plain: true });
      const lastMessage = chat.messages[0];

      if (!lastMessage) {
        return null;
      }

      const participantRows = getSortedParticipantRows(
        chat.participantRows,
      );

      const participants = participantRows.map(
        participant => participant.userId,
      );

      const interlocutorId = participants.find(
        participantId => participantId !== currentUserId,
      );

      return {
        _id: chat._id,
        sender: lastMessage.sender,
        text: lastMessage.body,
        createAt: lastMessage.createdAt,
        participants,
        blackList: participantRows.map(
          participant => participant.blackList,
        ),
        favoriteList: participantRows.map(
          participant => participant.favoriteList,
        ),
        interlocutor: interlocutorsById.get(interlocutorId),
      };
    })
    .filter(Boolean)
    .sort(
      (firstConversation, secondConversation) =>
        new Date(secondConversation.createAt) -
        new Date(firstConversation.createAt),
    );
};

const validateParticipantRequest = (
  requestedParticipants,
  currentUserId,
) => {
  const participants = Array.isArray(requestedParticipants)
    ? sortParticipants(requestedParticipants.map(Number))
    : [];

  const hasInvalidParticipant = participants.some(
    participantId =>
      !Number.isInteger(participantId) || participantId <= 0,
  );

  if (
    participants.length !== 2 ||
    new Set(participants).size !== 2 ||
    hasInvalidParticipant ||
    !participants.includes(currentUserId)
  ) {
    throw new BadRequestError('Invalid participants');
  }

  return participants;
};

const updateParticipantFlag = async ({
  currentUserId,
  requestedParticipants,
  field,
  value,
}) => {
  const participants = validateParticipantRequest(
    requestedParticipants,
    currentUserId,
  );

  const chat = await findPrivateChat(participants);

  if (!chat) {
    throw new BadRequestError('Chat not found');
  }

  const [updatedCount] =
    await db.ConversationParticipants.update(
      {
        [field]: value,
      },
      {
        where: {
          chat: chat._id,
          userId: currentUserId,
        },
      },
    );

  if (updatedCount !== 1) {
    throw new BadRequestError(
      'Chat participant not found',
    );
  }

  return {
    updatedChat: await getChatState(chat._id),
    interlocutorId: participants.find(
      participantId => participantId !== currentUserId,
    ),
  };
};

const updateBlackList = ({
  currentUserId,
  participants,
  blackListFlag,
}) => {
  if (typeof blackListFlag !== 'boolean') {
    throw new BadRequestError(
      'blackListFlag must be boolean',
    );
  }

  return updateParticipantFlag({
    currentUserId,
    requestedParticipants: participants,
    field: 'blackList',
    value: blackListFlag,
  });
};

const updateFavorite = ({
  currentUserId,
  participants,
  favoriteFlag,
}) => {
  if (typeof favoriteFlag !== 'boolean') {
    throw new BadRequestError(
      'favoriteFlag must be boolean',
    );
  }

  return updateParticipantFlag({
    currentUserId,
    requestedParticipants: participants,
    field: 'favoriteList',
    value: favoriteFlag,
  });
};

module.exports = {
  addMessage,
  getChat,
  getPreviews,
  updateBlackList,
  updateFavorite,
};
