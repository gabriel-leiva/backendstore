const CartModel = require("../models/cart.model");

class CartMongoManager {
  async createCart() {
    return CartModel.create({ products: [] });
  }

  async getCartById(id) {
    return CartModel.findById(id)
      .populate("products.product")
      .lean();
  }

  async addProductToCart(cartId, productId) {
    const cart = await CartModel.findById(cartId);

    if (!cart) return null;

    const productInCart = cart.products.find(
      (item) => item.product.toString() === productId
    );

    if (productInCart) {
      productInCart.quantity += 1;
    } else {
      cart.products.push({ product: productId, quantity: 1 });
    }

    await cart.save();
    return cart;
  }

  async deleteProductFromCart(cartId, productId) {
    const cart = await CartModel.findById(cartId);

    if (!cart) return null;

    const productExists = cart.products.some(
      (item) => item.product.toString() === productId
    );

    if (!productExists) return false;

    cart.products = cart.products.filter(
      (item) => item.product.toString() !== productId
    );

    await cart.save();
    return cart;
  }

  async clearCart(cartId) {
    const cart = await CartModel.findById(cartId);

    if (!cart) return null;

    cart.products = [];
    await cart.save();
    return cart;
  }

  async updateProductQuantity(cartId, productId, quantity) {
    const cart = await CartModel.findById(cartId);

    if (!cart) return null;

    const productInCart = cart.products.find(
      (item) => item.product.toString() === productId
    );

    if (!productInCart) return false;

    productInCart.quantity = quantity;
    await cart.save();
    return cart;
  }

  async updateCart(cartId, products) {
    return CartModel.findByIdAndUpdate(
      cartId,
      { products },
      { new: true, runValidators: true }
    );
  }
}

module.exports = CartMongoManager;
