// middleware/errorHandler.js
module.exports = (err, req, res, next) => {
  console.error('Unhandled error:', err);
  const status = err.statusCode || 500;
  res.status(status).json({
    message: err.message || 'Internal Server Error'
    // In production you might omit stack traces
    // stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};
