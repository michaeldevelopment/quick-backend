const mongoose = require("mongoose");

const creditCardFields = {
  expMonth: {
    type: String,
    trim: true,
    required: true,
  },
  expYear: {
    type: String,
    trim: true,
    required: true,
  },
  name: {
    type: String,
    trim: true,
    required: true,
  },
  mask: {
    type: String,
    trim: true,
    required: true,
  },
  tokenId: {
    type: String,
    trim: true,
    required: true,
  },
};

const billingFields = {
  creditCards: [creditCardFields],
  customerId: {
    type: String,
  },
};

const userFields = {
  username: {
    type: String,
    required: true,
    min: 3,
    max: 30,
  },
  password: {
    type: String,
    required: true,
    min: 6,
    max: 30,
  },
  email: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  bio: {
    type: String,
  },
  photo: String,
  recipes: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Recipe",
    },
  ],
  premium: {
    type: Boolean,
  },
  billing: billingFields,
  favoriteRecipes: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Recipe",
    },
  ],
};

const userSchema = new mongoose.Schema(userFields, { timestamps: true });

const billingSchema = new mongoose.Schema(billingFields, { timestamps: true });

const creditCardSchema = new mongoose.Schema(creditCardFields, {
  timestamps: true,
});

userSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    delete returnedObject.password;
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
