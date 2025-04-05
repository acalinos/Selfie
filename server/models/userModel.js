const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");
const { getDefaultPic } = require("../controllers/mediaController");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true, // gli username sono richiesti e devono essere unici
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

/**
 * Throws an error when one of the parameters is either undefined or not valid
 * @param {String} username 
 * @param {String} password 
 * @param {String} name 
 * @param {String} surname 
 * @param {String} birthday 
 */
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
    console.log(birthday);
    throw Error("Date of Birth not valid");
  }
}

// signup validation
async function validateSignup(
  username,
  password,
  name,
  surname,
  birthday
) {

  validation(username, password, name, surname, birthday);

  // check if username already exists
  const exists = await User.findOne({ username });

  if (exists) {
    throw Error("Username already in use");
  }

  // aggiungere sale qb(10 caratteri)
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  const user = await User.create({
    username,
    password: hash,
    name,
    surname,
    profilePic: await getDefaultPic(),
    birthday,
    pushSubscriptions: [],
  });

  return user;
}

// login data validation
async function validateLogin(username, password) {
  // validation
  if (!username || !password) {
    throw Error("All required fields must be filled");
  }

  const user = await User.findOne({ username });

  if (!user) {
    throw Error("Invalid Username or Password");
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    throw Error("Invalid Username or Password");
  }

  return user;
}

// updates a single User
async function updateProfile(
  username,
  name,
  surname,
  birthday,
  profilePic,
  _id
) {
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
    console.log(birthday);
    throw Error("Date not valid");
  }
  if (!mongoose.isValidObjectId(profilePicID)) {
    throw Error("Couldn't load Profile Pic");
  }
  if (!mongoose.isValidObjectId(_id)) {
    throw Error("Object ID not valid");
  }

  console.log({ username, name, surname, birthday, profilePicID });

  // Find the user, then update single fields one by one
  const user = await User.findById(_id);

  const newData = {
    username: username,
    name: name,
    surname: surname,
    birthday: birthday,
    profilePic: profilePicID,
  }

  return await User.findByIdAndUpdate(_id, { ...newData }, { new: true });
}

async function updateAccount(currPassword, newPassword, confirmPassword, _id) {
  const user = await User.findById(_id);

  const match = await bcrypt.compare(currPassword, user.password);

  if (!match)
    throw Error("Current Password not valid");

  if (newPassword !== confirmPassword)
    throw Error("New Passwords don't match");

  // aggiungere sale qb(10 caratteri)
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(newPassword, salt);

  user.password = hash;

  return await User.findByIdAndUpdate(_id, { ...user }, { new: true });
}

module.exports = { User, validateLogin, validateSignup, updateProfile, updateAccount };
