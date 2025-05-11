// DOM Elements
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const togglePasswordButtons = document.querySelectorAll('.toggle-password');

// Toggle Password Visibility
togglePasswordButtons.forEach(button => {
    button.addEventListener('click', function() {
        const input = this.previousElementSibling;
        const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
        input.setAttribute('type', type);
        this.classList.toggle('fa-eye');
        this.classList.toggle('fa-eye-slash');
    });
});

// Login Form Handler
if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const username = this.username.value;
        const password = this.password.value;
        const remember = this.remember.checked;

        try {
            // Hiển thị loading state
            const submitButton = this.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';

            // Gọi API đăng nhập
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password, remember })
            });

            const data = await response.json();

            if (response.ok) {
                // Lưu token vào localStorage nếu remember được chọn
                if (remember) {
                    localStorage.setItem('token', data.token);
                } else {
                    sessionStorage.setItem('token', data.token);
                }

                // Chuyển hướng về trang chủ
                window.location.href = '../index.html';
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            // Hiển thị thông báo lỗi
            alert(error.message || 'Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại sau.');
        } finally {
            // Khôi phục trạng thái nút
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }
    });
}

// Register Form Handler
if (registerForm) {
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const username = this.username.value;
        const email = this.email.value;
        const password = this.password.value;
        const confirmPassword = this.confirmPassword.value;

        // Kiểm tra mật khẩu
        if (password !== confirmPassword) {
            alert('Mật khẩu xác nhận không khớp!');
            return;
        }

        try {
            // Hiển thị loading state
            const submitButton = this.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';

            // Gọi API đăng ký
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password })
            });

            const data = await response.json();

            if (response.ok) {
                alert('Đăng ký thành công! Vui lòng đăng nhập.');
                window.location.href = 'login.html';
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            // Hiển thị thông báo lỗi
            alert(error.message || 'Có lỗi xảy ra khi đăng ký. Vui lòng thử lại sau.');
        } finally {
            // Khôi phục trạng thái nút
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }
    });
}

// Social Login Handlers
document.querySelectorAll('.btn-social').forEach(button => {
    button.addEventListener('click', function() {
        const provider = this.classList.contains('btn-google') ? 'google' : 'facebook';
        // Xử lý đăng nhập bằng mạng xã hội
        window.location.href = `/api/auth/${provider}`;
    });
});