const Product = require("../models/productModel");

const getAllProducts = async (req, res) => {
  const { company, name, featured, sort, select } = req.query;
  const queryObj = {};
  if (company) {
    queryObj.company = company;
  }

  if (name) {
    queryObj.name = { $regex: name, $options: "i" };
  }

  if (featured) {
    queryObj.featured = featured;
  }

  let apiData = Product.find(queryObj);

  if (sort) {
    let sortFix = sort.replace(",", " ");
    apiData = apiData.sort(sortFix);
  }

  if (select) {
    let selectFix = select.split(",").join(" ");
    apiData = apiData.select(selectFix);
  }

  let page = Number(req.query.page) || 1;
  let limit = Number(req.query.limit) || 5;
  let skip = (page - 1) * limit;

  apiData = apiData.skip(skip).limit(limit);

  const productData = await apiData;
  res.status(200).json({ message: "All Product Data.", productData });
};

module.exports = { getAllProducts };
