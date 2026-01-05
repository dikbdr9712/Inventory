// signup.js

document.getElementById('signup-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const password = document.getElementById('password').value;

    if (!name || !email || !phone || !password) {
        alert("Please fill in all fields.");
        return;
    }

    try {
        const response = await fetch('http://localhost:8080/api/auth/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                email: email,
                phone: phone,
                password: password
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Signup failed');
        }

        const user = await response.json();
        alert(`✅ Account created! Please log in.`);
        window.location.href = 'login.html';

    } catch (error) {
        console.error('Signup error:', error);
        alert('❌ Signup failed: ' + error.message);
    }
});