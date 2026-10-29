const chatService = require('../services/chatService');
const catalogService = require('../services/catalogService');
const controller = require('../socketInit');

module.exports.addMessage = async (req, res, next) => {
  try {
    const senderId = Number(req.tokenData.userId);

    const result = await chatService.addMessage({
      senderId,
      recipientId: Number(req.body.recipient),
      messageBody: req.body.messageBody,
    });

    const recipientPreview = {
      ...result.preview,
      interlocutor: {
        id: senderId,
        firstName: req.tokenData.firstName,
        lastName: req.tokenData.lastName,
        displayName: req.tokenData.displayName,
        avatar: req.tokenData.avatar,
        email: req.tokenData.email,
      },
    };

    controller
      .getChatController()
      .emitNewMessage(result.recipientId, {
        message: result.message,
        preview: recipientPreview,
      });

    return res.send({
      message: result.message,
      preview: {
        ...result.preview,
        interlocutor: result.recipient,
      },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports.getChat = async (req, res, next) => {
  try {
    const chat = await chatService.getChat({
      currentUserId: Number(req.tokenData.userId),
      interlocutorId: Number(req.body.interlocutorId),
    });

    return res.send(chat);
  } catch (error) {
    return next(error);
  }
};

module.exports.getPreview = async (req, res, next) => {
  try {
    const previews = await chatService.getPreviews(
      Number(req.tokenData.userId),
    );

    return res.send(previews);
  } catch (error) {
    return next(error);
  }
};

module.exports.blackList = async (req, res, next) => {
  try {
    const result = await chatService.updateBlackList({
      currentUserId: Number(req.tokenData.userId),
      participants: req.body.participants,
      blackListFlag: req.body.blackListFlag,
    });

    controller
      .getChatController()
      .emitChangeBlockStatus(
        result.interlocutorId,
        result.updatedChat,
      );

    return res.send(result.updatedChat);
  } catch (error) {
    return next(error);
  }
};

module.exports.favoriteChat = async (req, res, next) => {
  try {
    const result = await chatService.updateFavorite({
      currentUserId: Number(req.tokenData.userId),
      participants: req.body.participants,
      favoriteFlag: req.body.favoriteFlag,
    });

    return res.send(result.updatedChat);
  } catch (error) {
    return next(error);
  }
};

module.exports.createCatalog = async (req, res, next) => {
  try {
    const catalog = await catalogService.createCatalog({
      userId: Number(req.tokenData.userId),
      catalogName: req.body.catalogName,
      chatId: req.body.chatId,
    });

    return res.send(catalog);
  } catch (error) {
    return next(error);
  }
};

module.exports.updateNameCatalog = async (
  req,
  res,
  next,
) => {
  try {
    const catalog = await catalogService.updateCatalogName({
      userId: Number(req.tokenData.userId),
      catalogId: req.body.catalogId,
      catalogName: req.body.catalogName,
    });

    return res.send(catalog);
  } catch (error) {
    return next(error);
  }
};

module.exports.addNewChatToCatalog = async (
  req,
  res,
  next,
) => {
  try {
    const catalog = await catalogService.addChatToCatalog({
      userId: Number(req.tokenData.userId),
      catalogId: req.body.catalogId,
      chatId: req.body.chatId,
    });

    return res.send(catalog);
  } catch (error) {
    return next(error);
  }
};

module.exports.removeChatFromCatalog = async (
  req,
  res,
  next,
) => {
  try {
    const catalog =
      await catalogService.removeChatFromCatalog({
        userId: Number(req.tokenData.userId),
        catalogId: req.body.catalogId,
        chatId: req.body.chatId,
      });

    return res.send(catalog);
  } catch (error) {
    return next(error);
  }
};

module.exports.deleteCatalog = async (req, res, next) => {
  try {
    const deletedCount = await catalogService.deleteCatalog({
      userId: Number(req.tokenData.userId),
      catalogId: req.body?.catalogId,
    });

    if (deletedCount === 0) {
      return res.status(404).send({
        message: 'Catalog not found',
      });
    }

    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
};

module.exports.getCatalogs = async (req, res, next) => {
  try {
    const catalogs = await catalogService.getCatalogs(
      Number(req.tokenData.userId),
    );

    return res.send(catalogs);
  } catch (error) {
    return next(error);
  }
};
