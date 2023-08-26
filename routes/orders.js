const { Order } = require("../models/order");
const express = require("express");
const router = express();
const mongoose = require("mongoose");

router.get(`/`, async (req, res) => {
  const orderList = await Order.find();

  if (!orderList) {
    res.status(500).json({ success: false, message: "Internal server error." });
  }
  res.status(200).json({
    data: orderList,
    success: true,
    message: "Orders find successfully.",
  });
});

module.exports = router;
