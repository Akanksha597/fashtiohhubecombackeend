const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../Utils/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "users",
    resource_type: "auto",
  },
});

const upload = multer({ storage });

// ✅ IMPORTANT: export directly
module.exports = upload;