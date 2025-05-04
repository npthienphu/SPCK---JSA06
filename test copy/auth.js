import { AUTH_CONFIG, ERROR_MESSAGES, SUCCESS_MESSAGES } from './config.js';

// DOM Elements
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const passwordToggles = document.querySelectorAll('.toggle-password');

// Toggle password visibility
passwordToggles.forEach(toggle => {
  toggle.addEventListener('click', () => {
    const input = toggle.previousElementSibling;
    const type = input.type === 'password' ? 'text' : 'password';
    input.type = type;
    toggle.querySelector('i').className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
  });
});

// Handle login
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = loginForm.email.value;
    const password = loginForm.password.value;
    
    try {
      // Show loading state
      const submitBtn = loginForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Signing in...';

      // Simulate API call (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Store user data in localStorage
      const userData = {
        username: email.split('@')[0],
        email: email,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(email)}`
      };
      localStorage.setItem('currentUser', JSON.stringify(userData));

      // Show success message
      alert(SUCCESS_MESSAGES.LOGIN_SUCCESS);
      
      // Redirect to home page
      window.location.href = './index.html';
    } catch (error) {
      console.error('Login error:', error);
      alert(ERROR_MESSAGES.LOGIN_FAILED);
    } finally {
      // Reset button state
      const submitBtn = loginForm.querySelector('button[type="submit"]');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Sign In';
    }
  });
}

// Handle registration
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = registerForm.username.value;
    const email = registerForm.email.value;
    const password = registerForm.password.value;
    const confirmPassword = registerForm['confirm-password'].value;
    
    // Validate passwords match
    if (password !== confirmPassword) {
      alert(ERROR_MESSAGES.PASSWORD_MISMATCH);
      return;
    }
    
    try {
      // Show loading state
      const submitBtn = registerForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Creating account...';

      // Simulate API call (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Store user data in localStorage
      const userData = {
        username: username,
        email: email,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(username)}`
      };
      localStorage.setItem('currentUser', JSON.stringify(userData));

      // Show success message
      alert(SUCCESS_MESSAGES.REGISTER_SUCCESS);
      
      // Redirect to home page
      window.location.href = './index.html';
    } catch (error) {
      console.error('Registration error:', error);
      alert(ERROR_MESSAGES.REGISTER_FAILED);
    } finally {
      // Reset button state
      const submitBtn = registerForm.querySelector('button[type="submit"]');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Create Account';
    }
  });
}

// Handle social authentication
document.querySelectorAll('.social-auth button').forEach(button => {
  button.addEventListener('click', async () => {
    const provider = button.classList.contains('google-auth') ? 'google' : 'facebook';
    
    try {
      // Show loading state
      button.disabled = true;
      const originalContent = button.innerHTML;
      button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

      // Simulate social auth (replace with actual social auth)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Store user data in localStorage
      const userData = {
        username: `user_${Math.random().toString(36).substr(2, 9)}`,
        email: `${provider}@example.com`,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${provider}`
      };
      localStorage.setItem('currentUser', JSON.stringify(userData));

      // Show success message
      alert(SUCCESS_MESSAGES.LOGIN_SUCCESS);
      
      // Redirect to home page
      window.location.href = './index.html';
    } catch (error) {
      console.error(`${provider} auth error:`, error);
      alert(ERROR_MESSAGES.SOCIAL_AUTH_FAILED);
    } finally {
      // Reset button state
      button.disabled = false;
      button.innerHTML = originalContent;
    }
  });
});