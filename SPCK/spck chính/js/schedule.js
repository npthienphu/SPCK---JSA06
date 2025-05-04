import { API_CONFIG } from './config.js';

// DOM Elements
const scheduleTabs = document.querySelectorAll('.schedule-tab');
const scheduleDays = document.querySelectorAll('.schedule-day');

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

// Create anime card element
function createAnimeCard(anime) {
  const card = document.createElement('div');
  card.className = 'schedule-anime-card';
  card.innerHTML = `
    <img 
      src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='400' viewBox='0 0 300 400'%3E%3Crect width='300' height='400' fill='%232d2d2d'/%3E%3C/svg%3E"
      data-src="${anime.images.jpg.image_url}" 
      alt="${anime.title}" 
      loading="lazy"
    >
    <div class="schedule-anime-card-info">
      <h3 class="schedule-anime-card-title">${anime.title}</h3>
      <div class="schedule-anime-card-meta">
        <div class="schedule-anime-card-time">
          <i class="fas fa-clock"></i>
          <span>${anime.broadcast.time || 'TBA'}</span>
        </div>
        <div class="schedule-anime-card-episodes">
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

// Load schedule for a specific day
async function loadSchedule(day) {
  const grid = document.querySelector(`#${day} .anime-grid`);
  
  try {
    // Show loading state
    grid.innerHTML = '';
    for (let i = 0; i < 6; i++) {
      const skeleton = document.createElement('div');
      skeleton.className = 'schedule-anime-card loading';
      skeleton.innerHTML = `
        <div class="loading-skeleton" style="height: 300px;"></div>
        <div class="schedule-anime-card-info">
          <div class="loading-skeleton" style="height: 20px; margin-bottom: 10px;"></div>
          <div class="loading-skeleton" style="height: 20px;"></div>
        </div>
      `;
      grid.appendChild(skeleton);
    }

    // Fetch schedule
    const data = await fetchWithCache(`${API_CONFIG.BASE_URL}/schedules?filter=${day}`);
    
    // Update grid
    grid.innerHTML = '';
    data.data.forEach(anime => {
      const card = createAnimeCard(anime);
      grid.appendChild(card);
    });
  } catch (error) {
    console.error(`Error loading ${day} schedule:`, error);
    grid.innerHTML = '<p class="error-message">Failed to load schedule. Please try again later.</p>';
  }
}

// Switch between days
function switchDay(day) {
  // Update tabs
  scheduleTabs.forEach(tab => {
    tab.classList.toggle('active', tab.dataset.day === day);
  });

  // Update content
  scheduleDays.forEach(content => {
    content.classList.toggle('active', content.id === day);
  });

  // Load schedule if not already loaded
  const grid = document.querySelector(`#${day} .anime-grid`);
  if (!grid.children.length) {
    loadSchedule(day);
  }
}

// Event Listeners
scheduleTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    switchDay(tab.dataset.day);
  });
});

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
  // Get current day
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const today = days[new Date().getDay()];
  
  // Switch to current day
  switchDay(today);
}); 