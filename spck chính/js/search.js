import { API_CONFIG, LOADING_STATES } from './config.js';

// DOM Elements
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const typeFilter = document.getElementById('type-filter');
const statusFilter = document.getElementById('status-filter');
const ratingFilter = document.getElementById('rating-filter');
const searchResultsGrid = document.getElementById('search-results-grid');
const pagination = document.getElementById('pagination');

// State
let currentPage = 1;
let totalPages = 1;
let currentQuery = '';
let currentFilters = {
  type: '',
  status: '',
  rating: ''
};

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

// Create anime card element
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

// Update pagination
function updatePagination() {
  pagination.innerHTML = '';
  
  // Previous button
  const prevBtn = document.createElement('button');
  prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
  prevBtn.disabled = currentPage === 1;
  prevBtn.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      performSearch();
    }
  });
  pagination.appendChild(prevBtn);

  // Page numbers
  const maxPages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxPages / 2));
  let endPage = Math.min(totalPages, startPage + maxPages - 1);

  if (endPage - startPage + 1 < maxPages) {
    startPage = Math.max(1, endPage - maxPages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    const pageBtn = document.createElement('button');
    pageBtn.textContent = i;
    pageBtn.classList.toggle('active', i === currentPage);
    pageBtn.addEventListener('click', () => {
      currentPage = i;
      performSearch();
    });
    pagination.appendChild(pageBtn);
  }

  // Next button
  const nextBtn = document.createElement('button');
  nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.addEventListener('click', () => {
    if (currentPage < totalPages) {
      currentPage++;
      performSearch();
    }
  });
  pagination.appendChild(nextBtn);
}

// Perform search
async function performSearch() {
  try {
    searchResultsGrid.innerHTML = '';
    
    // Show loading state
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
      searchResultsGrid.appendChild(skeleton);
    }

    // Build query parameters
    const params = new URLSearchParams({
      q: currentQuery,
      page: currentPage,
      limit: 12
    });

    if (currentFilters.type) params.append('type', currentFilters.type);
    if (currentFilters.status) params.append('status', currentFilters.status);
    if (currentFilters.rating) params.append('rating', currentFilters.rating);

    // Fetch data
    const data = await fetchWithCache(`${API_CONFIG.BASE_URL}/anime?${params}`);
    
    // Update total pages
    totalPages = Math.ceil(data.pagination.items.total / data.pagination.items.per_page);
    
    // Update results
    searchResultsGrid.innerHTML = '';
    data.data.forEach(anime => {
      const card = createAnimeCard(anime);
      searchResultsGrid.appendChild(card);
    });

    // Update pagination
    updatePagination();
  } catch (error) {
    console.error('Error performing search:', error);
    searchResultsGrid.innerHTML = '<p class="error-message">Failed to load results. Please try again later.</p>';
  }
}

// Event Listeners
searchBtn.addEventListener('click', () => {
  currentPage = 1;
  currentQuery = searchInput.value.trim();
  performSearch();
});

searchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    currentPage = 1;
    currentQuery = searchInput.value.trim();
    performSearch();
  }
});

typeFilter.addEventListener('change', () => {
  currentPage = 1;
  currentFilters.type = typeFilter.value;
  performSearch();
});

statusFilter.addEventListener('change', () => {
  currentPage = 1;
  currentFilters.status = statusFilter.value;
  performSearch();
});

ratingFilter.addEventListener('change', () => {
  currentPage = 1;
  currentFilters.rating = ratingFilter.value;
  performSearch();
});

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
  // Check if there's a search query in the URL
  const urlParams = new URLSearchParams(window.location.search);
  const query = urlParams.get('q');
  if (query) {
    searchInput.value = query;
    currentQuery = query;
    performSearch();
  }
});
