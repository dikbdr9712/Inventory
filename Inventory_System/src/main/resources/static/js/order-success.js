const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('orderId');
    if (orderId) {
      document.getElementById('order-id').textContent = `Order #${orderId}`;
    }