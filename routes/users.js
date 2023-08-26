const { User } = require("../models/user");
const express = require("express");
const router = express();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

router.get(`/`, async (req, res) => {
  try {
    const userList = await User.find().select("-passwordHash");

    if (!userList) {
      res
        .status(500)
        .json({ success: false, message: "Internal server error." });
    }
    res.status(200).json({
      data: userList,
      success: true,
      message: "User find successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching users.",
    });
  }
});

router.get(`/:id`, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-passwordHash");

    if (!user) {
      res.status(500).json({
        success: false,
        message: "The user with the given ID was not found.",
      });
    }
    res.status(200).json({
      data: user,
      success: true,
      message: "User find successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching the user.",
    });
  }
});

router.post(`/`, async (req, res) => {
  try {
    let user = new User({
      name: req.body.name,
      email: req.body.email,
      passwordHash: bcrypt.hashSync(req.body.password, 10),
      phone: req.body.phone,
      isAdmin: req.body.isAdmin,
      street: req.body.street,
      apartment: req.body.apartment,
      zip: req.body.zip,
      city: req.body.city,
      country: req.body.country,
    });

    user = await user.save();

    if (!user)
      return res
        .status(500)
        .json({ success: false, message: "User cannot be created." });

    res.status(200).json({
      data: user,
      success: true,
      message: "User created successfully.",
    });
  } catch (error) {
    console.error("Error creating user:", error); // Log the actual error
    res.status(500).json({
      success: false,
      message: "An error occurred while creating the user.",
    });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const userExist = await User.findById(req.params.id);
    let newPassword;
    if (req.body.password) {
      newPassword = bcrypt.hashSync(req.body.password, 10);
    } else {
      newPassword = userExist.passwordHash;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        email: req.body.email,
        passwordHash: newPassword,
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country,
      },
      { new: true }
    );

    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "User cannot be update." });

    res
      .status(200)
      .json({
        data: user,
        success: true,
        message: "User updated successfully.",
      });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while creating the user.",
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    const secret = process.env.secret;
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found." });
    }

    if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
      const token = jwt.sign(
        {
          userId: user.id,
          isAdmin: user.isAdmin,
        },
        secret,
        { expiresIn: "1d" }
      );

      res.status(200).json({
        data: { user: user.email, token: token },
        success: true,
        message: "Login successfully",
      });
    } else {
      res.status(400).json({ success: false, message: "Invelid credentials." });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while creating the user.",
    });
  }
});

router.post("/register", async (req, res) => {
  try {
    let user = new User({
      name: req.body.name,
      email: req.body.email,
      passwordHash: bcrypt.hashSync(req.body.password, 10),
      phone: req.body.phone,
      isAdmin: req.body.isAdmin,
      street: req.body.street,
      apartment: req.body.apartment,
      zip: req.body.zip,
      city: req.body.city,
      country: req.body.country,
    });
    user = await user.save();

    if (!user) return res.status(400).send("User cannot be created!");

    res.status(200).json({
      data: user,
      success: true,
      message: "User created successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while creating the user.",
    });
  }
});

router.delete("/:id", (req, res) => {
  User.findByIdAndRemove(req.params.id)
    .then((user) => {
      if (user) {
        return res
          .status(200)
          .json({ success: true, message: "User deleted successfully" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "User not found!" });
      }
    })
    .catch((err) => {
      return res.status(500).json({
        success: false,
        message: "An error occurred while deleting the product.",
      });
    });
});

router.get(`/get/count`, async (req, res) => {
  try {
    let userCount = await User.countDocuments();

    if (!userCount) {
      res.status(500).json({ success: false, message: "Data not found." });
    }

    res.status(200).json({
      data: userCount,
      success: true,
      message: "User counted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while counting the user.",
    });
  }
});

module.exports = router;
