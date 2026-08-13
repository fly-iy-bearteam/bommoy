const loginForm = document.getElementById('login-form');
const errorMsg = document.getElementById('auth-error');

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // Gọi API Supabase để đăng nhập
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) {
            errorMsg.innerText = "Đăng nhập thất bại: " + error.message;
        } else {
            alert("Đăng nhập thành công!");
            window.location.href = "thongbao.html";
        }
    });
}

// Hàm kiểm tra trạng thái đăng nhập
async function getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

// Hàm đăng xuất
async function logout() {
    await supabase.auth.signOut();
    alert("Đã đăng xuất!");
    window.location.href = "index.html";
}
