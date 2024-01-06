const jwt = require("jsonwebtoken");
const secretKey = process.env.SECRET_KEY;

exports.authenticateJWT = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  jwt.verify(token.split(" ")[1], secretKey, (err, user) => {
    if (err) {
      console.error("JWT verification error:", err);
      return res.status(403).json({ error: "Forbidden" });
    }

    req.user = user;
    next();
  });
};

exports.verifyJWT = async (token) => {
  return jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return err.message;
    } else {
      return decoded;
    }
  });
};
