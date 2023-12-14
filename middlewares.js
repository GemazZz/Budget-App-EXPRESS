require("dotenv").config();
const jwt = require("jsonwebtoken");

const authorization = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) {
    return res.status(401).json({ err: "Unauthorized" });
  }
  jwt.verify(token, process.env.secretKey, (err, user) => {
    if (err) {
      return res.status(403).json({ err: "Forbidden" });
    }

    req.user = user;
    next();
  });
};

module.exports = authorization;
