const express = require("express");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");

const app = express();
dotenv.config();
app.use(bodyParser.urlencoded({ extended: true }));

const productsRoute = require("./routes/productsRoute");

const mongoose = require("mongoose");
mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true });

// middelware
app.use("/api/products", productsRoute);

app.listen(process.env.PORT, () => {
  console.log(`Server running on PORT ${process.env.PORT}`);
});
