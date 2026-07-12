const socket = io();

const productsPage = document.querySelector(
  "[data-realtime-products]"
);

const productDetailPage =
  document.querySelector(
    ".product-detail-page"
  );

let reloadScheduled = false;

socket.on("connect", () => {
  console.log(
    `Connected to Socket.IO: ${socket.id}`
  );
});

socket.on(
  "connectionSuccess",
  (data) => {
    console.log(data.message);
  }
);

socket.on("productsUpdated", (data) => {
  console.log(
    "Products update received:",
    data
  );

  if (productsPage) {
    updateProductsList(data);
  }

  if (productDetailPage) {
    updateProductDetail(data);
  }
});

socket.on("disconnect", (reason) => {
  console.log(
    `Disconnected from Socket.IO: ${reason}`
  );
});

socket.on("connect_error", (error) => {
  console.error(
    "Socket.IO connection error:",
    error.message
  );
});

function updateProductsList(data) {
  if (reloadScheduled) {
    return;
  }

  reloadScheduled = true;

  const messages = {
    created:
      "Se agregó un producto nuevo.",
    updated:
      "Se actualizó un producto.",
    deleted:
      "Se eliminó un producto.",
  };

  const message =
    messages[data.action] ||
    "El catálogo fue actualizado.";

  saveRealtimeMessage(message);

  showRealtimeMessage(
    `${message} Actualizando catálogo...`
  );

  window.setTimeout(() => {
    window.location.reload();
  }, 700);
}

function updateProductDetail(data) {
  const currentProductId =
    productDetailPage.dataset.productId;

  if (data.productId !== currentProductId) {
    return;
  }

  if (data.action === "deleted") {
    saveRealtimeMessage(
      "El producto que estabas viendo fue eliminado."
    );

    showRealtimeMessage(
      "Este producto fue eliminado. Volviendo al catálogo..."
    );

    window.setTimeout(() => {
      window.location.href = "/products";
    }, 900);

    return;
  }

  if (data.action === "updated") {
    saveRealtimeMessage(
      "El producto fue actualizado."
    );

    showRealtimeMessage(
      "El producto cambió. Actualizando información..."
    );

    window.setTimeout(() => {
      window.location.reload();
    }, 700);
  }
}

function showRealtimeMessage(message) {
  const messageElement =
    document.getElementById(
      "realtime-message"
    );

  if (!messageElement) {
    return;
  }

  messageElement.textContent = message;

  messageElement.classList.add(
    "realtime-message-visible"
  );
}

function saveRealtimeMessage(message) {
  sessionStorage.setItem(
    "realtimeMessage",
    message
  );
}

function restoreRealtimeMessage() {
  const message = sessionStorage.getItem(
    "realtimeMessage"
  );

  if (!message) {
    return;
  }

  sessionStorage.removeItem(
    "realtimeMessage"
  );

  showRealtimeMessage(message);

  window.setTimeout(() => {
    const messageElement =
      document.getElementById(
        "realtime-message"
      );

    if (messageElement) {
      messageElement.classList.remove(
        "realtime-message-visible"
      );
    }
  }, 3000);
}

restoreRealtimeMessage();