const ProductModel = require("../models/product.model");

class ProductMongoManager {
  async getProducts(options = {}) {
    const {
      limit = 10,
      page = 1,
      query,
      sort
    } = options;

    const filter = {};

    if (query) {
      if (query === "available") {
        filter.stock = { $gt: 0 };
      } else {
        filter.category = query;
      }
    }

    const sortOptions = {};

    if (sort === "asc") {
      sortOptions.price = 1;
    }

    if (sort === "desc") {
      sortOptions.price = -1;
    }

    const result = await ProductModel.paginate(filter, {
      limit,
      page,
      sort: sortOptions,
      lean: true
    });

    return result;
  }

 async getProductById(id) {
  return ProductModel.findById(id).lean();
}

  async addProduct(productData) {
    return ProductModel.create(productData);
  }

  async updateProduct(id, updatedData) {
    return ProductModel.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true
    });
  }

  async deleteProduct(id) {
    return ProductModel.findByIdAndDelete(id);
  }
}

module.exports = ProductMongoManager;
