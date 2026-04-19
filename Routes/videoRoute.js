const express = require("express");
const router = express.Router();
const videoController = require("../Controller/videosController");
const { protect } = require("../Middleware/protect");
const { restrict } = require("../Middleware/restrict");
router.route("/").get(videoController.getAllVideos);

router
  .route("/create")
  .post(protect, restrict("admin", "superAdmin"), videoController.createVideo);

router.put("/:id", videoController.updateVideo);

router.delete("/:id", videoController.deleteVideo);

module.exports = router;
