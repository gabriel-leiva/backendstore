const fs = require("fs").promises;

class CartManager {
  constructor(path) {
    this.path = path;
  }

  async getCarts() {
    try {
      const content = await fs.readFile(this.path, "utf-8");

      return JSON.parse(content);
    } catch (error) {
      console.error("Error al leer los carritos:", error);

      return [];
    }
  }

  async saveCarts(carts) {
    const content = JSON.stringify(carts, null, 2);

    await fs.writeFile(this.path, content);
  }

  async createCart() {
  const carts = await this.getCarts();

  const newId =
    carts.length === 0
      ? 1
      : Math.max(...carts.map((cart) => cart.id)) + 1;

    const newCart = {
      id: newId,
      products: []
    };

    carts.push(newCart);

    await this.saveCarts(carts);

    return newCart;
  }

  async getCartById(id) {
    const carts = await this.getCarts();

    return carts.find((cart) => cart.id === id);
  }

  async addProductToCart(cartId, productId) {
  const carts = await this.getCarts();

  const cartIndex = carts.findIndex(
    (cart) => cart.id === cartId
  );

  if (cartIndex === -1) {
    return null;
  }

  const productInCart = carts[cartIndex].products.find(
    (item) => item.product === productId
  );

  if (productInCart) {
    productInCart.quantity += 1;
  } else {
    carts[cartIndex].products.push({
      product: productId,
      quantity: 1
    });
  }

  await this.saveCarts(carts);

  return carts[cartIndex];
}

async deleteProductFromCart(cartId, productId) {
  const carts = await this.getCarts();

  const cartIndex = carts.findIndex(
    (cart) => cart.id === cartId
  );

  if (cartIndex === -1) {
    return null;
  }

  const productExists = carts[cartIndex].products.some(
    (item) => item.product === productId
  );

  if (!productExists) {
    return false;
  }

  carts[cartIndex].products = carts[cartIndex].products.filter(
    (item) => item.product !== productId
  );

  await this.saveCarts(carts);

  return carts[cartIndex];
}

async clearCart(cartId) {
  const carts = await this.getCarts();

  const cartIndex = carts.findIndex(
    (cart) => cart.id === cartId
  );

  if (cartIndex === -1) {
    return null;
  }

  carts[cartIndex].products = [];

  await this.saveCarts(carts);

  return carts[cartIndex];
}

async updateProductQuantity(cartId, productId, quantity) {
  const carts = await this.getCarts();

  const cartIndex = carts.findIndex(
    (cart) => cart.id === cartId
  );

  if (cartIndex === -1) {
    return null;
  }

  const productInCart = carts[cartIndex].products.find(
    (item) => item.product === productId
  );

  if (!productInCart) {
    return false;
  }

  productInCart.quantity = quantity;

  await this.saveCarts(carts);

  return carts[cartIndex];
}

async updateCart(cartId, products) {
  const carts = await this.getCarts();

  const cartIndex = carts.findIndex(
    (cart) => cart.id === cartId
  );

  if (cartIndex === -1) {
    return null;
  }

  carts[cartIndex].products = products;

  await this.saveCarts(carts);

  return carts[cartIndex];
}
}

module.exports = CartManager;