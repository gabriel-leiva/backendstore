require("dotenv").config();

const express = require("express");
const { engine } = require("express-handlebars");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

const productsRouter = require("./routes/products.router");
const cartsRouter = require("./routes/carts.router");
const viewsRouter = require("./routes/views.router");
const connectDatabase = require("./config/database");

const app = express();
const PORT = 8080;

const httpServer = http.createServer(app);
const io = new Server(httpServer);

app.set("io", io);

app.use(express.json());

app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

app.use("/", viewsRouter);
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);

app.get("/home", (req, res) => {
  res.render("home", {
    title: "Backend Store",
    message: "Bienvenido a Backend Store"
  });
});

io.on("connection", (socket) => {
  console.log("Nuevo cliente conectado:", socket.id);

  socket.on("disconnect", () => {
    console.log("Cliente desconectado:", socket.id);
  });
});

// Middleware para rutas inexistentes
app.use((req, res) => {
  res.status(404).json({
    error: "Ruta no encontrada"
  });
});

// Middleware general de errores
app.use((error, req, res, next) => {
  console.error("Error no controlado:", error);

  res.status(500).json({
    error: "Error interno del servidor"
  });
});

const startServer = async () => {
  try {
    await connectDatabase();

    httpServer.listen(PORT, () => {
      console.log(`Servidor funcionando en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(
      "No se pudo iniciar la aplicación:",
      error.message
    );

    process.exit(1);
  }
};

startServer();