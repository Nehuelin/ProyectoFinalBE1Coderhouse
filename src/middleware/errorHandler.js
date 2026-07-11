function errorHandler(error, req, res, next) {
  console.error(error);

  if (res.headersSent) {
    return next(error);
  }

  const statusCode = error.statusCode || error.status || 500;

  return res.status(statusCode).json({
    status: "error",
    message:
      statusCode === 500
        ? "Internal server error"
        : error.message,
  });
}

module.exports = errorHandler;