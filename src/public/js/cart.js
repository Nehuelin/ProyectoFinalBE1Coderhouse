const cartPage = document.querySelector(
  ".cart-page"
);

const cartMessage = document.getElementById(
  "cart-message"
);

if (cartPage) {
  const cartId = cartPage.dataset.cartId;

  document
    .querySelectorAll(".update-quantity-button")
    .forEach((button) => {
      button.addEventListener("click", async () => {
        const cartItem =
          button.closest(".cart-item");

        const productId =
          cartItem.dataset.productId;

        const quantityInput =
          cartItem.querySelector(
            ".quantity-input"
          );

        const quantity = Number(
          quantityInput.value
        );

        if (
          !Number.isInteger(quantity) ||
          quantity <= 0
        ) {
          showCartMessage(
            "La cantidad debe ser un entero positivo.",
            "error"
          );

          return;
        }

        await executeCartRequest(
          `/api/carts/${cartId}/products/${productId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              quantity,
            }),
          },
          "Cantidad actualizada correctamente."
        );
      });
    });

  document
    .querySelectorAll(".remove-product-button")
    .forEach((button) => {
      button.addEventListener("click", async () => {
        const cartItem =
          button.closest(".cart-item");

        const productId =
          cartItem.dataset.productId;

        const confirmed = window.confirm(
          "¿Querés eliminar este producto?"
        );

        if (!confirmed) {
          return;
        }

        await executeCartRequest(
          `/api/carts/${cartId}/products/${productId}`,
          {
            method: "DELETE",
          },
          "Producto eliminado correctamente."
        );
      });
    });

  const clearCartButton =
    document.getElementById(
      "clear-cart-button"
    );

  if (clearCartButton) {
    clearCartButton.addEventListener(
      "click",
      async () => {
        const confirmed = window.confirm(
          "¿Querés vaciar todo el carrito?"
        );

        if (!confirmed) {
          return;
        }

        await executeCartRequest(
          `/api/carts/${cartId}`,
          {
            method: "DELETE",
          },
          "Carrito vaciado correctamente."
        );
      }
    );
  }
}

async function executeCartRequest(
  url,
  options,
  successMessage
) {
  try {
    const response = await fetch(url, options);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message ||
          "Could not update the cart"
      );
    }

    showCartMessage(
      successMessage,
      "success"
    );

    window.setTimeout(() => {
      window.location.reload();
    }, 600);
  } catch (error) {
    showCartMessage(error.message, "error");
  }
}

function showCartMessage(message, type) {
  cartMessage.textContent = message;
  cartMessage.className = `cart-message ${type}`;
}