const { Router } = require("express");
const ProductMongoDAO = require("../dao/db/ProductMongoDAO");
const CartMongoDAO = require("../dao/db/CartMongoDAO");

const router = Router();
const productDAO = new ProductMongoDAO();
const cartDAO = new CartMongoDAO();

router.get("/", (req, res) => {
  res.render("home", {
    title: "Inicio | TEMP NAME",
    heading: "Bienvenido a TEMP NAME",
  });
});

router.get("/products", async (req, res, next) => {
  try {
    const {
      page = "1",
      limit = "6",
      query,
      sort,
    } = req.query;

    const parsedPage = Number(page);
    const parsedLimit = Number(limit);

    if (
      !Number.isInteger(parsedPage) ||
      parsedPage <= 0
    ) {
      const error = new Error(
        "La pagina debe ser un número positivo"
      );

      error.statusCode = 400;
      throw error;
    }

    if (
      !Number.isInteger(parsedLimit) ||
      parsedLimit <= 0
    ) {
      const error = new Error(
        "El limite debe ser un número positivo"
      );

      error.statusCode = 400;
      throw error;
    }

    if (sort && !["asc", "desc"].includes(sort)) {
      const error = new Error(
        'El ordenamiento debe ser "asc" o "desc"'
      );

      error.statusCode = 400;
      throw error;
    }

    const filter = buildProductFilter(query);
    const sortOption = buildSortOption(sort);

    const result = await productDAO.getProducts({
      filter,
      page: parsedPage,
      limit: parsedLimit,
      sort: sortOption,
    });

    const prevLink = result.hasPrevPage
      ? buildProductsLink({
          page: result.prevPage,
          limit: parsedLimit,
          query,
          sort,
        })
      : null;

    const nextLink = result.hasNextPage
      ? buildProductsLink({
          page: result.nextPage,
          limit: parsedLimit,
          query,
          sort,
        })
      : null;

    const products = result.products.map(
      (product) => ({
        ...product,
        formattedPrice:
          product.price.toLocaleString("es-AR", {
            style: "currency",
            currency: "ARS",
            maximumFractionDigits: 0,
          }),
        availabilityText:
          product.status && product.stock > 0
            ? "Disponible"
            : "No disponible",
        isAvailable:
          product.status && product.stock > 0,
      })
    );

    return res.render("products", {
      title: "Productos | TEMP NAME",
      products,
      page: result.page,
      totalPages: result.totalPages,
      totalProducts: result.totalProducts,
      hasProducts: products.length > 0,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevLink,
      nextLink,
      currentQuery: query || "",
      currentSort: sort || "",
      currentLimit: parsedLimit,
    });
  } catch (error) {
    return next(error);
  }
});

router.get(
  "/products/:pid",
  async (req, res, next) => {
    try {
      const { pid } = req.params;

      const product =
        await productDAO.getProductById(pid);

      if (!product) {
        const error = new Error(
          "Product not found"
        );

        error.statusCode = 404;
        throw error;
      }

      const isAvailable =
        product.status && product.stock > 0;

      return res.render("productDetail", {
        title: `${product.title} | CoderStore`,
        product: {
          ...product,
          formattedPrice:
            product.price.toLocaleString(
              "es-AR",
              {
                style: "currency",
                currency: "ARS",
                maximumFractionDigits: 0,
              }
            ),
          isAvailable,
          availabilityText: isAvailable
            ? "Disponible"
            : "No disponible",
          mainThumbnail:
            product.thumbnails.length > 0
              ? product.thumbnails[0]
              : null,
        },
      });
    } catch (error) {
      return next(error);
    }
  }
);

router.get(
  "/carts/:cid",
  async (req, res, next) => {
    try {
      const { cid } = req.params;

      const cart = await cartDAO.getCartById(cid);

      if (!cart) {
        const error = new Error("Cart not found");
        error.statusCode = 404;
        throw error;
      }

      const products = cart.products
        .filter((item) => item.product)
        .map((item) => {
          const subtotal =
            item.product.price * item.quantity;

          return {
            product: item.product,
            quantity: item.quantity,
            formattedPrice:
              formatCurrency(item.product.price),
            formattedSubtotal:
              formatCurrency(subtotal),
          };
        });

      const total = products.reduce(
        (accumulator, item) =>
          accumulator +
          item.product.price * item.quantity,
        0
      );

      return res.render("cart", {
        title: "Mi carrito | CoderStore",
        cartId: cart._id.toString(),
        products,
        hasProducts: products.length > 0,
        formattedTotal: formatCurrency(total),
      });
    } catch (error) {
      return next(error);
    }
  }
);

function formatCurrency(value) {
  return value.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  });
}

function buildProductFilter(query) {
  if (!query) {
    return {};
  }

  const normalizedQuery =
    query.trim().toLowerCase();

  if (normalizedQuery === "available") {
    return {
      status: true,
      stock: {
        $gt: 0,
      },
    };
  }

  if (normalizedQuery === "unavailable") {
    return {
      $or: [
        {
          status: false,
        },
        {
          stock: 0,
        },
      ],
    };
  }

  return {
    category: {
      $regex: `^${escapeRegex(query.trim())}$`,
      $options: "i",
    },
  };
}

function buildSortOption(sort) {
  if (sort === "asc") {
    return {
      price: 1,
    };
  }

  if (sort === "desc") {
    return {
      price: -1,
    };
  }

  return null;
}

function buildProductsLink({
  page,
  limit,
  query,
  sort,
}) {
  const parameters = new URLSearchParams();

  parameters.set("page", page);
  parameters.set("limit", limit);

  if (query) {
    parameters.set("query", query);
  }

  if (sort) {
    parameters.set("sort", sort);
  }

  return `/products?${parameters.toString()}`;
}

function escapeRegex(value) {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
}

module.exports = router;