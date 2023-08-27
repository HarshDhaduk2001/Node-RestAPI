const { Order } = require("../models/order");
const { OrderItem } = require("../models/order-item");
const express = require("express");
const router = express();

router.get(`/`, async (req, res) => {
  try {
    const orderList = await Order.find()
      .populate("user", "name")
      .sort({ dateOrdered: -1 });

    if (!orderList) {
      res
        .status(500)
        .json({ success: false, message: "Internal server error." });
    }
    res.status(200).json({
      data: orderList,
      success: true,
      message: "Orders found successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching orders.",
    });
  }
});

router.get(`/:id`, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name")
      .populate({
        path: "orderItems",
        populate: {
          path: "product",
          populate: "category",
        },
      });

    if (!order) {
      res.status(500).json({
        success: false,
        message: "The order with the given ID was not found.",
      });
    }
    res.status(200).json({
      data: order,
      success: true,
      message: "Order find successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching the order.",
    });
  }
});

router.post(`/`, async (req, res) => {
  const orderItemsIds = Promise.all(
    req.body.orderItems.map(async (orderItem) => {
      let newOrderItem = new OrderItem({
        quantity: orderItem.quantity,
        product: orderItem.product,
      });

      newOrderItem = await newOrderItem.save();

      return newOrderItem._id;
    })
  );
  const orderItemsIdsResolved = await orderItemsIds;

  const totalPrices = await Promise.all(
    orderItemsIdsResolved.map(async (orderItemId) => {
      const orderItem = await OrderItem.findById(orderItemId).populate(
        "product",
        "price"
      );
      const totalPrice = orderItem.product.price * orderItem.quantity;
      return totalPrice;
    })
  );

  const totalPrice = totalPrices.reduce((a, b) => a + b, 0);

  try {
    let order = new Order({
      orderItems: orderItemsIdsResolved,
      shippingAddress1: req.body.shippingAddress1,
      shippingAddress2: req.body.shippingAddress2,
      city: req.body.city,
      zip: req.body.zip,
      country: req.body.country,
      phone: req.body.phone,
      status: req.body.status,
      totalPrice: totalPrice,
      user: req.body.user,
    });

    order = await order.save();

    if (!order)
      return res.status(500).json({
        success: false,
        message: "Order cannot be created please try again.",
      });

    res.status(200).json({
      data: order,
      success: true,
      message: "your order saved successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while creating the order.",
    });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        status: req.body.status,
      },
      { new: true }
    );

    if (!order)
      return res
        .status(400)
        .json({ success: false, message: "Order cannot be update." });

    res.status(200).json({
      data: order,
      success: true,
      message: "Order updated successfully.",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the product.",
    });
  }
});

router.delete("/:id", (req, res) => {
  Order.findByIdAndRemove(req.params.id)
    .then(async (order) => {
      if (order) {
        await order.orderItems.map(async (orderItem) => {
          await OrderItem.findByIdAndRemove(orderItem);
        });
        return res
          .status(200)
          .json({ success: true, message: "Order deleted successfully." });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "Order not found." });
      }
    })
    .catch((err) => {
      return res.status(500).json({
        success: false,
        message: "An error occurred while deleting the product.",
      });
    });
});

router.get("/get/totalsales", async (req, res) => {
  try {
    const totalSales = await Order.aggregate([
      { $group: { _id: null, totalsales: { $sum: "$totalPrice" } } },
    ]);

    if (!totalSales) {
      return res
        .status(400)
        .json({ success: false, message: "Order sales cannot be generated" });
    }

    res.status(200).json({
      data: totalSales.pop().totalsales,
      success: true,
      message: "Totalsales get successfully.",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the product.",
    });
  }
});

router.get(`/get/count`, async (req, res) => {
  try {
    const orderCount = await Order.countDocuments();

    if (!orderCount) {
      res.status(500).json({ success: false });
    }
    res.status(200).json({
      data: orderCount,
      success: true,
      message: "Order counted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while counting the order.",
    });
  }
});

router.get(`/get/userorders/:userid`, async (req, res) => {
  try {
    const userOrderList = await Order.find({ user: req.params.userid })
      .populate({
        path: "orderItems",
        populate: {
          path: "product",
          populate: "category",
        },
      })
      .sort({ dateOrdered: -1 });

    if (!userOrderList) {
      res.status(500).json({ success: false });
    }
    res.status(200).json({
      data: userOrderList,
      success: true,
      message: "User order found successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching user order.",
    });
  }
});

module.exports = router;
