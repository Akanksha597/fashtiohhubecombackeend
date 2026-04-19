const express = require("express");
const bulkOrderController = require("../Controller/bulkOrderController")
const { protect } = require("../Middleware/protect");
const { restrict } = require("../Middleware/restrict");
const upload = require("../Middleware/upload");
const router = express.Router();


router.route("/").get(
    protect,
    bulkOrderController.getAllBulks
  );
  
router
  .route("/create")
  .post(
    protect, upload.single("thumbnail"),
    restrict("admin", "employee"),
    bulkOrderController.createBulk
  );
// router
//   .route("/:id")
//   .get( blogController.getBlogById)
//   .patch(
//     protect,
//     restrict("admin", "superAdmin"),
//     blogController.updateBlog
//   )
//   .delete(
//     protect,
//     restrict("admin"),
//     blogController.deleteBlog
//   );


module.exports = router;
