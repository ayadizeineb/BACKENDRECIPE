module.exports = (req, res, next) => {
  // This middleware assumes verifyToken has already attached `req.user`
  // It can be extended for additional checks (e.g., role validation)
  next();

};

