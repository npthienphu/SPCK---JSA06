import { API_CONFIG } from './config.js';

// DOM Elements
const genresGrid = document.getElementById('genres-grid');

// Cache for API responses
const cache = new Map();
let isFetching = false;

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

// Create genre card element
function createGenreCard(genre) {
  const card = document.createElement('div');
  card.className = 'genre-card';
  card.innerHTML = `
    <img 
      src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='400' viewBox='0 0 300 400'%3E%3Crect width='300' height='400' fill='%232d2d2d'/%3E%3C/svg%3E"
      data-src="${genre.images.jpg.image_url}" 
      alt="${genre.name}" 
      loading="lazy"
    >
    <div class="genre-card-info">
      <h3 class="genre-card-title">${genre.name}</h3>
      <div class="genre-card-count">${genre.count} anime</div>
    </div>
  `;

  card.addEventListener('click', () => {
    window.location.href = `./genre.html?id=${genre.mal_id}&name=${encodeURIComponent(genre.name)}`;
  });

  return card;
}

// Load genres
async function loadGenres() {
  try {
    // Show loading state
    genresGrid.innerHTML = '';
    for (let i = 0; i < 12; i++) {
      const skeleton = document.createElement('div');
      skeleton.className = 'genre-card loading';
      skeleton.innerHTML = `
        <div class="loading-skeleton" style="height: 150px;"></div>
      `;
      genresGrid.appendChild(skeleton);
    }

    // Fetch genres
    const data = await fetchWithCache(`${API_CONFIG.BASE_URL}/genres/anime`);
    
    // Update grid
    genresGrid.innerHTML = '';
    data.data.forEach(genre => {
      const card = createGenreCard(genre);
      genresGrid.appendChild(card);
    });
  } catch (error) {
    console.error('Error loading genres:', error);
    genresGrid.innerHTML = '<p class="error-message">Failed to load genres. Please try again later.</p>';
  }
}

// Initialize page
document.addEventListener('DOMContentLoaded', loadGenres); 