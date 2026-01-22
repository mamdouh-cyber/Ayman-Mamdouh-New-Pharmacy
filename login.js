// Login functionality

// Check if user is logged in
function checkLoginStatus() {
    return localStorage.getItem('user') !== null;
}

// Get user data
function getUserData() {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
}

// Login function
async function login(username, password) {
    try {
        const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            // Store user data in localStorage
            localStorage.setItem('user', JSON.stringify(result.user));
            return { success: true, user: result.user };
        } else {
            return { success: false, message: result.message };
        }
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, message: 'حدث خطأ في الاتصال بالخادم' };
    }
}

// Event listener for login form
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.querySelector('form');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            const result = await login(username, password);
            
            if (result.success) {
                alert('تم تسجيل الدخول بنجاح!');
                
                // Redirect based on user role
                const user = result.user;
                if (user.role === 'admin') {
                    window.location.href = 'admin.html'; // Admin goes to admin panel
                } else {
                    window.location.href = 'medicine.html'; // Regular users go to medicine page
                }
            } else {
                alert(result.message || 'اسم المستخدم او كلمة المرور غير صحيحة');
            }
        });
    }
});