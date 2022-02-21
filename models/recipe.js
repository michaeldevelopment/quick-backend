const mongoose = require("mongoose");

const recipeFields = {
  title: {
    type: String,
    required: [true, "Por favor indica el titulo"],
    trim: true,
    minLength: 10,
    maxLength: 50,
  },
  ingredients: {
    type: String,
    trim: true,
    required: true,
  },
  category: {
    type: String,
    trim: true,
    required: true,
  },
  food_hour: {
    type: String,
    trim: true,
    required: true,
  },
  description: {
    type: String,
    required: [true, "Por favor indica la descripción"],
    trim: true,
  },
  photos: { type: String },
  premium: { type: Boolean, default: false },
  user: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: true,
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

const Recipe = mongoose.model("Recipe", recipeSchema);

module.exports = { Recipe, recipeFields };
