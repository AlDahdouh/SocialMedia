const express = require("express");
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");
const config = require("config");
const route = express.Router();
const { check, validationResult } = require("express-validator");

// Route        POST api/users
// FOR          to create new users
// access       Public
route.post(
  "/",
  [
    check("name", "Name is required").not().isEmpty(),
    check("email", "Enter a valid email").isEmail(),
    check(
      "password",
      "Please enter a password with 6 or more characters"
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      let { name, email, password } = req.body;
      // if the user exists
      let user = await User.findOne({ email });
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "User already exits" }] });
      }
      // get the avatar
      const avatar = await gravatar.url(email, {
        s: "200",
        r: "pg",
        d: "mm",
      });
      // hash the password
      const salt = await bcrypt.genSalt(10);
      password = await bcrypt.hash(password, salt);

      user = new User({ name, email, password, avatar });
      await user.save();

      const payload = {
        user: {
          id: user.id,
        },
      };
      const token = await jwt.sign(payload, config.get("SecretKey"), {
        expiresIn: "1d",
      });
      return res.json({ token });
    } catch (err) {
      console.log(err.message);
      return res.status(500).send(err.message);
    }
  }
);

module.exports = route;
