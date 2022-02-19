const router = require("express").Router();
const controller = require("../controllers/payment");
const { authToken } = require("../middleware");

// router.route("/cardtoken").post(authToken, controller.createCardToken);

// router.route("/createcustomer").post(authToken, controller.createCustomer);

router.route("/makepayment").post(authToken, controller.makePayment);

router.route("/cleancredit").post(authToken, controller.cleanCredit);

module.exports = router;
