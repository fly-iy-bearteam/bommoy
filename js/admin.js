document.addEventListener('DOMContentLoaded', async () => {
    // Kiểm tra tài khoản đã đăng nhập chưa
    const { data: { user } } = await supabase.auth.getUser();
    
    const lockMsg = document.getElementById('admin-lock-msg');
    const dashboard = document.getElementById('admin-dashboard');

    if (user) {
        if (lockMsg) lockMsg.style.display = 'none';
        if (dashboard) dashboard.style.display = 'block';
    } else {
        if (lockMsg) lockMsg.style.display = 'block';
        if (dashboard) dashboard.style.display = 'none';
    }
});

// 1. XỬ LÝ ĐĂNG THÔNG BÁO CHUNG (thongbao.html)
const noticeForm = document.getElementById('admin-post-notice-form');
if (noticeForm) {
    noticeForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('notice-title').value;
        const content = document.getElementById('notice-content').value;

        const { error } = await supabase
            .from('posts')
            .insert([{ title, content }]);

        if (error) {
            alert("Đăng thông báo thất bại: " + error.message);
        } else {
            alert("🎉 Đã đăng thông báo thành công!");
            window.location.href = "thongbao.html";
        }
    });
}

// 2. XỬ LÝ ĐĂNG BÀI TIKTOK/DOUYIN & UPLOAD FILE LÊN STORAGE
const mediaForm = document.getElementById('admin-upload-media-form');
if (mediaForm) {
    mediaForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const status = document.getElementById('admin-upload-status');
        const btn = document.getElementById('btn-admin-submit');

        const platform = document.getElementById('media-platform').value;
        const title = document.getElementById('media-title').value;
        const imgFile = document.getElementById('media-img').files[0];
        const zipFile = document.getElementById('media-zip').files[0];

        try {
            btn.disabled = true;
            status.innerText = "⏳ Đang tải File lên Supabase Storage...";

            // Upload Ảnh đại diện
            const imgName = `img_${Date.now()}_${imgFile.name}`;
            const { error: imgErr } = await supabase.storage
                .from('fan-files')
                .upload(imgName, imgFile);
            if (imgErr) throw imgErr;

            // Upload File ZIP
            const zipName = `zip_${Date.now()}_${zipFile.name}`;
            const { error: zipErr } = await supabase.storage
                .from('fan-files')
                .upload(zipName, zipFile);
            if (zipErr) throw zipErr;

            // Lấy Link URL công khai
            const imgUrl = supabase.storage.from('fan-files').getPublicUrl(imgName).data.publicUrl;
            const zipUrl = supabase.storage.from('fan-files').getPublicUrl(zipName).data.publicUrl;

            status.innerText = "⏳ Đang lưu dữ liệu bài đăng...";

            // Lưu vào Bảng media_posts
            const { error: dbErr } = await supabase
                .from('media_posts')
                .insert([{ title, image_url: imgUrl, zip_url: zipUrl, platform }]);

            if (dbErr) throw dbErr;

            alert(`🎉 Đăng bài lên ${platform.toUpperCase()} thành công!`);
            window.location.href = `${platform}.html`;

        } catch (err) {
            alert("Lỗi: " + err.message);
            status.innerText = "";
            btn.disabled = false;
        }
    });
                                                 }
