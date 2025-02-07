document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));

            tab.classList.add('active');
            document.getElementById(tab.dataset.tab).classList.add('active');
        });
    });

    const backendUrl = 'https://your-app-name.onrender.com'; // Replace with your Render app URL

    // Handle registration form submission
    document.getElementById('registerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const numeroImmatriculation = document.getElementById('numeroImmatriculationRegister').value;
        const email = document.getElementById('emailRegister').value;
        const password = document.getElementById('passwordRegister').value;

        try {
            const response = await fetch(`${backendUrl}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ numeroImmatriculation, email, password })
            });

            const data = await response.json();
            if (data.success) {
                alert('Registration successful');
                window.location.href = 'auth.html';
            } else {
                alert('Registration failed: ' + data.message);
            }
        } catch (error) {
            console.error('Error during registration:', error);
            alert('An error occurred during registration');
        }
    });

    // Handle login form submission
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const numeroImmatriculation = document.getElementById('numeroImmatriculationLogin').value;
        const password = document.getElementById('passwordLogin').value;

        try {
            const response = await fetch(`${backendUrl}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ numeroImmatriculation, password })
            });

            const data = await response.json();
            if (data.success) {
                alert('Login successful');
                localStorage.setItem('token', data.token);
                window.location.href = 'profile.html';
            } else {
                alert('Login failed: ' + data.message);
            }
        } catch (error) {
            console.error('Error during login:', error);
            alert('An error occurred during login');
        }
    });
});