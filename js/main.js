// Kiểm tra xác minh độ tuổi
function acceptAge() {
    document.getElementById('age-modal').style.display = 'none';
    localStorage.setItem('age_verified', 'true');
}

window.onload = function() {
    if (localStorage.getItem('age_verified') !== 'true') {
        document.getElementById('age-modal').style.display = 'flex';
    }
};

// Hàm xóa bài đăng áp dụng cho Symo (Admin) tại thongbao.html
async function deletePost(postId) {
    const user = supabase.auth.user();
    
    if (!user) {
        alert("Bạn cần đăng nhập tài khoản Symo để thực hiện quyền này!");
        return;
    }

    const confirmDelete = confirm("Bạn có chắc chắn muốn xóa bài đăng này?");
    if (confirmDelete) {
        const { data, error } = await supabase
            .from('posts')
            .delete()
            .eq('id', postId);

        if (error) {
            alert("Lỗi khi xóa bài: " + error.message);
        } else {
            alert("Đã xóa bài đăng thành công!");
            location.reload(); // Tải lại trang để cập nhật danh sách
        }
    }
}
