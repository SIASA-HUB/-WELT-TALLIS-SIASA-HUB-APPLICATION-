const multer = require('multer');
const path = require('path');
const fs = require('fs');

const createUploader = (folderName = 'general', maxFiles = 5) => {
  if (typeof folderName !== 'string') {
    throw new Error('folderName must be a string');
  }

  const uploadPath = path.join(__dirname, '../../../uploads', folderName);

  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueName =
        Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, uniqueName + path.extname(file.originalname));
    },
  });

  const upload = multer({
    storage,
    limits: {
      files: maxFiles,
      fileSize: 5 * 1024 * 1024, // 5MB per image
    },
  });

  return upload;
};

module.exports = createUploader;
