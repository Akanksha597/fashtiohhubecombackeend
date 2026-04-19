 const express = require("express");
 const settingController = require('../Controller/settingController') 
const { protect } = require("../Middleware/protect");
const { restrict } = require("../Middleware/restrict");
const upload = require("../Middleware/upload");
const router = express.Router();


router.route("/").get(
    settingController.getGeneralSetting
  );
  router
  .route("/update/:id")
  .patch(
    protect,
    upload.fields([
        { name: "thumbnail" }, // 🔹 Ensure files are processed
        { name: "favicon" }
    ]),
    restrict("admin", "superAdmin"),
    settingController.updateGeneralSetting
  );
  router
  .route("/create")
  .post(
    protect, 
    upload.fields([
        { name: "thumbnail" }, // 🔹 Fixed typo (was "thumnail")
        { name: "favicon" }
    ]),
    restrict("admin", "employee"),
    settingController.saveGeneralSetting
  );



module.exports = router;
