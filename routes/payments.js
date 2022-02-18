const router = require("express").Router();
const controller = require("../controllers/payment-controller");
const { authToken } = require("../middleware");

router.route("/cardtoken").post(controller.createCardToken);

router.route("/createcustom").post(authToken, controller.createUser);

router.route("/makepayment").post(authToken, controller.makePayment);

module.exports = router;
