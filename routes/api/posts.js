const express = require("express");
const route = express.Router();

// Route        GET api/Posts
// access       Public
route.get("/", (req, res) => {
  res.send("Posts API");
});

module.exports = route;
