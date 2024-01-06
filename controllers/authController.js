const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
require("dotenv").config();
const secretKey = process.env.SECRET_KEY;

const handleError = (res, statusCode, errorMessage) => {
  return res
    .status(statusCode)
    .json({ status: "failure", error: errorMessage });
};

exports.register = (req, res) => {
  const { name, email, password } = req.body;

  db.query(
    "SELECT email FROM users WHERE email = ?",
    [email],
    async (err, results) => {
      if (err) {
        return handleError(res, 500, "Internal Server Error");
      }

      if (results.length > 0) {
        return res
          .status(200)
          .json({ status: "success", message: "User already exist." });
      }

      let hashedPassword = await bcrypt.hash(password, 10);
      db.query(
        "INSERT INTO users SET ?",
        {
          name,
          email,
          password: hashedPassword,
        },
        (err, results) => {
          if (err) {
            return handleError(res, 500, "Internal Server Error");
          } else {
            res.status(200).json({
              status: "success",
              message: "User registered successfully.",
            });
          }
        }
      );
    }
  );
};

exports.login = (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM users WHERE email = ?", [email], (error, results) => {
    if (error) {
      handleError(res, 500, "Internal Server Error");
    }

    if (results.length === 0) {
      return handleError(res, 401, "User does not exist.");
    }

    const user = results[0];

    bcrypt.compare(password, user.password, (bcryptError, passwordMatch) => {
      if (bcryptError) {
        return res
          .status(500)
          .json({ status: "failure", error: "Internal Server Error" });
      }

      if (!passwordMatch) {
        return handleError(res, 402, "Invalid credentials");
      }
      const token = jwt.sign({ id: user.id, email: user.email }, secretKey, {
        expiresIn: "1d",
      });
      res
        .status(200)
        .json({ status: "success", message: "Login successful", token });
    });
  });
};
