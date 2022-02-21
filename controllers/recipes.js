require("express-async-errors");
const { Recipe, recipeFields } = require("../models/recipe");
const User = require("../models/user");
const Joi = require("@hapi/joi");

const schemaRecipe = Joi.object({
  title: Joi.string().required().min(10).max(50),
  ingredients: Joi.string().required(),
  category: Joi.string().required(),
  food_hour: Joi.string().required(),
  description: Joi.string().required(),
  premium: Joi.boolean().required(),
  photos: Joi.string().required(),
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

  const findUser = await User.findById(decoded.id).populate("favoriteRecipes");

  const userWithFav = await User.findById(decoded.id)
    .populate("favoriteRecipes")
    .find({
      favoriteRecipes: {
        $all: [body.recipeId],
      },
    });

  if (userWithFav.length) {
    return res.json({
      error: true,
      message: "Ésta receta ya está agregada a mis favoritos",
    });
  } else {
    findUser.favoriteRecipes = findUser.favoriteRecipes.concat(body.recipeId);
    const userWithFavRecipe = await findUser.save();

    return res.json({
      error: false,
      message: "La receta se ha guardado a mis favoritos",
      userWithFavRecipe,
    });
  }
};

exports.deleteRecipe = async (req, res, next) => {
  const { params = {} } = req;
  const data = await Recipe.findByIdAndDelete(params.id, {
    new: true,
  });
  res.json({
    error: false,
    message: "La receta se ha eliminado satisfactoriamente",
    data,
  });
};

exports.cleanDb = async (req, res, next) => {
  await User.deleteMany({});
  await Recipe.deleteMany({});
  res.status(204).end();
};
