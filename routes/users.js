const router = require("express").Router();
const controller = require("../controllers/users");
const { authToken } = require("../middleware");

router.route("/").get(controller.all);

router
  .route("/:id")
  .get(authToken, controller.me)
  .put(authToken, controller.deleteFavRecipe);

router.route("/emailrecovery").post(controller.emailRecovery);
router.route("/passwordreset").post(controller.resetPassword);

router.route("/signup").post(controller.createUser);
router.route("/login").post(controller.loginUser);

module.exports = router;
