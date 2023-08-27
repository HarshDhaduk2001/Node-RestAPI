const { Product } = require("../models/product");
const express = require("express");
const router = express();
const { Category } = require("../models/category");
const multer = require("multer");

const FILE_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error("invalid image type");

    if (isValid) {
      uploadError = null;
    }
    cb(uploadError, "public/uploads");
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.split(" ").join("-");
    const extension = FILE_TYPE_MAP[file.mimetype];
    cb(null, `${fileName}-${Date.now()}.${extension}`);
  },
});

const uploadOptions = multer({ storage: storage });

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

router.post(`/`, uploadOptions.single("image"), async (req, res) => {
  try {
    let category = await Category.findById(req.body.category);
    if (!category)
      return res
        .status(400)
        .json({ success: false, message: "Invalid Category" });
    else {
      const file = req.file;
      if (!file) return res.status(400).send("No image in the request");

      const fileName = file.filename;
      const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
      try {
        let product = new Product({
          name: req.body.name,
          description: req.body.description,
          richDescription: req.body.richDescription,
          image: `${basePath}${fileName}`,
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

router.put(
  "/gallery-images/:id",
  uploadOptions.array("images", 10),
  async (req, res) => {
    try {
      const files = req.files;
      let imagesPaths = [];
      const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;

      if (files) {
        files.map((file) => {
          imagesPaths.push(`${basePath}${file.filename}`);
        });
      }

      const product = await Product.findByIdAndUpdate(
        req.params.id,
        {
          images: imagesPaths,
        },
        { new: true }
      );

      if (!product)
        return res
          .status(500)
          .json({ success: false, message: "Gallery cannot be updated!" });

      res.status(200).json({
        data: product,
        success: true,
        message: "Gallery updated successfully.",
      });
    } catch {
      res.status(500).json({
        success: false,
        message: "An error occurred while updating gallery.",
      });
    }
  }
);

module.exports = router;
