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

async function loadAnimeInfo() {
  if (!animeId) {
    watchInfo.innerHTML = '<p>Không tìm thấy anime!</p>';
    return;
  }
  const res = await fetch(`${API_BASE}/anime/${animeId}/full`);
  const data = await res.json();
  const anime = data.data;

  watchInfo.innerHTML = `
    <div class="watch-title">
      <h1>${anime.title}</h1>
      <span class="watch-score">⭐ ${anime.score || 'N/A'}</span>
    </div>
    <div class="watch-meta">
      <span><b>Thể loại:</b> ${anime.genres.map(g => g.name).join(', ')}</span>
      <span><b>Số tập:</b> ${anime.episodes || 'N/A'}</span>
      <span><b>Trạng thái:</b> ${anime.status || 'N/A'}</span>
    </div>
  `;
}

// Giả lập player (vì Jikan không cung cấp link video, bạn có thể tích hợp player thật sau)
function renderFakePlayer() {
  videoPlayer.innerHTML = `
    <div class="fake-player">
      <div class="fake-screen">
        <span>Player demo<br>(Bạn có thể tích hợp player thật hoặc nhúng iframe ở đây)</span>
      </div>
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
    <h2>Danh sách tập</h2>
    <div class="episodes-grid">
      ${data.data.map(ep => `
        <a class="episode-item${ep.mal_id == epId ? ' active' : ''}" href="./watch.html?id=${animeId}&ep=${ep.mal_id}">
          Tập ${ep.mal_id} ${ep.title ? '- ' + ep.title : ''}
        </a>
      `).join('')}
    </div>
  `;
}

loadAnimeInfo();
renderFakePlayer();
loadEpisodes();
