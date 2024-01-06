const express = require("express");
const dotenv = require("dotenv");
const db = require("./config/db");

dotenv.config({ path: "./.env" });

const app = express();

db.connect((error) => {
  if (error) {
    console.log(error);
  } else {
    console.log("MYSQL Connected...");
  }
});

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
// Routes
app.use("/auth", require("./routes/authRoute"));
app.use("/project", require("./routes/projectRoute"));

app.get("/", (req, res) => {
  res.send("Hello");
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port: ${process.env.PORT}`);
});
