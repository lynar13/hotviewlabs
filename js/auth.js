// Event listener for DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
   

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
            const { accessToken, refreshToken } = data.data;
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            alert('Login Successful! You can now manage your posts.');
            window.location.href = '/post/edit.html';
        } else {
            alert('Login failed: ' + (data.errors ? data.errors.map(error => error.message).join(', ') : 'Unknown error'));
        }
    } catch (error) {
        console.error('Error during login:', error);
        alert('Login failed');
    }
}

// Function to refresh the access token
async function refreshAccessToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
        return null;
    }

    try {
        const response = await fetch('https://v2.api.noroff.dev/auth/refresh', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken })
        });

        const data = await response.json();
        if (response.ok) {
            const newAccessToken = data.data.accessToken;
            localStorage.setItem('accessToken', newAccessToken);
            return newAccessToken;
        } else {
            console.error('Error refreshing access token:', data.errors);
            logout();
        }
    } catch (error) {
        console.error('Error during token refresh:', error);
        logout();
    }
    return null;
}

// Function to get the access token from local storage
function getAccessToken() {
    return localStorage.getItem('accessToken');
}

// Function to check if the user is logged in
async function checkLogin() {
    let token = getAccessToken();
    if (!token) {
        window.location.href = '/account/login.html';
        return;
    }
    token = await refreshAccessToken();
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
