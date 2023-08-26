const express = require("express");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");

const app = express();
dotenv.config();
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("hello api");
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on PORT ${process.env.PORT}`);
});
