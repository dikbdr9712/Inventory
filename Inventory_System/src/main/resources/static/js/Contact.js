document.getElementById('contactForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        message: document.getElementById('message').value
    };

    try {
        const response = await fetch('http://localhost:8080/api/contact', { // ✅ Fixed URL
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            alert('Thank you! Your message has been sent.');
            document.getElementById('contactForm').reset();

            // Optional: Show success animation
            const form = document.getElementById('contactForm');
            form.style.backgroundColor = '#d4edda';
            form.style.transition = 'background-color 1s';
            setTimeout(() => {
                form.style.backgroundColor = '';
            }, 2000);
        } else {
            alert('Failed to send message. Status: ' + response.status);
        }
    } catch (err) {
        console.error(err);
        alert('Network error. Please make sure your Spring Boot app is running on port 8080.');
    }
});