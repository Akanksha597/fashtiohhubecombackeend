const express = require('express');
const queryController = require('../Controller/queriesController');
const { protect } = require("../Middleware/protect");
const { restrict } = require("../Middleware/restrict");

const router = express.Router();


router.get('/', queryController.getAllQueries);


  router
  .route("/createquery")
  .post(queryController.createQuery);

router
  .route("/replyToMail")
  .post(protect, restrict("admin", "superAdmin"), queryController.replyToMail);

router
  .route("/resolveQuery")
  .patch(protect, restrict("admin", "superAdmin"), queryController.resolveQuery);

router
  .route("/read/:queryId")
  .patch(protect, restrict("admin", "superAdmin"), queryController.markAsRead);

router
  .route("/:queryId")
  .delete(protect, restrict("admin", "superAdmin"), queryController.deleteQuery);

module.exports = router;
