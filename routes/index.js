const router = require("express").Router();
const users = require("./users");
const recipes = require("./recipes");

router.use("/users", users);
router.use("/recipes", recipes);

module.exports = router;
