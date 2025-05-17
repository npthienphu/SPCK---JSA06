const API_BASE = 'https://api.jikan.moe/v4';

function getQueryParam(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

const animeId = getQueryParam('id');
const animeDetail = document.getElementById('anime-detail');
const episodesList = document.getElementById('episodes-list');

async function loadAnimeDetail() {
  if (!animeId) {
    animeDetail.innerHTML = '<p>Không tìm thấy anime!</p>';
    return;
  }
  animeDetail.innerHTML = '<div class="loading">Đang tải thông tin anime...</div>';
  try {
    const res = await fetch(`${API_BASE}/anime/${animeId}/full`);
    if (!res.ok) throw new Error('Lỗi mạng');
    const data = await res.json();
    const anime = data.data;
    animeDetail.innerHTML = `
      <div class="anime-info-flex">
        <img class="anime-cover" src="${anime.images.jpg.large_image_url}" alt="${anime.title}" />
        <div class="anime-info">
          <h1>${anime.title}</h1>
          <div class="anime-meta">
            <span><b>Điểm:</b> ${anime.score || 'N/A'}</span>
            <span><b>Số tập:</b> ${anime.episodes || 'N/A'}</span>
            <span><b>Trạng thái:</b> ${anime.status || 'N/A'}</span>
          </div>
          <div class="anime-genres">
            ${anime.genres.map(g => `<span class="genre">${g.name}</span>`).join(' ')}
          </div>
          <p class="anime-desc">${anime.synopsis || 'Không có mô tả.'}</p>
          <a class="watch-btn" href="./watch.html?id=${anime.mal_id}">Xem phim</a>
        </div>
      </div>
    `;
  } catch (err) {
    animeDetail.innerHTML = '<div class="error">Không thể tải dữ liệu anime. Vui lòng thử lại sau.</div>';
  }
}

// Lấy danh sách tập (nếu có)
async function loadEpisodes() {
  if (!animeId) return;
  episodesList.innerHTML = '<div class="loading">Đang tải danh sách tập...</div>';
  try {
    const res = await fetch(`${API_BASE}/anime/${animeId}/episodes`);
    if (!res.ok) throw new Error('Lỗi mạng');
    const data = await res.json();
    if (!data.data || data.data.length === 0) {
      episodesList.innerHTML = '';
      return;
    }
    episodesList.innerHTML = `
      <h2>Danh sách tập</h2>
      <div class="episodes-grid">
        ${data.data.map(ep => `
          <a class="episode-item" href="./watch.html?id=${animeId}&ep=${ep.mal_id}">
            Tập ${ep.mal_id} - ${ep.title || ''}
          </a>
        `).join('')}
      </div>
    `;
  } catch (err) {
    episodesList.innerHTML = '<div class="error">Không thể tải danh sách tập. Vui lòng thử lại sau.</div>';
  }
}

loadAnimeDetail();
loadEpisodes();