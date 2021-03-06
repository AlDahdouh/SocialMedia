const express = require("express");
const route = express.Router();
const auth = require("../../middleware/auth");
const Profile = require("../../models/Profile");
const User = require("../../models/User");
const Post = require("../../models/Post");
const normalize = require("normalize-url");
const request = require("request");
const config = require("config");
const { check, validationResult } = require("express-validator");

// Route        GET api/profile/me
// access       Private
route.get("/me", auth, async (req, res) => {
  const userId = req.user.id;
  try {
    const profile = await Profile.findOne({ user: userId }).populate("user", [
      "name",
      "avatar",
    ]);
    if (!profile) {
      return res
        .status(401)
        .json({ errors: [{ msg: "Profile does not exist" }] });
    }

    return res.status(200).json(profile);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ errors: [{ msg: "Server error!" }] });
  }
});

// @route    POST api/profile
// @desc     Create or update user profile
// @access   Private
route.post(
  "/",
  auth,
  check("status", "Status is required").notEmpty(),
  check("skills", "Skills is required").notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // destructure the request
    const {
      website,
      skills,
      youtube,
      twitter,
      instagram,
      linkedin,
      facebook,
      // spread the rest of the fields we don't need to check
      ...rest
    } = req.body;

    // build a profile
    const profileFields = {
      user: req.user.id,
      website:
        website && website !== ""
          ? normalize(website, { forceHttps: true })
          : "",
      skills: Array.isArray(skills)
        ? skills
        : skills.split(",").map((skill) => " " + skill.trim()),
      ...rest,
    };

    // Build socialFields object
    const socialFields = { youtube, twitter, instagram, linkedin, facebook };

    // normalize social fields to ensure valid url
    for (const [key, value] of Object.entries(socialFields)) {
      if (value && value.length > 0)
        socialFields[key] = normalize(value, { forceHttps: true });
    }
    // add to profileFields
    profileFields.social = socialFields;

    try {
      // Using upsert option (creates new doc if no match is found):
      let profile = await Profile.findOneAndUpdate(
        { user: req.user.id },
        { $set: profileFields },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
      return res.json(profile);
    } catch (err) {
      console.error(err.message);
      return res.status(500).send("Server Error");
    }
  }
);

// @route    GET api/profile
// @desc     Get all profiles
// @access   Public
route.get("/", async (req, res) => {
  try {
    const profiles = await Profile.find({}).populate("user", [
      "name",
      "avatar",
    ]);
    res.status(200).json(profiles);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ errors: [{ msg: "Server Error" }] });
  }
});

// @route    GET api/profile/user/:user_id
// @desc     Get a profile by user ID
// @access   Public
route.get("/user/:user_id", async (req, res) => {
  try {
    const userID = req.params.user_id;
    const profile = await Profile.findOne({ user: userID }).populate("user", [
      "name",
      "avatar",
    ]);
    if (!profile) {
      return res.status(401).json({ errors: [{ msg: "Profile not found" }] });
    }
    res.status(200).json(profile);
  } catch (err) {
    console.error(err.message);
    if (err.kind == "ObjectId") {
      return res.status(401).json({ errors: [{ msg: "Profile not found" }] });
    }
    res.status(500).json({ errors: [{ msg: "Server Error" }] });
  }
});

// @route    DELETE api/profile
// @desc     Delete a profile by user ID
// @access   Private
route.delete("/", auth, async (req, res) => {
  try {
    const userID = req.user.id;
    await Post.deleteMany({ user: userID });
    await Profile.findOneAndDelete({ user: userID });
    await User.findByIdAndDelete(userID);

    return res.status(200).json({ msg: "Profile deleted" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ errors: [{ msg: "Server Error" }] });
  }
});

// @route    PUT api/profile/experience
// @desc     Update a profile experience
// @access   Private
route.put(
  "/experience",
  [
    auth,
    [
      check("title", "Title is required").not().isEmpty(),
      check("company", "Company is required").not().isEmpty(),
      check("from", "From date is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const profile = await Profile.findOne({ user: req.user.id });
      if (!profile) {
        return res.status(400).json({ errors: [{ msg: "Profile not found" }] });
      }
      const {
        title,
        company,
        location,
        from,
        to,
        current,
        description,
      } = req.body;
      const newExp = {
        title,
        company,
        location,
        from,
        to,
        current,
        description,
      };
      profile.experience.unshift(newExp);
      await profile.save();
      return res.status(200).json(profile);
    } catch (err) {
      console.error(err.message);
      return res.status(500).json({ errors: [{ msg: "Server Error" }] });
    }
  }
);

// @route    DELETE api/profile/experience/:exp_id
// @desc     Delete experience from a profile
// @access   Private
route.delete("/experience/:exp_id", auth, async (req, res) => {
  try {
    const expId = req.params.exp_id;
    const profile = await Profile.findOne({ user: req.user.id });
    const newExperience = profile.experience.filter((item) => item.id != expId);
    profile.experience = newExperience;
    await profile.save();
    return res.status(200).json(profile);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ errors: [{ msg: "Server Error" }] });
  }
});

// @route    PUT api/profile/education
// @desc     Update a profile education
// @access   Private
route.put(
  "/education",
  [
    auth,
    [
      check("school", "School is required").not().isEmpty(),
      check("degree", "Degree is required").not().isEmpty(),
      check("fieldofstudy", "Field of Study is required").not().isEmpty(),
      check("from", "From date is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const profile = await Profile.findOne({ user: req.user.id });
      if (!profile) {
        return res.status(400).json({ errors: [{ msg: "Profile not found" }] });
      }
      const {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description,
      } = req.body;
      const newEdu = {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description,
      };
      profile.education.unshift(newEdu);
      await profile.save();
      return res.status(200).json(profile);
    } catch (err) {
      console.error(err.message);
      return res.status(500).json({ errors: [{ msg: "Server Error" }] });
    }
  }
);

// @route    DELETE api/profile/education/:edu_id
// @desc     Delete education from a profile
// @access   Private
route.delete("/education/:edu_id", auth, async (req, res) => {
  try {
    const eduId = req.params.edu_id;
    const profile = await Profile.findOne({ user: req.user.id });
    const newEducation = profile.education.filter((item) => item.id != eduId);
    profile.education = newEducation;
    await profile.save();
    return res.status(200).json(profile);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ errors: [{ msg: "Server Error" }] });
  }
});

// @route    GET api/profile/github/:username
// @desc     Get github repos for a given username
// @access   Public
route.get("/github/:username", async (req, res) => {
  try {
    const option = {
      uri: `https://api.github.com/users/${
        req.params.username
      }/repos?per_page=5&sort=created:asc&client_id=${config.get(
        "gitHubClientId"
      )}&client_secret=${config.get("gitHubSecretKey")}`,
      method: "GET",
      headers: { "user-agent": "node.js" },
    };

    request(option, (error, response, body) => {
      if (error) {
        console.error(error);
      }
      if (response.statusCode !== 200) {
        return res.status(404).json({ msg: "No GitHub profile found" });
      }
      return res.json(JSON.parse(body));
    });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ errors: [{ msg: "Server Error" }] });
  }
});
module.exports = route;
