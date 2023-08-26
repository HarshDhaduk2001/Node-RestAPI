const express = require("express");
const router = express();

const { getAllProducts } = require("../controllers/productsController");

router.get("/", getAllProducts);

module.exports = router;
