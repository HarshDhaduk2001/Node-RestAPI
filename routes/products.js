const { Product } = require("../models/product");
const express = require("express");
const router = express();
const { Category } = require("../models/category");

router.get(`/`, async (req, res) => {
  try {
    let filter = {};
    if (req.query.categories) {
      filter = { category: req.query.categories.split(",") };
    }

    const productList = await Product.find(filter).populate("category");

    if (!productList) {
      res
        .status(500)
        .json({ success: false, message: "Internal server error." });
    }
    res.status(200).json({
      data: productList,
      success: true,
      message: "Products find successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching the products.",
    });
  }
});

router.get(`/:id`, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("category");

    if (!product) {
      res
        .status(500)
        .json({ success: false, message: "Internal server error." });
    }
    res.status(200).json({
      data: product,
      success: true,
      message: "Product find successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching the product.",
    });
  }
});

router.post(`/`, async (req, res) => {
  try {
    let category = await Category.findById(req.body.category);
    if (!category)
      return res
        .status(400)
        .json({ success: false, message: "Invalid Category" });
    else {
      try {
        let product = new Product({
          name: req.body.name,
          description: req.body.description,
          richDescription: req.body.richDescription,
          image: req.body.image,
          brand: req.body.brand,
          price: req.body.price,
          category: req.body.category,
          countInStock: req.body.countInStock,
          rating: req.body.rating,
          numReviews: req.body.numReviews,
          isFeatured: req.body.isFeatured,
        });

        product = await product.save();

        if (!product)
          return res
            .status(500)
            .json({ success: false, message: "Product cannot be created" });
        res.status(200).json({
          data: product,
          success: true,
          message: "Product created successfully.",
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "An error occurred while creating the product.",
        });
      }
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while matching category.",
    });
  }
});

router.put("/:id", async (req, res) => {
  try {
    let category = await Category.findById(req.body.category);
    if (!category)
      return res
        .status(400)
        .json({ success: false, message: "Invalid Category" });
    else {
      try {
        const product = await Product.findByIdAndUpdate(
          req.params.id,
          {
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            image: req.body.image,
            brand: req.body.brand,
            price: req.body.price,
            category: req.body.category,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            numReviews: req.body.numReviews,
            isFeatured: req.body.isFeatured,
          },
          { new: true }
        );

        if (!product)
          return res
            .status(500)
            .json({ success: false, message: "Product cannot be updated." });
        res.status(200).json({
          data: product,
          success: true,
          message: "Products updated successfully.",
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "An error occurred while updating the product.",
        });
      }
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while matching category.",
    });
  }
});

router.delete("/:id", (req, res) => {
  Product.findByIdAndRemove(req.params.id)
    .then((product) => {
      if (product) {
        return res
          .status(200)
          .json({ success: true, message: "Product deleted successfully." });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "Product not found!" });
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
    let productCount = await Product.countDocuments();

    res.status(200).json({
      data: productCount,
      success: true,
      message: "Products counted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while counting the products.",
    });
  }
});

router.get(`/get/featured/:count?`, async (req, res) => {
  try {
    const count = req.params.count ? req.params.count : 0;
    const products = await Product.find({ isFeatured: true }).limit(+count);

    if (!products) {
      res
        .status(500)
        .json({ success: false, message: "Product not found with featured." });
    }

    res.status(200).json({
      data: products,
      success: true,
      message: "Products find successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while counting the products.",
    });
  }
});

module.exports = router;
