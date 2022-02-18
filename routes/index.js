const router = require("express").Router();
const users = require("./users");
const recipes = require("./recipes");
const payments = require("./payments");

router.use("/users", users);
router.use("/recipes", recipes);
router.use("/payments", payments);

module.exports = router;
