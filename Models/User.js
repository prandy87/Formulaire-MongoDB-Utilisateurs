const mongoose = require("mongoose");

const User = mongoose.model("User", {
  email: String,
  account: {
    gender: String,
    firstName: String,
    lastName: String,
    birthday: String,
    address: String,
    zipcode: String,
    city: String,
    comment: String,
  },
  token: String,
  hash: String,
  salt: String,
});

module.exports = User;
