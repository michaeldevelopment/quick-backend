require("express-async-errors");
const { Recipe, recipeFields } = require("../models/recipe");
const User = require("../models/user");
const Joi = require("@hapi/joi");
const config = require("../config");

const schemaRecipe = Joi.object({
  title: Joi.string().required().min(10).max(50),
  ingredients: Joi.string().required(),
  category: Joi.string().required(),
  food_hour: Joi.string().required(),
  description: Joi.string().required(),
});

exports.all = async (req, res, next) => {
  const data = await Recipe.find({}).populate("user", {
    username: 1,
    email: 1,
  });
  return res.json(data);
};

exports.createRecipe = async (req, res, next) => {
  const { decoded = {} } = req;
  const { error, value: body } = schemaRecipe.validate(req.body);
  if (error) {
    return res.json({ error: true, message: error.details[0].message });
  }

  const findUser = await User.findById(decoded.id);
  const recipe = new Recipe({
    ...body,
    user: decoded.id,
  });

  const savedRecipe = await recipe.save();
  findUser.recipes = findUser.recipes.concat(savedRecipe.id);
  await findUser.save();
  return res.json({
    savedRecipe,
    error: false,
    message: "La receta se ha creado exitosamente",
  });
};

exports.addToFav = async (req, res, next) => {
  const { decoded = {}, body = {} } = req;

  const findUser = await User.findById(decoded.id);
  const notFavRecipeTwice = await User.find({
    firstName: "Jose",
  });

  // findUser.favoriteRecipes = findUser.favoriteRecipes.concat(body.recipeId);
  // const userWithFavRecipe = await findUser.save();

  console.log(body.recipeId);
  console.log(notFavRecipeTwice);

  // return res.json({
  //   error: false,
  //   message: "La receta se ha guardado a Favoritos",
  // });
};

exports.cleanDb = async (req, res, next) => {
  await User.deleteMany({});
  await Recipe.deleteMany({});
  res.status(204).end();
};
