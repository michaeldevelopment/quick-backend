const router = require("express").Router();
const controller = require("../controllers/users");
const { authToken } = require("../middleware");

router.route("/").get(authToken, controller.all);

router.route("/emailrecovery").post(controller.emailRecovery);
router.route("/passwordreset").post(controller.resetPassword);

router.route("/signup").post(controller.createUser);
router.route("/login").post(controller.loginUser);

module.exports = router;
