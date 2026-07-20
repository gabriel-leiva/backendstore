const fs = require("fs").promises;

class ProductManager {
  constructor(path) {
    this.path = path;
  }

  async getProducts() {
    console.log("Entré a ProductMongoManager.getProducts");

    console.log(
      "Colección consultada:",
      ProductModel.collection.name
    );

    const quantity = await ProductModel.countDocuments();

    console.log("Cantidad de documentos:", quantity);

    const products = await ProductModel.find();

    return products;
  }

  async saveProducts(products) {
    const content = JSON.stringify(products, null, 2);

    await fs.writeFile(this.path, content);
  }

  async addProduct(product) {
    const products = await this.getProducts();

    const newId =
      products.length === 0
        ? 1
        : Math.max(...products.map((product) => product.id)) + 1;

    const newProduct = {
      id: newId,
      ...product
    };

    products.push(newProduct);

    await this.saveProducts(products);

    return newProduct;
  }

  async getProductById(id) {
  const products = await this.getProducts();

  const product = products.find((product) => product.id === id);

  return product;
}

async updateProduct(id, updatedData) {
  const products = await this.getProducts();

  const productIndex = products.findIndex(
    (product) => product.id === id
  );

  if (productIndex === -1) {
    return null;
  }

  const updatedProduct = {
    ...products[productIndex],
    ...updatedData,
    id
  };

  products[productIndex] = updatedProduct;

  await this.saveProducts(products);

  return updatedProduct;
}

async deleteProduct(id) {
  const products = await this.getProducts();

  const productExists = products.some(
    (product) => product.id === id
  );

  if (!productExists) {
    return null;
  }

  const updatedProducts = products.filter(
    (product) => product.id !== id
  );

  await this.saveProducts(updatedProducts);

  return id;
}
  
}

module.exports = ProductManager;