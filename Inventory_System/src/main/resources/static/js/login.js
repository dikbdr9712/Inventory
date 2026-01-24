// login.js - Final version (saves name + phone)

document.getElementById('login-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!email || !password) {
        alert("Please fill in all fields.");
        return;
    }

    try {
        const response = await fetch('http://localhost:8080/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Invalid email or password');
        }

        // ✅ Parse user data (now includes name + phone!)
        const user = await response.json();
        console.log('Login response:', user); 
        // ✅ Save ALL user data to localStorage
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('currentUser', user.email);
        localStorage.setItem('userName', user.name);     // ✅ Save name
        localStorage.setItem('userPhone', user.phone);   // ✅ Save phone
        localStorage.setItem('userRole', user.role);
        localStorage.setItem('userEmail', user.email);

        // ✅ Show welcome message
        alert(`✅ Welcome, ${user.name}!`);

        // ✅ Redirect
        const redirect = localStorage.getItem('redirectAfterLogin') || 'Product.html';
        localStorage.removeItem('redirectAfterLogin');
        window.location.href = redirect;

    } catch (error) {
        console.error('Login failed:', error);
        alert('❌ Login failed: ' + error.message);
    }
});