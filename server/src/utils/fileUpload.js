const fs = require('fs');
const path = require('path');
const multer = require('multer');
const ServerError = require('../errors/ServerError');
const BadRequestError = require('../errors/BadRequestError');

const env = process.env.NODE_ENV || 'development';

const MAX_OFFER_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_OFFER_FILE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

const devFilePath = path.resolve(
  __dirname,
  '..',
  '..',
  'public',
  'images'
);

const filePath =
  env === 'production'
    ? '/var/www/html/images/'
    : devFilePath;

if (!fs.existsSync(filePath)) {
  fs.mkdirSync(filePath, { recursive: true });
}

const storageContestFiles = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, filePath);
  },

  filename(req, file, cb) {
    cb(null, Date.now() + file.originalname);
  },
});

const logoFileFilter = (req, file, cb) => {
  if (!ALLOWED_OFFER_FILE_TYPES.has(file.mimetype)) {
    return cb(
      new Error('Only JPEG, PNG and WEBP images are allowed')
    );
  }

  return cb(null, true);
};

const uploadAvatars = multer({
  storage: storageContestFiles,
}).single('file');

const uploadContestFiles = multer({
  storage: storageContestFiles,
}).array('files', 3);

const updateContestFile = multer({
  storage: storageContestFiles,
}).single('file');

const uploadLogoFiles = multer({
  storage: storageContestFiles,
  limits: {
    fileSize: MAX_OFFER_FILE_SIZE,
    files: 1,
  },
  fileFilter: logoFileFilter,
}).single('offerData');

const handleUpload = upload => (req, res, next) => {
  upload(req, res, err => {
    if (err) {
      return next(new ServerError('Cannot upload file'));
    }

    return next();
  });
};

module.exports.uploadAvatar = handleUpload(uploadAvatars);

module.exports.uploadContestFiles = handleUpload(
  uploadContestFiles
);

module.exports.updateContestFile = handleUpload(
  updateContestFile
);

module.exports.uploadLogoFiles = (req, res, next) => {
  uploadLogoFiles(req, res, err => {
    if (!err) {
      return next();
    }

    if (
      err instanceof multer.MulterError &&
      err.code === 'LIMIT_FILE_SIZE'
    ) {
      return next(
        new BadRequestError('Image must be 5 MB or less')
      );
    }

    return next(
      new BadRequestError(
        err.message || 'Cannot upload image'
      )
    );
  });
};
