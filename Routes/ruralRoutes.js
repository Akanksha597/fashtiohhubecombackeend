const express = require('express');
const router = express.Router();
const upload = require("../Middleware/upload");
const { protect } = require("../Middleware/protect");
const { restrict } = require("../Middleware/restrict");
const ruralfController = require('../Controller/ruralfController');



router.route("/").get(
     
   ruralfController.getAllCropDetails
  );
router.route("/cropcreate").post(
  protect,
  (req, res, next) => {
    console.log("Protect middleware passed");
    next();
  },
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "pdf", maxCount: 1 },
  ]),
  (req, res, next) => {
    console.log("Upload middleware passed");
    console.log("Uploaded files:", req.files);
    next();
  },
  ruralfController.uploadCropDetails
);





module.exports = router;