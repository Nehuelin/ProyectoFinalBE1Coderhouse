const ProductMongoDAO = require("../dao/db/ProductMongoDAO");

const productDAO = new ProductMongoDAO();

async function getProducts(req, res, next) {
  try {
    const {
      limit = "10",
      page = "1",
      query,
      sort,
    } = req.query;

    const parsedLimit = Number(limit);
    const parsedPage = Number(page);

    if (
      !Number.isInteger(parsedLimit) ||
      parsedLimit <= 0
    ) {
      const error = new Error(
        "El parámetro limite debe ser un número entero positivo"
      );

      error.statusCode = 400;
      throw error;
    }

    if (
      !Number.isInteger(parsedPage) ||
      parsedPage <= 0
    ) {
      const error = new Error(
        "El parámetro página debe ser un número entero positivo"
      );

      error.statusCode = 400;
      throw error;
    }

    if (sort && !["asc", "desc"].includes(sort)) {
      const error = new Error(
        'El parámetro de ordenamiento debe ser "asc" o "desc"'
      );

      error.statusCode = 400;
      throw error;
    }

    const filter = buildProductFilter(query);

    let sortOption = null;

    if (sort === "asc") {
      sortOption = { price: 1 };
    }

    if (sort === "desc") {
      sortOption = { price: -1 };
    }

    const result = await productDAO.getProducts({
      filter,
      page: parsedPage,
      limit: parsedLimit,
      sort: sortOption,
    });

    const baseUrl = `${req.protocol}://${req.get("host")}${req.baseUrl}`;

    const prevLink = result.hasPrevPage
      ? buildPaginationLink(baseUrl, {
          limit: parsedLimit,
          page: result.prevPage,
          query,
          sort,
        })
      : null;

    const nextLink = result.hasNextPage
      ? buildPaginationLink(baseUrl, {
          limit: parsedLimit,
          page: result.nextPage,
          query,
          sort,
        })
      : null;

    return res.status(200).json({
      status: "success",
      payload: result.products,
      totalPages: result.totalPages,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevLink,
      nextLink,
    });
  } catch (error) {
    return next(error);
  }
}

async function getProductById(req, res, next) {
  try {
    const { pid } = req.params;

    const product =
      await productDAO.getProductById(pid);

    if (!product) {
      const error = new Error("Product not found");
      error.statusCode = 404;
      throw error;
    }

    return res.status(200).json({
      status: "success",
      payload: product,
    });
  } catch (error) {
    return next(error);
  }
}

function buildProductFilter(query) {
  if (!query) {
    return {};
  }

  const normalizedQuery = query.trim().toLowerCase();

  if (normalizedQuery === "available") {
    return {
      status: true,
      stock: { $gt: 0 },
    };
  }

  if (normalizedQuery === "unavailable") {
    return {
      $or: [
        { status: false },
        { stock: 0 },
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

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildPaginationLink(baseUrl, parameters) {
  const searchParameters = new URLSearchParams();

  searchParameters.set("limit", parameters.limit);
  searchParameters.set("page", parameters.page);

  if (parameters.query) {
    searchParameters.set("query", parameters.query);
  }

  if (parameters.sort) {
    searchParameters.set("sort", parameters.sort);
  }

  return `${baseUrl}?${searchParameters.toString()}`;
}

async function createProduct(req, res, next) {
  try {
    const {
      title,
      description,
      code,
      price,
      status,
      stock,
      category,
      thumbnails,
    } = req.body;

    const requiredFields = [
      "title",
      "description",
      "code",
      "price",
      "stock",
      "category",
    ];

    const missingFields = requiredFields.filter((field) => {
      const value = req.body[field];

      return (
        value === undefined ||
        value === null ||
        value === ""
      );
    });

    if (missingFields.length > 0) {
      const error = new Error(
        `Faltan los siguientes campos: ${missingFields.join(", ")}`
      );

      error.statusCode = 400;
      throw error;
    }

    const existingProduct =
      await productDAO.getProductByCode(code);

    if (existingProduct) {
      const error = new Error(
        `Ya existe un producto con el código "${code}"`
      );

      error.statusCode = 409;
      throw error;
    }

    const newProduct = await productDAO.createProduct({
      title,
      description,
      code,
      price,
      status,
      stock,
      category,
      thumbnails,
    });

    return res.status(201).json({
      status: "success",
      message: "Producto creado exitosamente",
      payload: newProduct,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
	getProducts,
	getProductById,
  createProduct,
};