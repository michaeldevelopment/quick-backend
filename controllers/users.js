require("express-async-errors");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Joi = require("@hapi/joi");
const config = require("../config");
const { welcomeEmail, changePassword } = require("../utils/mail");
const { Recipe, recipeFields } = require("../models/recipe");

const schemaRegister = Joi.object({
  firstName: Joi.string().min(6).max(30),
  lastName: Joi.string().min(6).max(30),
  username: Joi.string().min(6).max(30).required(),
  password: Joi.string().min(6).max(30).required(),
  email: Joi.string().required().email(),
});

const schemaLogin = Joi.object({
  username: Joi.string().min(6).max(30).required(),
  password: Joi.string().min(6).max(30).required(),
});

const schemaEmailRecovery = Joi.object({
  email: Joi.string().required().email(),
});

const schemaResetPassword = Joi.object({
  newPassword: Joi.string().min(6).max(30).required(),
  id: Joi.string(),
});

exports.all = async (req, res, next) => {
  const data = await User.find({})
    .populate("recipes", { user: 0 })
    .populate("favoriteRecipes");

  res.json({ data });
};

// Get user for profile
exports.me = async (req, res, next) => {
  const { decoded = {} } = req;
  const user = await User.findById(decoded.id)
    .populate("recipes", { user: 0 })
    .populate("favoriteRecipes");

  res.json({
    error: false,
    recipes: user.recipes,
    favoriteRecipes: user.favoriteRecipes,
  });
};

exports.createUser = async (req, res, next) => {
  const { error, value: body } = schemaRegister.validate(req.body);
  if (error) {
    return res.json({ error: true, message: error.details[0].message });
  }
  const emailNotUnique = await User.findOne({ email: body.email });
  const usernameNotUnique = await User.findOne({ username: body.username });

  if (emailNotUnique)
    return res.json({ error: true, message: "Ya existe éste email" });
  if (usernameNotUnique)
    return res.json({
      error: true,
      message: "Ya existe éste nombre de usuario",
    });
  const hashedPassword = await bcrypt.hash(body.password, 10);
  const user = new User({
    username: body.username,
    firstName: body.firstName,
    lastName: body.lastName,
    password: hashedPassword,
    email: body.email,
  });
  const savedUser = await user.save();
  welcomeEmail(body.username, body.email);
  const accessToken = jwt.sign(
    {
      username: user.username,
      id: user._id,
      email: user.email,
    },
    config.ACCESS_TOKEN_SECRET
  );
  return res.json({
    token: accessToken,
    username: savedUser.username,
    email: savedUser.email,
    id: savedUser._id,
  });
};

exports.loginUser = async (req, res, next) => {
  const { error, value: body } = schemaLogin.validate(req.body);
  if (error) {
    return res.json({ error: true, message: error.details[0].message });
  }
  const validUser = await User.findOne({ username: body.username })
    .populate("recipes")
    .populate("favoriteRecipes");

  if (!validUser)
    return res.json({ error: true, message: "Nombre de usuario incorrecto" });
  const validpassword = await bcrypt.compare(body.password, validUser.password);
  if (!validpassword)
    return res.json({ error: true, message: "Contraseña incorrecta" });
  // PayLoad JWT
  const accessToken = jwt.sign(
    {
      username: validUser.username,
      id: validUser._id,
      email: validUser.email,
    },
    config.ACCESS_TOKEN_SECRET
  );
  res.json({
    token: accessToken,
    email: validUser.email,
    username: validUser.username,
    id: validUser._id,
  });
};

exports.emailRecovery = async (req, res, next) => {
  const { error, value: body } = schemaEmailRecovery.validate(req.body);
  if (error) {
    return res.json({ error: true, message: error.details[0].message });
  }
  const validUser = await User.findOne({ email: body.email });

  if (!validUser)
    return res.json({
      error: true,
      message: "Éste email no está asociado a ningún usuario",
    });

  changePassword(validUser.username, validUser.email, validUser._id);
  res.json({
    error: false,
    id: validUser._id,
  });
};

exports.resetPassword = async (req, res, next) => {
  const { error, value: body } = schemaResetPassword.validate(req.body);
  if (error) {
    return res.json({ error: true, message: error.details[0].message });
  }
  const hashedPassword = await bcrypt.hash(body.newpassword, 10);

  const updatedUser = await User.findByIdAndUpdate(
    body.id,
    { password: hashedPassword },
    { runValidators: true, new: true }
  );
  res.json(updatedUser);
};

exports.updateUser = async (req, res, next) => {
  const { decodedUser = {} } = req;
  const updatedUser = await User.findByIdAndUpdate(decodedUser.id, req.body, {
    runValidators: true,
    new: true,
  });
  res.json(updatedUser);
};

exports.deleteFavRecipe = async (req, res, next) => {
  const { params = {}, decoded = {} } = req;

  const findUser = await User.findByIdAndUpdate(
    decoded.id,
    {
      $pull: { favoriteRecipes: params.id },
    },
    { new: true }
  );

  res.json({
    error: false,
    message: "La receta se ha eliminado de tus favoritos",
  });
};
