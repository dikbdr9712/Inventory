// admin-contact-messages.js

async function loadMessages() {
    try {
        const res = await fetch('http://localhost:8080/api/contact/all'); // ✅ Fixed URL

        if (!res.ok) {
            throw new Error(`HTTP error! Status: ${res.status}`);
        }

        const messages = await res.json(); // ✅ Parse JSON

        const html = messages.map(m => `
            <div style="border-bottom: 1px solid #eee; padding: 10px; margin-bottom: 10px;">
                <strong>${m.name}</strong> (${m.email})<br/>
                ${m.message}<br/>
                <small>${new Date(m.submittedAt).toLocaleString()}</small>
            </div>
        `).join('');

        document.getElementById('messagesList').innerHTML = html;

    } catch (err) {
        console.error(err);
        document.getElementById('messagesList').innerHTML = 
            `<div class="alert alert-danger">Error loading messages: ${err.message}</div>`;
    }
}

// Load messages when page loads
loadMessages();