// Function to log in the user
async function login(email, password) {
    try {
        const response = await fetch('https://v2.api.noroff.dev/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        if (response.ok) {
            // Assuming the API returns accessToken and refreshToken
            const accessToken = data.data.accessToken;

            // Store the tokens in local storage
            localStorage.setItem('accessToken', accessToken);

            // Refresh the access token
            const newAccessToken = await refreshAccessToken();

            // Store the access token in local storage
            localStorage.setItem('accessToken', newAccessToken);

            // Show success message
            alert('Login Successful! You can now manage your posts.');

            // Redirect to manage-posts.html
            window.location.href = '/post/edit.html';
        } else {
            // Handle errors, for example:
            alert('Login failed: ' + (data.errors ? data.errors.map(error => error.message).join(', ') : 'Unknown error'));
        }
    } catch (error) {
        console.error('Error during login:', error);
        alert('Login failed');
    }
}

// Function to refresh the access token
async function refreshAccessToken() {
    try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await fetch('https://v2.api.noroff.dev/auth/refresh', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken })
        });

        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('accessToken', data.accessToken);
            return data.accessToken;
        } else {
            throw new Error('Failed to refresh token');
        }
    } catch (error) {
        console.error('Error refreshing access token:', error);
        logout();
    }
}

// Function to get the access token from local storage
function getAccessToken() {
    return localStorage.getItem('accessToken');
}

// Function to check if the user is logged in
function checkLogin() {
    const token = getAccessToken();
    if (!token) {
        window.location.href = '/account/login.html';
    }
}

// Function to log out the user
function logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/account/login.html';
}

// Function to register a new user
async function register(name, email, password) {
    try {
        const payload = {
            name,
            email,
            bio: "",
            avatar: {
                url: "",
                alt: ""
            },
            banner: {
                url: "",
                alt: ""
            },
            venueManager: true,
            password
        };
        const response = await fetch('https://v2.api.noroff.dev/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        if (response.ok) {
            alert('Registration successful. Please log in.');
            window.location.href = '/account/login.html';
        } else {
            alert('Registration failed: ' + (data.errors ? data.errors.map(error => error.message).join(', ') : 'Unknown error'));
        }
    } catch (error) {
        console.error('Error during registration:', error);
        alert('Registration failed');
    }
}

// Event listener for DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('/post/edit.html') || window.location.pathname.includes('/post/index.html')) {
        checkLogin();
    }

    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async event => {
            event.preventDefault();
            const email = event.target.email.value;
            const password = event.target.password.value;
            await login(email, password);
        });
    }

    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async event => {
            event.preventDefault();
            const name = event.target.name.value;
            const email = event.target.email.value;
            const password = event.target.password.value;
            await register(name, email, password);
        });
    }
});
