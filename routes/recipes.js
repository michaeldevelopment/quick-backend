const router = require("express").Router();
const controller = require("../controllers/recipes");
const { authToken } = require("../middleware");

router.route("/").get(controller.all).put(authToken, controller.addToFav);

router.route("/createrecipe").post(authToken, controller.createRecipe);

router.route("/cleandb").delete(controller.cleanDb);

module.exports = router;
