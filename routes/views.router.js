const express = require("express");
const mongoose = require("mongoose");
const ProductMongoManager = require("../dao/ProductMongoManager");
const CartMongoManager = require("../dao/CartMongoManager");

const router = express.Router();

const productManager = new ProductMongoManager();
const cartManager = new CartMongoManager();

router.get("/products/:pid", async (req, res) => {
  try {
    const productId = req.params.pid;

    if (!mongoose.isObjectIdOrHexString(productId)) {
      return res.status(400).send("El ID del producto no es válido");
    }

    const product = await productManager.getProductById(productId);

    if (!product) {
      return res.status(404).send("Producto no encontrado");
    }

    res.render("productDetail", {
      title: product.title,
      product
    });
  } catch (error) {
    console.error("Error al renderizar el producto:", error);

    res.status(500).send("Error al cargar el producto");
  }
});

router.get("/products", async (req, res) => {
  try {
    const result = await productManager.getProducts({
      limit: Number(req.query.limit) || 10,
      page: Number(req.query.page) || 1,
      query: req.query.query,
      sort: req.query.sort
    });

    res.render("products", {
      title: "Productos",
      products: result.docs,
      page: result.page,
      totalPages: result.totalPages,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevPage: result.prevPage,
      nextPage: result.nextPage
    });
  } catch (error) {
    console.error("Error al renderizar productos:", error);

    res.status(500).send("Error al cargar los productos");
  }
});

router.get("/carts/:cid", async (req, res) => {
  try {
    const cartId = req.params.cid;

    if (!mongoose.isObjectIdOrHexString(cartId)) {
      return res.status(400).send("El ID del carrito no es válido");
    }

    const cart = await cartManager.getCartById(cartId);

    if (!cart) {
      return res.status(404).send("Carrito no encontrado");
    }

    res.render("cart", {
      title: "Carrito",
      cart,
      products: cart.products
    });
  } catch (error) {
    console.error("Error al renderizar el carrito:", error);

    res.status(500).send("Error al cargar el carrito");
  }
});

router.get("/realtimeproducts", async (req, res) => {
  try {
    const result = await productManager.getProducts({
      limit: 100,
      page: 1
    });

    res.render("realTimeProducts", {
      title: "Productos en tiempo real",
      products: result.docs
    });
  } catch (error) {
    console.error("Error al renderizar productos en tiempo real:", error);

    res.status(500).send("Error al cargar los productos");
  }
});

module.exports = router;