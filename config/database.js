const mongoose = require("mongoose");

const connectDatabase = async () => {
  if (!process.env.MONGO_URL) {
    throw new Error("Falta la variable MONGO_URL en el archivo .env");
  }

  console.log("Intentando conectar a MongoDB...");

  await mongoose.connect(process.env.MONGO_URL, {
    serverSelectionTimeoutMS: 5000
  });

  console.log("MongoDB conectado correctamente");
  console.log("Base conectada:", mongoose.connection.name);
  console.log("Servidor MongoDB:", mongoose.connection.host);
};

module.exports = connectDatabase;
