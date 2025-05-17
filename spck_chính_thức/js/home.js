const API_BASE = 'https://api.jikan.moe/v4';

const animeList = document.getElementById('anime-list');
const animeHot = document.getElementById('anime-hot');
const bannerSlider = document.getElementById('banner-slider');

// Lấy anime mới cập nhật
async function loadNewAnime() {
  const res = await fetch(`${API_BASE}/seasons/now?limit=18`);
  const data = await res.json();
  animeList.innerHTML = data.data.map(anime => `
    <div class="anime-card">
      <a href="./html/anime.html?id=${anime.mal_id}" title="${anime.title}">
        <img src="${anime.images.jpg.image_url}" alt="${anime.title}" />
        <div class="anime-title">${anime.title}</div>
      </a>
    </div>
  `).join('');
}

// Lấy anime hot (top by popularity)
async function loadHotAnime() {
  const res = await fetch(`${API_BASE}/top/anime?filter=bypopularity&limit=12`);
  const data = await res.json();
  animeHot.innerHTML = data.data.map(anime => `
    <div class="anime-card">
      <a href="./html/anime.html?id=${anime.mal_id}" title="${anime.title}">
        <img src="${anime.images.jpg.image_url}" alt="${anime.title}" />
        <div class="anime-title">${anime.title}</div>
      </a>
    </div>
  `).join('');
}

// Banner nổi bật (top airing)
async function loadBanner() {
  const res = await fetch(`${API_BASE}/top/anime?filter=airing&limit=5`);
  const data = await res.json();
  bannerSlider.innerHTML = data.data.map(anime => `
    <div class="banner-item">
      <a href="./html/anime.html?id=${anime.mal_id}" title="${anime.title}">
        <img src="${anime.images.jpg.large_image_url}" alt="${anime.title}" />
        <div class="banner-title">${anime.title}</div>
      </a>
    </div>
  `).join('');
}

loadNewAnime();
loadHotAnime();
loadBanner();