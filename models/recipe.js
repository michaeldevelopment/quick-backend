const mongoose = require("mongoose");

const recipeFields = {
  title: {
    type: String,
    required: [true, "Por favor indica el titulo"],
    trim: true,
    maxLength: 100,
  },
  description: {
    type: String,
    required: [true, "Por favor indica la descripción"],
    trim: true,
  },
  mainPhoto: {
    type: Number,
    default: 0,
  },
  ingredients: [
    {
      type: String,
      trim: true,
      maxLength: 50,
    },
  ],
  favorites: [String],
  user: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: [true, "Por favor indica el usuario"],
  },
};

const recipeSchema = new mongoose.Schema(recipeFields, { timestamps: true });

recipeSchema.post("save", function (doc, next) {
  doc.populate("user", { username: 1, email: 1 }).then(function () {
    next();
  });
});

recipeSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const Recipe = mongoose.model("Recipes", recipeSchema);

module.exports = { Recipe, recipeFields };
