document.addEventListener('DOMContentLoaded', async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const uploadCard = document.getElementById('symo-upload-card');

    // Hiện form Upload nếu là Symo đã đăng nhập
    if (user && uploadCard) {
        uploadCard.style.display = 'block';
    }

    // Tải danh sách bài viết từ bảng 'media_posts' trên Supabase
    loadMediaPosts(user);
});

// 1. HÀM TẢI FILE VÀ ĐĂNG BÀI LÊN SUPABASE
const uploadForm = document.getElementById('upload-form');
if (uploadForm) {
    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const statusText = document.getElementById('upload-status');
        const btnSubmit = document.getElementById('btn-submit-upload');
        
        const title = document.getElementById('media-title').value;
        const imgFile = document.getElementById('img-file').files[0];
        const zipFile = document.getElementById('zip-file').files[0];

        try {
            btnSubmit.disabled = true;
            statusText.innerText = "⏳ Đang tải file lên Supabase Storage...";

            // Upload Ảnh đại diện lên Storage
            const imgFileName = `img_${Date.now()}_${imgFile.name}`;
            const { data: imgData, error: imgErr } = await supabase.storage
                .from('fan-files')
                .upload(imgFileName, imgFile);
            if (imgErr) throw imgErr;

            // Upload File ZIP lên Storage
            const zipFileName = `zip_${Date.now()}_${zipFile.name}`;
            const { data: zipData, error: zipErr } = await supabase.storage
                .from('fan-files')
                .upload(zipFileName, zipFile);
            if (zipErr) throw zipErr;

            // Lấy URL công khai của 2 file vừa upload
            const imgUrl = supabase.storage.from('fan-files').getPublicUrl(imgFileName).data.publicUrl;
            const zipUrl = supabase.storage.from('fan-files').getPublicUrl(zipFileName).data.publicUrl;

            statusText.innerText = "⏳ Đang lưu dữ liệu bài đăng...";

            // Lưu bài viết vào Database table 'media_posts'
            const { error: dbErr } = await supabase
                .from('media_posts')
                .insert([{ title: title, image_url: imgUrl, zip_url: zipUrl, platform: 'tiktok' }]);

            if (dbErr) throw dbErr;

            alert("🎉 Đăng bài và tải file lên Supabase thành công!");
            location.reload();

        } catch (err) {
            alert("Lỗi: " + err.message);
            statusText.innerText = "";
            btnSubmit.disabled = false;
        }
    });
}

// 2. HÀM TỰ ĐỘNG LẤY VÀ HIỂN THỊ BÀI ĐĂNG TỪ SUPABASE
async function loadMediaPosts(currentUser) {
    const mediaList = document.getElementById('media-list');

    const { data: posts, error } = await supabase
        .from('media_posts')
        .select('*')
        .eq('platform', 'tiktok')
        .order('created_at', { ascending: false });

    if (error) {
        mediaList.innerHTML = `<p style="color: var(--danger-color);">Lỗi tải bài: ${error.message}</p>`;
        return;
    }

    if (posts.length === 0) {
        mediaList.innerHTML = '<p style="color: var(--text-muted);">Chưa có bài đăng nào.</p>';
        return;
    }

    mediaList.innerHTML = posts.map(post => `
        <article class="media-card">
            <h3>${escapeHtml(post.title)}</h3>
            <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 10px;">Chạm vào ảnh để xem trực tiếp & thu phóng</p>
            
            <img src="${post.image_url}" alt="${escapeHtml(post.title)}" class="media-preview" onclick="openLightbox('${post.image_url}')">

            <div class="media-actions">
                <a href="${post.zip_url}" download class="btn-download-media">
                    📥 Tải File Gốc (.zip)
                </a>
                ${currentUser ? `<button class="btn btn-exit" style="color: var(--danger-color)" onclick="deleteMediaPost('${post.id}')">🗑️ Xóa bài</button>` : ''}
            </div>
        </article>
    `).join('');
}

// 3. HÀM XÓA BÀI ĐĂNG
async function deleteMediaPost(postId) {
    if (!confirm("Bạn có chắc chắn muốn xóa bài đăng này không?")) return;

    const { error } = await supabase.from('media_posts').delete().eq('id', postId);
    if (error) {
        alert("Xóa thất bại: " + error.message);
    } else {
        alert("Đã xóa bài đăng thành công!");
        location.reload();
    }
}

// 4. LOGIC XEM TRỰC TIẾP & THU PHÓNG (LIGHTBOX)
let currentScale = 1;
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');

function toggleMenu() { document.getElementById('nav-menu').classList.toggle('active'); }
function openLightbox(src) { lightboxImg.src = src; currentScale = 1; lightboxImg.style.transform = `scale(1)`; lightbox.style.display = 'flex'; }
function closeLightbox() { lightbox.style.display = 'none'; }
function zoomIn() { currentScale += 0.3; lightboxImg.style.transform = `scale(${currentScale})`; }
function zoomOut() { if (currentScale > 0.5) { currentScale -= 0.3; lightboxImg.style.transform = `scale(${currentScale})`; } }

function escapeHtml(str) {
    return str.replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
}
