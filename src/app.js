const path = require("node:path");
const express = require("express");
const dotenv = require("dotenv");

const productsRouter = require("./routes/products.router");
const cartsRouter = require("./routes/carts.router");
const viewsRouter = require("./routes/views.router");
const errorHandler = require("./middleware/errorHandler");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middlewares generales
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Archivos públicos: CSS, JavaScript e imágenes
app.use(express.static(path.join(__dirname, "public")));

// Rutas
app.use("/", viewsRouter);
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);

// Ruta no encontrada
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// Middleware central de errores
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

module.exports = app;