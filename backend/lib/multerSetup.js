const path = require('path')
, multer = require('multer')
, crypto = require("crypto")
, storage = multer.diskStorage({
  destination: 'public/api/userimages/',
  filename: function (req, file, cb) {
    crypto.pseudoRandomBytes(16, function (err, raw) {
      if (err) {
        return cb(err, null);
      }

      cb(null, raw.toString('hex') + path.extname(file.originalname));
    });
  }
})
, upload = multer({ storage: storage }).single("image");

module.exports = upload;
