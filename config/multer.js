const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = (folder) =>
  multer.diskStorage({
    destination: function (req, file, cb) {

      const uploadPath = `uploads/${folder}`;

      // create folder if not exists
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }

      cb(null, uploadPath);
    },

    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname));
    },
  });

const uploadFile = (folder) => multer({ storage: storage(folder) });

module.exports = uploadFile;