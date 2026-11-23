const express = require('express');
const basicMiddlewares = require('../middlewares/basicMiddlewares');
const hashPass = require('../middlewares/hashPassMiddle');
const userController = require('../controllers/userController');
const contestController = require('../controllers/contestController');
const checkToken = require('../middlewares/checkToken');
const validators = require('../middlewares/validators');
const chatController = require('../controllers/chatController');
const moderatorController = require(
  '../controllers/moderatorController',
);
const upload = require('../utils/fileUpload');
const router = express.Router();

router.post(
  '/registration',
  validators.validateRegistrationData,
  hashPass,
  userController.registration,
);

router.post(
  '/login',
  validators.validateLogin,
  userController.login,
);

router.get(
  '/getUser',
  checkToken.checkAuth,
);

router.get(
  '/moderator/offers',
  checkToken.checkToken,
  basicMiddlewares.onlyForModerator,
  moderatorController.getOffers,
);

router.patch(
  '/moderator/offers/:offerId',
  checkToken.checkToken,
  basicMiddlewares.onlyForModerator,
  moderatorController.moderateOffer,
);

router.use(
  checkToken.checkToken,
  basicMiddlewares.onlyForRegularUsers,
);

router.get(
  '/dataForContest',
  contestController.dataForContest,
);

router.post(
  '/pay',
  basicMiddlewares.onlyForCustomer,
  upload.uploadContestFiles,
  basicMiddlewares.parseBody,
  validators.validateContestCreation,
  userController.payment,
);

router.get(
  '/getCustomersContests',
  contestController.getCustomersContests,
);

router.get(
  '/getContestById',
  basicMiddlewares.canGetContest,
  contestController.getContestById,
);

router.get(
  '/getAllContests',
  basicMiddlewares.onlyForCreative,
  contestController.getContests,
);


router.get(
  '/downloadFile/:fileName',
  contestController.downloadFile,
);

router.patch(
  '/updateContest',
  basicMiddlewares.onlyForCustomer,
  upload.updateContestFile,
  basicMiddlewares.canUpdateContest,
  contestController.updateContest,
);

router.post(
  '/setNewOffer',
  basicMiddlewares.onlyForCreative,
  upload.uploadLogoFiles,
  basicMiddlewares.canSendOffer,
  contestController.setNewOffer,
);

router.patch(
  '/setOfferStatus',
  basicMiddlewares.onlyForCustomerWhoCreateContest,
  contestController.setOfferStatus,
);

router.patch(
  '/changeMark',
  basicMiddlewares.onlyForCustomer,
  userController.changeMark,
);

router.patch(
  '/updateUser',
  upload.uploadAvatar,
  userController.updateUser,
);

router.post(
  '/cashout',
  basicMiddlewares.onlyForCreative,
  userController.cashout,
);

router.post(
  '/newMessage',
  chatController.addMessage,
);

router.get(
  '/getChat',
  chatController.getChat,
);

router.get(
  '/getPreview',
  chatController.getPreview,
);

router.patch(
  '/blackList',
  chatController.blackList,
);

router.patch(
  '/favorite',
  chatController.favoriteChat,
);

router.post(
  '/createCatalog',
  chatController.createCatalog,
);

router.patch(
  '/updateNameCatalog',
  chatController.updateNameCatalog,
);

router.post(
  '/addNewChatToCatalog',
  chatController.addNewChatToCatalog,
);

router.delete(
  '/removeChatFromCatalog',
  chatController.removeChatFromCatalog,
);

router.delete(
  '/deleteCatalog',
  chatController.deleteCatalog,
);

router.get(
  '/getCatalogs',
  chatController.getCatalogs,
);

module.exports = router;
