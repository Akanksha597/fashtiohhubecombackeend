 const express = require("express");
const blogController = require('../Controller/blogController'); 
const { protect } = require("../Middleware/protect");
const { restrict } = require("../Middleware/restrict");
const upload = require("../Middleware/upload");
const router = express.Router();


router.route("/").get(
// Uncomment this to ensure the user is authenticated
    // Uncomment this if you want to restrict access by role
    blogController.getAllBlogs
  );
  
router
  .route("/create")
  .post(
    protect, upload.single("thumbnail"),
    restrict("admin", "employee"),
    blogController.createBlog
  );
router
  .route("/:id")
  .get( blogController.getBlogById)
  .patch(
    protect,
    restrict("admin", "superAdmin"),
    blogController.updateBlog
  )
  .delete(
    protect,
    restrict("admin"),
    blogController.deleteBlog
  );


module.exports = router;
