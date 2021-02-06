const express = require("express");
const route = express.Router();
const User = require("../../models/User");
const auth = require("../../middleware/auth");
const config = require("config");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult, check } = require("express-validator");

// Route        GET api/Auth
// access       Autho
route.get("/", auth, async (req, res) => {
  const result = await User.findById(req.user.id).select("-password");
  return res.status(200).json(result);
});

// Route        POST api/auth
// access       Public
// Purpose      To login
route.post(
  "/",
  [
    check("email", "Invalid Credentials").exists().isEmail(),
    check("password", "Invalid Credentials").exists(),
  ],
  async (req, res) => {
    const errors = await validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      let { email, password } = req.body;
      // if the user exists
      let user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid Credentials" }] });
      }

      const passIsMatch = await bcrypt.compare(password, user.password);
      if (!passIsMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid Credentials" }] });
      }

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
