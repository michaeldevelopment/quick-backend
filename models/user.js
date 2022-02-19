const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    refId: {
      type: String,
      trim: true,
      required: true,
    },
    bill: {
      type: String,
      trim: true,
      required: true,
    },
    description: {
      type: String,
      trim: true,
      required: true,
    },
    value: {
      type: String,
      trim: true,
      required: true,
    },
    state: {
      type: String,
      trim: true,
      required: true,
    },
  },
  { timestamps: true }
);

const creditCards = new mongoose.Schema({
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
});

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
  favoriteRecipes: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Recipe",
    },
  ],
  premium: {
    creditCards: [creditCards],
    customerId: String,
    premiumStatus: { type: Boolean, default: false },
    payments: [paymentSchema],
  },
};

const userSchema = new mongoose.Schema(userFields, { timestamps: true });

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
