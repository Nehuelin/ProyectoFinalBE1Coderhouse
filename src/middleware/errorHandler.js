function errorHandler(error, req, res, next) {
  console.error(error);

  if (res.headersSent) {
    return next(error);
  }

  // Código duplicado en un índice unique de MongoDB
  if (error.code === 11000) {
    const duplicatedField =
      Object.keys(error.keyPattern || {})[0] || "field";

    return res.status(409).json({
      status: "error",
      message: `A product with that ${duplicatedField} already exists`,
    });
  }

  // Errores de validación generados por Mongoose
  if (error.name === "ValidationError") {
    const messages = Object.values(error.errors).map(
      (validationError) => validationError.message
    );

    return res.status(400).json({
      status: "error",
      message: "Product validation failed",
      errors: messages,
    });
  }

  // Valores que Mongoose no puede convertir al tipo esperado
  if (error.name === "CastError") {
    return res.status(400).json({
      status: "error",
      message: `Invalid value for field "${error.path}"`,
    });
  }

  const statusCode =
    error.statusCode || error.status || 500;

  return res.status(statusCode).json({
    status: "error",
    message:
      statusCode === 500
        ? "Internal server error"
        : error.message,
  });
}

module.exports = errorHandler;