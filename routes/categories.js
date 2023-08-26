const { Category } = require("../models/category");
const express = require("express");
const router = express();
const mongoose = require("mongoose");

router.get(`/`, async (req, res) => {
  try {
    const categoriesList = await Category.find();

    if (!categoriesList) {
      res
        .status(500)
        .json({ success: false, message: "Internal server error." });
    }
    res.status(200).json({
      data: categoriesList,
      success: true,
      message: "Categories find successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching the categories.",
    });
  }
});

router.get(`/:id`, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      res
        .status(500)
        .json({ success: false, message: "Internal server error." });
    }
    res.status(200).json({
      data: category,
      success: true,
      message: "Category find successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching the category.",
    });
  }
});

router.post(`/`, async (req, res) => {
  try {
    let category = new Category({
      name: req.body.name,
      icon: req.body.icon,
      color: req.body.color,
    });

    category = await category.save();

    if (!category)
      return res
        .status(500)
        .json({ success: false, message: "Category cannot be created" });
    res.status(200).json({
      data: category,
      success: true,
      message: "Category created successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while creating the category.",
    });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        icon: req.body.icon || category.icon,
        color: req.body.color,
      },
      { new: true }
    );

    if (!category)
      return res
        .status(500)
        .json({ success: false, message: "Category cannot be updated." });
    res.status(200).json({
      data: category,
      success: true,
      message: "Category updated successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while updating the category.",
    });
  }
});

router.delete("/:id", (req, res) => {
  Category.findByIdAndRemove(req.params.id)
    .then((category) => {
      if (category) {
        return res
          .status(200)
          .status(200)
          .json({ success: true, message: "Category deleted successfully." });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "Category not found!" });
      }
    })
    .catch((err) => {
      return res.status(500).json({
        success: false,
        message: "An error occurred while deleting the category.",
      });
    });
});

module.exports = router;
