const path = require("node:path");
const express = require("express");
const dotenv = require("dotenv");
const { engine } = require("express-handlebars");

const productsRouter = require("./routes/products.router");
const cartsRouter = require("./routes/carts.router");
const viewsRouter = require("./routes/views.router");
const errorHandler = require("./middleware/errorHandler");
const connectDatabase = require("./config/database");
const http = require("node:http");

dotenv.config();
const {initializeSocket} = require("./config/socket");

const app = express();
const httpServer = http.createServer(app);
const PORT = process.env.PORT;

app.engine(
  "handlebars",
  engine({
    defaultLayout: "main",
  })
);

app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

app.use("/", viewsRouter);
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);

app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

app.use(errorHandler);

async function startServer() {
  try {
    await connectDatabase();

    initializeSocket(httpServer);

    httpServer.listen(PORT, () => {
      console.log(
        `Server running at http://localhost:${PORT}`
      );
    });
  } catch (error) {
    console.error(
      "Application could not start:",
      error.message
    );

    process.exit(1);
  }
}

startServer();

module.exports = app, httpServer;