const mongoose = require("mongoose");

const CartModel = require("../../models/cart.model");
const ProductModel = require("../../models/product.model");

class CartMongoDAO {
  async createCart() {
    const cart = await CartModel.create({
      products: [],
    });

    return cart.toObject();
  }

  async getCartById(cartId) {
    this.validateObjectId(cartId, "cart");

    return CartModel.findById(cartId)
      .populate("products.product")
      .lean();
  }

  async addProductToCart(cartId, productId) {
    this.validateObjectId(cartId, "cart");
    this.validateObjectId(productId, "product");

    const cart = await CartModel.findById(cartId);

    if (!cart) {
        return null;
    }

    const productExists =
        await ProductModel.exists({ _id: productId });

    if (!productExists) {
        const error = new Error("Product not found");
        error.statusCode = 404;
        throw error;
    }

    const productInCart = cart.products.find(
        (item) =>
        item.product.toString() === productId
    );

    if (productInCart) {
        productInCart.quantity += 1;
    } else {
        cart.products.push({
        product: productId,
        quantity: 1,
        });
    }

    await cart.save();

    return CartModel.findById(cartId)
        .populate("products.product")
        .lean();
  }

  async removeProductFromCart(cartId, productId) {
    this.validateObjectId(cartId, "cart");
    this.validateObjectId(productId, "product");

    return CartModel.findByIdAndUpdate(
      cartId,
      {
        $pull: {
          products: {
            product: productId,
          },
        },
      },
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("products.product")
      .lean();
  }

  async updateCartProducts(cartId, products) {
    this.validateObjectId(cartId, "cart");

    return CartModel.findByIdAndUpdate(
      cartId,
      {
        products,
      },
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("products.product")
      .lean();
  }

  async updateProductQuantity(
    cartId,
    productId,
    quantity
  ) {
    this.validateObjectId(cartId, "cart");
    this.validateObjectId(productId, "product");

    return CartModel.findOneAndUpdate(
      {
        _id: cartId,
        "products.product": productId,
      },
      {
        $set: {
          "products.$.quantity": quantity,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("products.product")
      .lean();
  }

  async clearCart(cartId) {
    this.validateObjectId(cartId, "cart");

    return CartModel.findByIdAndUpdate(
      cartId,
      {
        $set: {
          products: [],
        },
      },
      {
        new: true,
        runValidators: true,
      }
    ).lean();
  }

  async cartExists(cartId) {
    this.validateObjectId(cartId, "cart");

    return CartModel.exists({
      _id: cartId,
    });
  }

  validateObjectId(id, resourceName) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error(
        `Invalid ${resourceName} ID`
      );

      error.statusCode = 400;
      throw error;
    }
  }

	async validateProductsExist(products) {
		const productIds = products.map(
			(item) => item.product
		);

		productIds.forEach((productId) => {
			this.validateObjectId(productId, "product");
		});

		const existingProducts =
			await ProductModel.countDocuments({
				_id: {
					$in: productIds,
				},
			});

		if (existingProducts !== productIds.length) {
			const error = new Error(
				"One or more products do not exist"
			);

			error.statusCode = 404;
			throw error;
		}
	}
}





module.exports = CartMongoDAO;