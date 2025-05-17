const API_BASE = 'https://api.jikan.moe/v4';

function getQueryParam(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

const animeId = getQueryParam('id');
const epId = getQueryParam('ep'); // Nếu có, sẽ nhảy đến tập cụ thể

const watchInfo = document.getElementById('watch-info');
const videoPlayer = document.getElementById('video-player');
const episodesList = document.getElementById('episodes-list');

// Hàm render player thực tế (dùng 2embed demo, bạn có thể thay link khác nếu có)
function renderRealPlayer() {
  let embedUrl = animeId ? `https://www.2embed.cc/embed/${animeId}` : '';
  videoPlayer.innerHTML = `
    <div class="real-player-container" style="display:flex;justify-content:center;margin:2rem 0;">
      <div class="real-player-frame" style="background:#181a20;border-radius:18px;box-shadow:0 4px 24px #0006;padding:1rem;max-width:900px;width:100%;">
        <iframe 
          width="100%" 
          height="500" 
          src="${embedUrl}" 
          frameborder="0" 
          allowfullscreen
          style="border-radius:12px;background:#000;min-height:320px;display:block;margin:auto;">
        </iframe>
        <div style="text-align:center;color:#aaa;font-size:0.98rem;margin-top:0.5rem;">
          Nếu không phát được video, hãy thử tải lại trang hoặc chọn tập khác.
        </div>
      </div>
    </div>
  `;
}

// Lấy thông tin anime và render
async function loadAnimeInfo() {
  if (!animeId) {
    watchInfo.innerHTML = '<p>Không tìm thấy anime!</p>';
    return;
  }
  const res = await fetch(`${API_BASE}/anime/${animeId}/full`);
  const data = await res.json();
  const anime = data.data;

  watchInfo.innerHTML = `
    <div class="watch-title" style="font-size:2.2rem;font-weight:800;color:#ff4d4d;margin-bottom:0.5rem;">
      ${anime.title}
      <span style="font-size:1.1rem;background:#ff4d4d;color:#fff;padding:0.3rem 1rem;border-radius:1rem;margin-left:1rem;vertical-align:middle;display:inline-block;">
        <span style="font-size:1.2em;vertical-align:middle;">&#11088;</span> ${anime.score || 'N/A'}
      </span>
    </div>
    <div class="watch-meta" style="font-size:1.1rem;color:#fff;margin-bottom:0.7rem;">
      <span><b>Thể loại:</b> ${anime.genres.map(g => g.name).join(', ')}</span>
      <span style="margin-left:2rem;"><b>Số tập:</b> ${anime.episodes || 'N/A'}</span>
      <span style="margin-left:2rem;"><b>Trạng thái:</b> ${anime.status || 'N/A'}</span>
    </div>
    <div class="watch-desc" style="background:#23252b;color:#eee;padding:1.2rem 1.5rem;border-radius:12px;line-height:1.7;font-size:1.08rem;max-width:900px;margin-bottom:1.5rem;">
      <b>Mô tả:</b> ${anime.synopsis || 'Không có mô tả.'}
    </div>
  `;
}

// Lấy danh sách tập
async function loadEpisodes() {
  if (!animeId) return;
  const res = await fetch(`${API_BASE}/anime/${animeId}/episodes`);
  const data = await res.json();
  if (!data.data || data.data.length === 0) {
    episodesList.innerHTML = '';
    return;
  }
  episodesList.innerHTML = `
    <h2 style="color:#ff4d4d;margin-bottom:1rem;">Danh sách tập</h2>
    <div class="episodes-grid">
      ${data.data.map(ep => `
        <a class="episode-item${ep.mal_id == epId ? ' active' : ''}" href="./watch.html?id=${animeId}&ep=${ep.mal_id}">
          Tập ${ep.mal_id} ${ep.title ? '- ' + ep.title : ''}
        </a>
      `).join('')}
    </div>
  `;
}

// Bình luận đơn giản (localStorage, giống watch1.js)
function renderComments() {
  let out = '';
  const comments = JSON.parse(localStorage.getItem(`comments-${animeId}`) || '[]');
  comments.forEach(comment => {
    out += `
      <div class="comment-item" style="background:#23252b;padding:0.7rem 1rem;border-radius:8px;margin-bottom:0.7rem;">
        <strong style="color:#ff4d4d;">${comment.user.username}</strong>
        <p style="margin:0.3rem 0 0.2rem 0;">${comment.title}</p>
        <span style="font-size:0.8em;color:#aaa;">${new Date(comment.createdAt).toLocaleString()}</span>
      </div>
    `;
  });
  let commentBox = document.getElementById('comment-box-container');
  if (commentBox) commentBox.innerHTML = out;
}

function setupCommentBox() {
  // Thêm form bình luận vào dưới videoPlayer
  let commentBox = document.createElement('div');
  commentBox.id = 'comment-box-container';
  commentBox.style = 'max-width:900px;margin:2rem auto 0 auto;padding:1.5rem 1rem;background:#181a20;border-radius:14px;box-shadow:0 2px 8px #0002;';
  commentBox.innerHTML = `
    <form id="comment-form" autocomplete="off" style="display:flex;gap:1rem;margin-bottom:1.2rem;">
      <input required type="text" placeholder="Nhập bình luận..." id="comment" name="comment" style="flex:1;padding:0.7rem 1rem;border-radius:8px;border:none;background:#23252b;color:#fff;" />
      <button type="submit" style="background:#ff4d4d;color:#fff;border:none;padding:0.7rem 1.5rem;border-radius:8px;font-weight:bold;cursor:pointer;">Gửi</button>
    </form>
    <div id="comments"></div>
  `;
  videoPlayer.insertAdjacentElement('afterend', commentBox);
  document.getElementById('comment-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const title = this.comment.value.trim();
    this.comment.value = '';
    const user = { username: 'Khách' };
    const existingComments = JSON.parse(localStorage.getItem(`comments-${animeId}`) || '[]');
    existingComments.push({ title, user, createdAt: Date.now() });
    localStorage.setItem(`comments-${animeId}`, JSON.stringify(existingComments));
    renderComments();
  });
  renderComments();
}

loadAnimeInfo();
renderRealPlayer();
loadEpisodes();
setupCommentBox();
