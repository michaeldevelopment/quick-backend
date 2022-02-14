const mongoose = require("mongoose");

const userFields = {
  username: {
    type: String,
    required: true,
    min: 6,
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
  // recipes: [
  //   {
  //     type: mongoose.Types.ObjectId,
  //     ref: "Recipe",
  //   },
  // ],
};

const userSchema = new mongoose.Schema(userFields, { timestamps: true });

userSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    delete returnedObject.pwd;
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
