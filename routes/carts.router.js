const express = require("express");
const mongoose = require("mongoose");
const CartMongoManager = require("../dao/CartMongoManager");
const ProductMongoManager = require("../dao/ProductMongoManager");

const router = express.Router();
const cartManager = new CartMongoManager();
const productManager = new ProductMongoManager();

const isValidId = (id) => mongoose.isObjectIdOrHexString(id);

router.post("/", async (req, res) => {
  try {
    const newCart = await cartManager.createCart();
    res.status(201).json(newCart);
  } catch (error) {
    console.error("Error al crear el carrito:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.get("/:cid", async (req, res) => {
  try {
    const cartId = req.params.cid;

    if (!isValidId(cartId)) {
      return res.status(400).json({ error: "El ID del carrito no es válido" });
    }

    const cart = await cartManager.getCartById(cartId);

    if (!cart) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }

    res.json(cart);
  } catch (error) {
    console.error("Error al buscar el carrito:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.post("/:cid/products/:pid", async (req, res) => {
  try {
    const cartId = req.params.cid;
    const productId = req.params.pid;

    if (!mongoose.isObjectIdOrHexString(cartId)) {
      return res.status(400).json({
        error: "El ID del carrito no es válido"
      });
    }

    if (!mongoose.isObjectIdOrHexString(productId)) {
      return res.status(400).json({
        error: "El ID del producto no es válido"
      });
    }

    const product = await productManager.getProductById(productId);

    if (!product) {
      return res.status(404).json({
        error: "Producto no encontrado"
      });
    }

    const updatedCart = await cartManager.addProductToCart(
      cartId,
      productId
    );

    if (!updatedCart) {
      return res.status(404).json({
        error: "Carrito no encontrado"
      });
    }

    res.json(updatedCart);
  } catch (error) {
    console.error("Error al agregar el producto al carrito:", error);

    res.status(500).json({
      error: "Error interno del servidor"
    });
  }
});

router.delete("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid: cartId, pid: productId } = req.params;

    if (!isValidId(cartId) || !isValidId(productId)) {
      return res.status(400).json({ error: "El ID del carrito o producto no es válido" });
    }

    const result = await cartManager.deleteProductFromCart(cartId, productId);

    if (result === null) return res.status(404).json({ error: "Carrito no encontrado" });
    if (result === false) return res.status(404).json({ error: "Producto no encontrado en el carrito" });

    res.json(result);
  } catch (error) {
    console.error("Error al eliminar el producto del carrito:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.put("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid: cartId, pid: productId } = req.params;
    const quantity = Number(req.body.quantity);

    if (!isValidId(cartId) || !isValidId(productId)) {
      return res.status(400).json({ error: "El ID del carrito o producto no es válido" });
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({ error: "La cantidad debe ser un número entero mayor a 0" });
    }

    const result = await cartManager.updateProductQuantity(cartId, productId, quantity);

    if (result === null) return res.status(404).json({ error: "Carrito no encontrado" });
    if (result === false) return res.status(404).json({ error: "Producto no encontrado en el carrito" });

    res.json(result);
  } catch (error) {
    console.error("Error al actualizar la cantidad:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.put("/:cid", async (req, res) => {
  try {
    const cartId = req.params.cid;
    const products = req.body.products;

    if (!isValidId(cartId)) {
      return res.status(400).json({ error: "El ID del carrito no es válido" });
    }

    if (!Array.isArray(products)) {
      return res.status(400).json({ error: "El campo 'products' debe ser un array" });
    }

    const invalidItem = products.some(
      (item) => !isValidId(item.product) || !Number.isInteger(item.quantity) || item.quantity < 1
    );

    if (invalidItem) {
      return res.status(400).json({
        error: "Cada producto debe tener un ObjectId válido y una cantidad entera mayor a 0"
      });
    }

    const updatedCart = await cartManager.updateCart(cartId, products);

    if (!updatedCart) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }

    res.json(updatedCart);
  } catch (error) {
    console.error("Error al actualizar el carrito:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.delete("/:cid", async (req, res) => {
  try {
    const cartId = req.params.cid;

    if (!isValidId(cartId)) {
      return res.status(400).json({ error: "El ID del carrito no es válido" });
    }

    const updatedCart = await cartManager.clearCart(cartId);

    if (!updatedCart) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }

    res.json({ message: "Carrito vaciado correctamente", cart: updatedCart });
  } catch (error) {
    console.error("Error al vaciar el carrito:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

module.exports = router;
