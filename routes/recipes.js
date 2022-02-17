const router = require("express").Router();
const controller = require("../controllers/recipes");
const { authToken } = require("../middleware");

router
  .route("/")
  .get(controller.all)
  .put(authToken, controller.addToFav)
  .delete(controller.cleanDb);

router.route("/:id").delete(authToken, controller.deleteRecipe);

router.route("/createrecipe").post(authToken, controller.createRecipe);

module.exports = router;
