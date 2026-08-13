document.addEventListener('DOMContentLoaded', async () => {
    const user = await getCurrentUser();
    const adminPanel = document.getElementById('admin-post-panel');
    const navLogin = document.getElementById('nav-login');
    const navLogout = document.getElementById('nav-logout');

    // Cập nhật giao diện theo trạng thái đăng nhập
    if (user) {
        if (adminPanel) adminPanel.style.display = 'block';
        if (navLogin) navLogin.style.display = 'none';
        if (navLogout) navLogout.style.display = 'inline-block';
    }

    // Tải danh sách bài viết từ bảng 'posts' trên Supabase
    loadPosts(user);
});

// Hàm lấy dữ liệu bài đăng từ Supabase
async function loadPosts(currentUser) {
    const postsList = document.getElementById('posts-list');

    const { data: posts, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        postsList.innerHTML = `<p class="error-msg">Không thể tải bài đăng: ${error.message}</p>`;
        return;
    }

    if (posts.length === 0) {
        postsList.innerHTML = '<p>Hiện chưa có thông báo nào.</p>';
        return;
    }

    postsList.innerHTML = posts.map(post => `
        <article class="post-card">
            <h3>${escapeHtml(post.title)}</h3>
            <span class="post-date">${new Date(post.created_at).toLocaleString('vi-VN')}</span>
            <p>${escapeHtml(post.content)}</p>
            ${currentUser ? `<button class="btn-danger" onclick="deletePost('${post.id}')">🗑️ Xóa bài đăng</button>` : ''}
        </article>
    `).join('');
}

// Xử lý gửi form đăng bài mới
const createPostForm = document.getElementById('create-post-form');
if (createPostForm) {
    createPostForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('post-title').value;
        const content = document.getElementById('post-content').value;

        const { error } = await supabase
            .from('posts')
            .insert([{ title, content }]);

        if (error) {
            alert("Đăng bài thất bại: " + error.message);
        } else {
            alert("Đã đăng thông báo thành công!");
            location.reload();
        }
    });
}

// Hàm xóa bài đăng dành cho Symo
async function deletePost(postId) {
    if (!confirm("Bạn có chắc chắn muốn xóa bài đăng này không?")) return;

    const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

    if (error) {
        alert("Xóa thất bại: " + error.message);
    } else {
        alert("Đã xóa bài đăng thành công!");
        location.reload();
    }
}

// Hàm chống lỗi XSS bảo mật cho văn bản
function escapeHtml(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}
