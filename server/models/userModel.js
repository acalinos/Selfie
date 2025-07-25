const mongoose = require("mongoose");
const validator = require("validator");
const { getDefaultPic } = require("../controllers/mediaController");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: String,
  surname: String,
  birthday: Date,
  profilePic: { type: mongoose.Schema.Types.ObjectId, ref: "Media", required: true },
  pushSubscriptions: [
    { type: mongoose.Schema.Types.ObjectId, ref: "PushSub", default: [] }
  ],
});

const User = mongoose.model("User", userSchema);

function validation(username, password, name, surname, birthday) {
  if (!username || !password) {
    throw Error("Username and Password required");
  }
  if (name && !validator.isAlpha(name)) {
    throw Error("Real name not valid");
  }
  if (surname && !validator.isAlpha(surname)) {
    throw Error("Real surname not valid");
  }
  if (
    birthday &&
    !validator.isDate(new Date(birthday).toISOString().split("T")[0])
  ) {
    throw Error("Date of Birth not valid");
  }
}

async function validateSignup(username, password, name, surname, birthday) {
  validation(username, password, name, surname, birthday);

  const exists = await User.findOne({ username });
  if (exists) {
    throw Error("Username already in use");
  }

  const user = await User.create({
    username,
    password, // ⚠️ NO HASHING
    name,
    surname,
    profilePic: await getDefaultPic(),
    birthday,
    pushSubscriptions: [],
  });

  return user;
}

async function validateLogin(username, password) {
  if (!username || !password) {
    throw Error("All required fields must be filled");
  }

  const user = await User.findOne({ username });

  if (!user || user.password !== password) {
    throw Error("Invalid Username or Password");
  }

  return user;
}

async function updateProfile(username, name, surname, birthday, profilePic, _id) {
  const profilePicID = profilePic.split("media/")[1];

  if (name && !validator.isAlpha(name)) {
    throw Error("Real name not valid");
  }
  if (surname && !validator.isAlpha(surname)) {
    throw Error("Real surname not valid");
  }
  if (
    birthday &&
    !validator.isDate(new Date(birthday).toISOString().split("T")[0])
  ) {
    throw Error("Date not valid");
  }
  if (!mongoose.isValidObjectId(profilePicID)) {
    throw Error("Couldn't load Profile Pic");
  }
  if (!mongoose.isValidObjectId(_id)) {
    throw Error("Object ID not valid");
  }

  const newData = {
    username,
    name,
    surname,
    birthday,
    profilePic: profilePicID,
  };

  return await User.findByIdAndUpdate(_id, { ...newData }, { new: true });
}

async function updateAccount(currPassword, newPassword, confirmPassword, _id) {
  const user = await User.findById(_id);

  if (user.password !== currPassword) {
    throw Error("Current Password not valid");
  }

  if (newPassword !== confirmPassword) {
    throw Error("New Passwords don't match");
  }

  user.password = newPassword;

  return await User.findByIdAndUpdate(_id, { ...user }, { new: true });
}

module.exports = { User, validateLogin, validateSignup, updateProfile, updateAccount };
