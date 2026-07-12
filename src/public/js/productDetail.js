const productDetailPage = document.querySelector(
  ".product-detail-page"
);

const addToCartForm = document.getElementById(
  "add-to-cart-form"
);

const cartMessage = document.getElementById(
  "cart-message"
);

if (productDetailPage && addToCartForm) {
  addToCartForm.addEventListener(
    "submit",
    async (event) => {
      event.preventDefault();

      const productId =
        productDetailPage.dataset.productId;

      const cartIdInput =
        document.getElementById("cart-id");

      const cartId = cartIdInput.value.trim();

      if (!cartId) {
        showMessage(
          "Ingresá el ID de un carrito.",
          "error"
        );

        return;
      }

      const submitButton =
        addToCartForm.querySelector(
          'button[type="submit"]'
        );

      submitButton.disabled = true;
      submitButton.textContent = "Agregando...";

      try {
        const response = await fetch(
          `/api/carts/${cartId}/products/${productId}`,
          {
            method: "POST",
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.message ||
              "Could not add product to cart"
          );
        }

        showMessage(
          "Producto agregado al carrito correctamente.",
          "success"
        );
      } catch (error) {
        showMessage(error.message, "error");
      } finally {
        submitButton.disabled = false;
        submitButton.textContent =
          "Agregar al carrito";
      }
    }
  );
}

function showMessage(message, type) {
  cartMessage.textContent = message;
  cartMessage.className =
    `cart-message ${type}`;
}