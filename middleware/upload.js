// middleware/upload.js
const multer = require('multer');

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      const err = new Error('Only image files are allowed');
      err.status = 400;               // so the route can return 400, not 500
      return cb(err);
    }
    cb(null, true);
  },
});

module.exports = upload;