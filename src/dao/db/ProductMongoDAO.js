const mongoose = require("mongoose");
const ProductModel = require("../../models/product.model");

class ProductMongoDAO {
  async getProducts(options = {}) {
    const {
      filter = {},
      page = 1,
      limit = 10,
      sort = null,
    } = options;

    const skip = (page - 1) * limit;

    const productsQuery = ProductModel.find(filter)
      .skip(skip)
      .limit(limit);

    if (sort) {
      productsQuery.sort(sort);
    }

    const [products, totalProducts] = await Promise.all([
      productsQuery.lean(),
      ProductModel.countDocuments(filter),
    ]);

    const totalPages = totalProducts === 0 ? 0 : Math.ceil(totalProducts / limit);

    return {
      products,
      totalProducts,
      totalPages,
      page,
      limit,
      hasPrevPage: page > 1 && totalPages > 0,
      hasNextPage: page < totalPages,
      prevPage: page > 1 && totalPages > 0 ? page - 1 : null,
      nextPage: page < totalPages ? page + 1 : null,
    };
  }

  async getProductById(productId) {
    this.validateObjectId(productId);

    return ProductModel.findById(productId).lean();
  }

  async createProduct(productData) {
    const product = await ProductModel.create(productData);

    return product.toObject();
  }

  async updateProduct(productId, productData) {
    this.validateObjectId(productId);

    // Impide modificar el ID del producto.
    const {
      _id,
      id,
      createdAt,
      updatedAt,
      ...allowedData
    } = productData;

    return ProductModel.findByIdAndUpdate(
      productId,
      allowedData,
      {
        new: true,
        runValidators: true,
      }
    ).lean();
  }

  async deleteProduct(productId) {
    this.validateObjectId(productId);

    return ProductModel.findByIdAndDelete(productId).lean();
  }

  async getProductByCode(code) {
    return ProductModel.findOne({ code }).lean();
  }

  validateObjectId(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error("Invalid product ID");
      error.statusCode = 400;
      throw error;
    }
  }
}

module.exports = ProductMongoDAO;