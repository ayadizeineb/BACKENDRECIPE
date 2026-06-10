const jwt = require("jsonwebtoken");
require('dotenv').config();

const verifyToken = (req, res, next) => {
    let token = req.header("Authorization");
    if (!token) return res.status(401).json({ msg: "No token, authorization denied" });

    // Handle Bearer token format if present
    if (token.startsWith("Bearer ")) {
        token = token.slice(7).trim();
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        req.user = decoded; // contains { id: userId, exp, iat }
        next();
      } catch (err) {
        if (err.name === 'TokenExpiredError') {
          console.error('Token expired:', err.message);
          return res.status(401).json({ msg: "Token has expired, please log in again" });
        }
        console.error('Token verification error:', err.message);
        res.status(401).json({ msg: "Token is not valid" });
      }
}

module.exports = verifyToken;
