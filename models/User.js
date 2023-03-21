const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    username:{
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
    },
    mobileNo: {
      type: Number,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      validator(value) {
        if (value.length < 6) {
          throw new Error("Password must be greater than 6 characters");
        }
      },
    },
    cpassword: {
      type: String,
      required: true,
      validator(value) {
        if (value.length < 6) {
          throw new Error("Password must be greater than 6 characters");
        }
      },
    },
    img: {
      type: String,
    },
    
    status:{
      type: String,
      required: true,
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// we are hashing the password
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
    this.cpassword = await bcrypt.hash(this.cpassword, 12);
  }
  next();
});

// we are generating the token
userSchema.methods.generateAuthToken = async function (next) {
  try {
    let token = jwt.sign({ _id: this._id }, process.env.SECRET_KEY);
    this.tokens = this.tokens.concat({ token: token });
    await this.save();
    return token;
  } catch (err) {
    return next(err);
  }
};

// we are storing the message
const User = mongoose.model("USER", userSchema);

module.exports = User;
