import { API_CONFIG, ANIME_CATEGORIES, LOADING_STATES } from './config.js';

// DOM Elements
const heroImage = document.getElementById('hero-image');
const heroTitle = document.getElementById('hero-title');
const heroDescription = document.getElementById('hero-description');
const watchNowBtn = document.getElementById('watch-now-btn');
const viewInfoBtn = document.getElementById('view-info-btn');
const trendingAnimeGrid = document.getElementById('trending-anime');
const newEpisodesGrid = document.getElementById('new-episodes');
const popularAnimeGrid = document.getElementById('popular-anime');

// Cache for API responses
const cache = new Map();
let isFetching = false;

// Debounce function to limit API calls
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Fetch data from API with caching and rate limiting
async function fetchWithCache(url) {
  if (isFetching) {
    return new Promise(resolve => setTimeout(() => resolve(fetchWithCache(url)), 1000));
  }

  if (cache.has(url)) {
    const { data, timestamp } = cache.get(url);
    if (Date.now() - timestamp < API_CONFIG.CACHE_DURATION) {
      return data;
    }
  }

  try {
    isFetching = true;
    const response = await fetch(url);
    if (!response.ok) throw new Error('API request failed');
    
    const data = await response.json();
    cache.set(url, { data, timestamp: Date.now() });
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  } finally {
    isFetching = false;
  }
}

// Create anime card element with lazy loading
function createAnimeCard(anime) {
  const card = document.createElement('div');
  card.className = 'anime-card';
  card.innerHTML = `
    <img 
      src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='400' viewBox='0 0 300 400'%3E%3Crect width='300' height='400' fill='%232d2d2d'/%3E%3C/svg%3E"
      data-src="${anime.images.jpg.image_url}" 
      alt="${anime.title}" 
      loading="lazy"
    >
    <div class="anime-card-info">
      <h3 class="anime-card-title">${anime.title}</h3>
      <div class="anime-card-meta">
        <div class="anime-card-rating">
          <i class="fas fa-star"></i>
          <span>${anime.score || 'N/A'}</span>
        </div>
        <div class="anime-card-episodes">
          <i class="fas fa-play-circle"></i>
          <span>${anime.episodes || 'N/A'} eps</span>
        </div>
      </div>
    </div>
  `;

  card.addEventListener('click', () => {
    window.location.href = `./anime.html?id=${anime.mal_id}`;
  });

  return card;
}

// Update hero section with featured anime
async function updateHeroSection() {
  try {
    const data = await fetchWithCache(`${API_CONFIG.BASE_URL}/top/anime?limit=1`);
    const anime = data.data[0];
    
    heroImage.src = anime.images.jpg.large_image_url;
    heroTitle.textContent = anime.title;
    heroDescription.textContent = anime.synopsis;
    
    watchNowBtn.href = `./watch.html?id=${anime.mal_id}`;
    viewInfoBtn.href = `./anime.html?id=${anime.mal_id}`;
  } catch (error) {
    console.error('Error updating hero section:', error);
  }
}

// Load anime grid with pagination
async function loadAnimeGrid(gridElement, category, page = 1) {
  try {
    const data = await fetchWithCache(`${API_CONFIG.BASE_URL}/top/anime?limit=12&page=${page}`);
    gridElement.innerHTML = '';
    
    // Create loading skeletons
    for (let i = 0; i < 12; i++) {
      const skeleton = document.createElement('div');
      skeleton.className = 'anime-card loading';
      skeleton.innerHTML = `
        <div class="loading-skeleton" style="height: 300px;"></div>
        <div class="anime-card-info">
          <div class="loading-skeleton" style="height: 20px; margin-bottom: 10px;"></div>
          <div class="loading-skeleton" style="height: 20px;"></div>
        </div>
      `;
      gridElement.appendChild(skeleton);
    }

    // Replace skeletons with actual content
    setTimeout(() => {
      gridElement.innerHTML = '';
      data.data.forEach(anime => {
        const card = createAnimeCard(anime);
        gridElement.appendChild(card);
      });
    }, 500);
  } catch (error) {
    console.error(`Error loading ${category} anime:`, error);
    gridElement.innerHTML = '<p class="error-message">Failed to load anime. Please try again later.</p>';
  }
}

// Initialize page with staggered loading
async function initializePage() {
  // Show loading state
  document.body.classList.add('loading');
  
  try {
    // Load hero section first
    await updateHeroSection();
    
    // Then load grids one by one
    await loadAnimeGrid(trendingAnimeGrid, ANIME_CATEGORIES.TRENDING);
    await new Promise(resolve => setTimeout(resolve, 500));
    await loadAnimeGrid(newEpisodesGrid, ANIME_CATEGORIES.UPCOMING);
    await new Promise(resolve => setTimeout(resolve, 500));
    await loadAnimeGrid(popularAnimeGrid, ANIME_CATEGORIES.POPULAR);
  } catch (error) {
    console.error('Error initializing page:', error);
  } finally {
    // Hide loading state
    document.body.classList.remove('loading');
  }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', initializePage);

// Intersection Observer for lazy loading
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      observer.unobserve(img);
    }
  });
}, {
  rootMargin: '50px 0px',
  threshold: 0.1
});

// Add lazy loading to all images
document.querySelectorAll('img[data-src]').forEach(img => observer.observe(img));
