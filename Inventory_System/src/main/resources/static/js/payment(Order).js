document.addEventListener('DOMContentLoaded', function () {
        const urlParams = new URLSearchParams(window.location.search);
        const orderId = urlParams.get('orderId');
        const totalAmountStr = urlParams.get('total');

        // Validate URL parameters
        if (!orderId || !totalAmountStr) {
            alert("Invalid order data. Redirecting to cart...");
            window.location.href = 'cart.html';
            return;
        }

        const totalAmount = parseFloat(totalAmountStr);
        if (isNaN(totalAmount) || totalAmount <= 0) {
            alert("Invalid total amount.");
            window.location.href = 'cart.html';
            return;
        }

        // Display order info
        document.getElementById('order-info').innerHTML = `
            <p><strong>Order ID:</strong> ${orderId}</p>
            <p><strong>Total Amount:</strong> Nu. ${totalAmount.toFixed(2)}</p>
        `;
        document.getElementById('order-id-ref').textContent = orderId;

        // Show/hide bank details + journal input when payment method changes
        document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
            radio.addEventListener('change', function () {
                const bankDetails = document.getElementById('bank-details');
                const journalInput = document.querySelector('.journal-input');
                if (this.value === 'bank') {
                    bankDetails.style.display = 'block';
                    journalInput.style.display = 'block';
                } else {
                    bankDetails.style.display = 'none';
                    journalInput.style.display = 'none';
                }
            });
        });

        // Confirm Payment Button
        document.getElementById('confirm-payment-btn').addEventListener('click', async () => {
            const selectedRadio = document.querySelector('input[name="paymentMethod"]:checked');
            if (!selectedRadio) {
                alert("Please select a payment method.");
                return;
            }

            const paymentMethod = selectedRadio.value;

            let journalNumber = '';
            if (paymentMethod === 'bank') {
                journalNumber = document.getElementById('journalNumber').value.trim();
                if (!journalNumber) {
                    alert("Please enter the transaction journal number for verification.");
                    return;
                }
            }

            console.log("Selected payment method:", paymentMethod);
            console.log("Journal Number:", journalNumber);

            const paymentData = {
                orderId: parseInt(orderId, 10),
                amount: totalAmount,
                paymentMethod: paymentMethod,
                status: "pending",
                journalNumber: journalNumber // Only used if bank transfer
            };

            try {
                // Step 1: Create Payment Record
                const paymentRes = await fetch('http://localhost:8080/api/payments', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(paymentData)
                });

                if (!paymentRes.ok) {
                    const errorText = await paymentRes.text();
                    console.error("Payment creation failed:", errorText);
                    alert("❌ Failed to record payment. Please try again.");
                    return;
                }

                // Step 2: Update Order Status to "Pending"
                const statusRes = await fetch(`http://localhost:8080/api/orders/${orderId}/status`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: "Pending" })
                });

                if (!statusRes.ok) {
                    console.warn("Order status update failed, but payment was recorded.");
                }

                // Success
                localStorage.removeItem('cart');
                alert(`✅ Order #${orderId} placed successfully!\nAwaiting fulfillment.`);
                window.location.href = `order-success.html?orderId=${orderId}`;

            } catch (err) {
                console.error("Network error:", err);
                alert('🌐 Could not connect to server. Is Spring Boot running on port 8080?');
            }
        });

        // Cancel Button
        document.getElementById('cancel-btn').addEventListener('click', () => {
            if (confirm('Are you sure you want to cancel this order?')) {
                window.location.href = 'cart.html';
            }
        });
    });