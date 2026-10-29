const db = require('../models');
const BadRequestError = require('../errors/BadRequestError');
const createDatabaseId = require('../utils/databaseId');
const { mapCatalog } = require('../utils/chatMappers');

const getCatalogState = async (
  catalogId,
  userId,
  transaction,
) => {
  const catalog = await db.Catalogs.findOne({
    where: {
      _id: catalogId,
      userId,
    },
    include: [
      {
        model: db.CatalogChats,
        as: 'catalogLinks',
        attributes: ['chatId'],
      },
    ],
    transaction,
  });

  return catalog ? mapCatalog(catalog) : null;
};

const ensureUserParticipatesInChat = async (
  chatId,
  userId,
  transaction,
) => {
  const participant =
    await db.ConversationParticipants.findOne({
      where: {
        chat: chatId,
        userId,
      },
      transaction,
    });

  if (!participant) {
    throw new BadRequestError(
      'Chat not found or access denied',
    );
  }
};

const createCatalog = async ({
  userId,
  catalogName,
  chatId,
}) => {
  const normalizedName = String(catalogName || '').trim();

  if (!normalizedName) {
    throw new BadRequestError('Catalog name is required');
  }

  if (!chatId) {
    throw new BadRequestError('Chat ID is required');
  }

  return db.sequelize.transaction(async transaction => {
    await ensureUserParticipatesInChat(
      chatId,
      userId,
      transaction,
    );

    const catalogId = createDatabaseId();

    await db.Catalogs.create(
      {
        _id: catalogId,
        userId,
        catalogName: normalizedName,
      },
      {
        transaction,
      },
    );

    await db.CatalogChats.create(
      {
        catalogId,
        chatId,
      },
      {
        transaction,
      },
    );

    return getCatalogState(
      catalogId,
      userId,
      transaction,
    );
  });
};

const updateCatalogName = async ({
  userId,
  catalogId,
  catalogName,
}) => {
  const normalizedName = String(catalogName || '').trim();

  if (!catalogId || !normalizedName) {
    throw new BadRequestError(
      'Catalog ID and name are required',
    );
  }

  const [updatedCount] = await db.Catalogs.update(
    {
      catalogName: normalizedName,
    },
    {
      where: {
        _id: catalogId,
        userId,
      },
    },
  );

  if (updatedCount !== 1) {
    throw new BadRequestError('Catalog not found');
  }

  return getCatalogState(catalogId, userId);
};

const addChatToCatalog = async ({
  userId,
  catalogId,
  chatId,
}) => {
  if (!catalogId || !chatId) {
    throw new BadRequestError(
      'Catalog ID and chat ID are required',
    );
  }

  return db.sequelize.transaction(async transaction => {
    const ownedCatalog = await db.Catalogs.findOne({
      where: {
        _id: catalogId,
        userId,
      },
      transaction,
    });

    if (!ownedCatalog) {
      throw new BadRequestError('Catalog not found');
    }

    await ensureUserParticipatesInChat(
      chatId,
      userId,
      transaction,
    );

    await db.CatalogChats.findOrCreate({
      where: {
        catalogId,
        chatId,
      },
      defaults: {
        catalogId,
        chatId,
      },
      transaction,
    });

    return getCatalogState(
      catalogId,
      userId,
      transaction,
    );
  });
};

const removeChatFromCatalog = async ({
  userId,
  catalogId,
  chatId,
}) => {
  if (!catalogId || !chatId) {
    throw new BadRequestError(
      'Catalog ID and chat ID are required',
    );
  }

  return db.sequelize.transaction(async transaction => {
    const ownedCatalog = await db.Catalogs.findOne({
      where: {
        _id: catalogId,
        userId,
      },
      transaction,
    });

    if (!ownedCatalog) {
      throw new BadRequestError('Catalog not found');
    }

    await db.CatalogChats.destroy({
      where: {
        catalogId,
        chatId,
      },
      transaction,
    });

    return getCatalogState(
      catalogId,
      userId,
      transaction,
    );
  });
};

const deleteCatalog = ({ userId, catalogId }) => {
  if (!catalogId) {
    throw new BadRequestError('Catalog ID is required');
  }

  return db.Catalogs.destroy({
    where: {
      _id: catalogId,
      userId,
    },
  });
};

const getCatalogs = async userId => {
  const catalogs = await db.Catalogs.findAll({
    where: {
      userId,
    },
    include: [
      {
        model: db.CatalogChats,
        as: 'catalogLinks',
        attributes: ['chatId'],
      },
    ],
    order: [['createdAt', 'ASC']],
  });

  return catalogs.map(mapCatalog);
};

module.exports = {
  createCatalog,
  updateCatalogName,
  addChatToCatalog,
  removeChatFromCatalog,
  deleteCatalog,
  getCatalogs,
};
