// ══════════════════════════════════════════
//  CONFIGURATION
// ══════════════════════════════════════════

const API_BASE_URL = 'http://127.0.0.1:5000';

// ══════════════════════════════════════════
//  DOM ELEMENTS
// ══════════════════════════════════════════

const signupForm = document.getElementById('signupForm');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');
const signupBtn = document.getElementById('signupBtn');
const googleBtn = document.getElementById('googleBtn');
const facebookBtn = document.getElementById('facebookBtn');
const errorMessage = document.getElementById('errorMessage');
const successMessage = document.getElementById('successMessage');

// ══════════════════════════════════════════
//  CHECK IF ALREADY LOGGED IN
// ══════════════════════════════════════════

window.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('splitpay_token');
    
    if (token) {
        // Verify token is still valid
        verifyToken(token);
    }
});

async function verifyToken(token) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            // Token is valid, redirect to dashboard
            showSuccess('Already logged in! Redirecting...');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } else {
            // Token is invalid, clear it
            localStorage.removeItem('splitpay_token');
            localStorage.removeItem('splitpay_user');
        }
    } catch (error) {
        console.error('Token verification error:', error);
        localStorage.removeItem('splitpay_token');
        localStorage.removeItem('splitpay_user');
    }
}

// ══════════════════════════════════════════
//  SIGN UP FORM
// ══════════════════════════════════════════

signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    // Validation
    if (!name || !email || !password || !confirmPassword) {
        showError('Please fill in all fields');
        return;
    }

    if (!isValidEmail(email)) {
        showError('Please enter a valid email address');
        return;
    }

    if (password.length < 8) {
        showError('Password must be at least 8 characters');
        return;
    }

    if (password !== confirmPassword) {
        showError('Passwords do not match');
        return;
    }

    try {
        setLoading(true);
        hideMessages();

        const response = await fetch(`${API_BASE_URL}/auth/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: name,
                email: email,
                password: password
            })
        });

        const data = await response.json();

        if (response.ok) {
            // Save token and user data
            localStorage.setItem('splitpay_token', data.token);
            localStorage.setItem('splitpay_user', JSON.stringify(data.user));

            showSuccess('Account created successfully! Redirecting...');
            
            // Redirect to dashboard after 1.5 seconds
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        } else {
            showError(data.error || 'Sign up failed. Please try again.');
        }

    } catch (error) {
        console.error('Sign up error:', error);
        showError('Cannot connect to server. Please check your connection.');
    } finally {
        setLoading(false);
    }
});

// ══════════════════════════════════════════
//  SOCIAL SIGN UP (DISABLED - NOT IMPLEMENTED)
// ══════════════════════════════════════════

googleBtn.addEventListener('click', (e) => {
    e.preventDefault();
    showError('Google sign up is not available yet. Please use email/password.');
});

facebookBtn.addEventListener('click', (e) => {
    e.preventDefault();
    showError('Facebook sign up is not available yet. Please use email/password.');
});

// ══════════════════════════════════════════
//  PASSWORD STRENGTH INDICATOR (OPTIONAL)
// ══════════════════════════════════════════

passwordInput.addEventListener('input', () => {
    const password = passwordInput.value;
    // You can add visual password strength indicator here
    if (password.length > 0 && password.length < 8) {
        passwordInput.style.borderColor = '#f59e0b'; // Orange for weak
    } else if (password.length >= 8) {
        passwordInput.style.borderColor = '#22c55e'; // Green for strong
    }
});

confirmPasswordInput.addEventListener('input', () => {
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    
    if (confirmPassword.length > 0) {
        if (password === confirmPassword) {
            confirmPasswordInput.style.borderColor = '#22c55e'; // Green - match
        } else {
            confirmPasswordInput.style.borderColor = '#ef4444'; // Red - no match
        }
    }
});

// ══════════════════════════════════════════
//  HELPER FUNCTIONS
// ══════════════════════════════════════════

function setLoading(loading) {
    signupBtn.disabled = loading;
    if (loading) {
        signupBtn.classList.add('loading');
        signupBtn.textContent = 'Creating account...';
    } else {
        signupBtn.classList.remove('loading');
        signupBtn.textContent = 'Sign Up';
    }
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
    setTimeout(() => {
        errorMessage.classList.remove('show');
    }, 5000);
}

function showSuccess(message) {
    successMessage.textContent = message;
    successMessage.classList.add('show');
}

function hideMessages() {
    errorMessage.classList.remove('show');
    successMessage.classList.remove('show');
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}