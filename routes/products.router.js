const express = require("express");
const mongoose = require("mongoose");
const ProductMongoManager = require("../dao/ProductMongoManager");

const router = express.Router();
const productManager = new ProductMongoManager();

router.get("/", async (req, res) => {
  try {
    const {
      limit = 10,
      page = 1,
      query,
      sort
    } = req.query;

    const parsedLimit = Number(limit);
    const parsedPage = Number(page);

    if (!Number.isInteger(parsedLimit) || parsedLimit < 1) {
      return res.status(400).json({
        status: "error",
        error: "limit debe ser un número entero mayor a 0"
      });
    }

    if (!Number.isInteger(parsedPage) || parsedPage < 1) {
      return res.status(400).json({
        status: "error",
        error: "page debe ser un número entero mayor a 0"
      });
    }

    if (sort && sort !== "asc" && sort !== "desc") {
      return res.status(400).json({
        status: "error",
        error: "sort debe ser 'asc' o 'desc'"
      });
    }

    const result = await productManager.getProducts({
      limit: parsedLimit,
      page: parsedPage,
      query,
      sort
    });

    const buildLink = (targetPage) => {
      const params = new URLSearchParams();

      params.set("limit", limit);
      params.set("page", targetPage);

      if (query) {
        params.set("query", query);
      }

      if (sort) {
        params.set("sort", sort);
      }

      return `/api/products?${params.toString()}`;
    };

    res.json({
      status: "success",
      payload: result.docs,
      totalPages: result.totalPages,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevLink: result.hasPrevPage
        ? buildLink(result.prevPage)
        : null,
      nextLink: result.hasNextPage
        ? buildLink(result.nextPage)
        : null
    });
  } catch (error) {
    console.error("Error al listar productos:", error);

    res.status(500).json({
      status: "error",
      error: "Error interno del servidor"
    });
  }
});

router.get("/:pid", async (req, res) => {
  try {
    const productId = req.params.pid;

    if (!mongoose.isObjectIdOrHexString(productId)) {
      return res.status(400).json({ error: "El ID del producto no es válido" });
    }

    const product = await productManager.getProductById(productId);

    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json(product);
  } catch (error) {
    console.error("Error al buscar el producto:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.post("/", async (req, res) => {
  try {
    const {
      title,
      description,
      code,
      price,
      stock,
      category,
      status = true,
      thumbnails = []
    } = req.body;

    if (!title || !description || !code || price === undefined || stock === undefined || !category) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    if (typeof price !== "number" || price < 0) {
      return res.status(400).json({ error: "El precio debe ser un número mayor o igual a 0" });
    }

    if (!Number.isInteger(stock) || stock < 0) {
      return res.status(400).json({ error: "El stock debe ser un número entero mayor o igual a 0" });
    }

    if (typeof status !== "boolean") {
      return res.status(400).json({ error: "El status debe ser booleano" });
    }

    if (!Array.isArray(thumbnails)) {
      return res.status(400).json({ error: "Thumbnails debe ser un array" });
    }

    const newProduct = await productManager.addProduct({
      title,
      description,
      code,
      price,
      stock,
      category,
      status,
      thumbnails
    });

    const result = await productManager.getProducts({
      limit: 100,
      page: 1
    });

    const io = req.app.get("io");

    io.emit("productsUpdated", result.docs);

    res.status(201).json(newProduct);
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(400).json({ error: "El código del producto ya existe" });
    }

    console.error("Error al crear el producto:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.put("/:pid", async (req, res) => {
  try {
    const productId = req.params.pid;
    const updatedData = { ...req.body };

    if (!mongoose.isObjectIdOrHexString(productId)) {
      return res.status(400).json({
        error: "El ID del producto no es válido"
      });
    }

    // Evita que el cliente modifique el identificador.
    delete updatedData._id;
    delete updatedData.id;

    const updatedProduct = await productManager.updateProduct(
      productId,
      updatedData
    );

    if (!updatedProduct) {
      return res.status(404).json({
        error: "Producto no encontrado"
      });
    }

    // Obtiene nuevamente la lista actualizada.
    const result = await productManager.getProducts({
      limit: 100,
      page: 1
    });

    // Notifica a todos los clientes conectados.
    const io = req.app.get("io");

    io.emit("productsUpdated", result.docs);

    res.json(updatedProduct);
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(400).json({
        error: "El código del producto ya existe"
      });
    }

    if (error?.name === "ValidationError") {
      return res.status(400).json({
        error: error.message
      });
    }

    console.error("Error al actualizar el producto:", error);

    res.status(500).json({
      error: "Error interno del servidor"
    });
  }
});

router.delete("/:pid", async (req, res) => {
  try {
    const productId = req.params.pid;

    if (!mongoose.isObjectIdOrHexString(productId)) {
      return res.status(400).json({ error: "El ID del producto no es válido" });
    }

    const deletedProduct = await productManager.deleteProduct(productId);

    if (!deletedProduct) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    const result = await productManager.getProducts({
      limit: 100,
      page: 1
    });

    const io = req.app.get("io");

    io.emit("productsUpdated", result.docs);

    res.json({ message: "Producto eliminado correctamente", product: deletedProduct });
  } catch (error) {
    console.error("Error al eliminar el producto:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

module.exports = router;
