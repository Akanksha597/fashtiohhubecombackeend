const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Set up storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = "uploads/";
    if (req.baseUrl.includes("products")) {
      folder += "products/";
    } else if (req.baseUrl.includes("categories")) {
      folder += "categories/";
    } else if (req.baseUrl.includes("signup")) {
      folder += "employee/";
    }
    fs.mkdirSync(folder, { recursive: true });
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  }
});

// Update fileFilter to accept both images and PDFs
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/") || file.mimetype === "application/pdf") {
    cb(null, true); // Accept the file
  } else {
    cb(new Error("File type not supported"), false); // Reject the file
  }
};

// Set up multer with storage, fileFilter, and limits
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // Max file size: 5MB
});

module.exports = upload;