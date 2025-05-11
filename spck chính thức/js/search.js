import { API_URL } from './config.js';

// DOM Elements
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const genreFilter = document.getElementById('genreFilter');
const statusFilter = document.getElementById('statusFilter');
const sortFilter = document.getElementById('sortFilter');
const searchResults = document.getElementById('searchResults');
const resultCount = document.getElementById('resultCount');
const prevPage = document.getElementById('prevPage');
const nextPage = document.getElementById('nextPage');
const currentPage = document.getElementById('currentPage');

// State
let currentPageNum = 1;
let totalPages = 1;
let searchTimeout;

// Event Listeners
searchInput.addEventListener('input', handleSearchInput);
searchButton.addEventListener('click', performSearch);
genreFilter.addEventListener('change', performSearch);
statusFilter.addEventListener('change', performSearch);
sortFilter.addEventListener('change', performSearch);
prevPage.addEventListener('click', () => changePage(currentPageNum - 1));
nextPage.addEventListener('click', () => changePage(currentPageNum + 1));

// Functions
function handleSearchInput(e) {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        currentPageNum = 1;
        performSearch();
    }, 500);
}

async function performSearch() {
    const query = searchInput.value.trim();
    const genre = genreFilter.value;
    const status = statusFilter.value;
    const sort = sortFilter.value;

    try {
        searchResults.innerHTML = '<div class="loading"></div>';
        const response = await fetch(`${API_URL}/search?q=${query}&genre=${genre}&status=${status}&sort=${sort}&page=${currentPageNum}`);
        const data = await response.json();

        displayResults(data);
        updatePagination(data.totalPages);
    } catch (error) {
        console.error('Error searching anime:', error);
        searchResults.innerHTML = '<p class="error">Có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại sau.</p>';
    }
}

function displayResults(data) {
    searchResults.innerHTML = '';
    resultCount.textContent = `${data.total} kết quả`;

    if (data.anime.length === 0) {
        searchResults.innerHTML = '<p class="no-results">Không tìm thấy kết quả phù hợp.</p>';
        return;
    }

    data.anime.forEach(anime => {
        const animeCard = createAnimeCard(anime);
        searchResults.appendChild(animeCard);
    });
}

function createAnimeCard(anime) {
    const card = document.createElement('div');
    card.className = 'anime-card';
    card.innerHTML = `
        <img src="${anime.image}" alt="${anime.title}">
        <div class="anime-info">
            <h3>${anime.title}</h3>
            <div class="anime-meta">
                <span>${anime.episodes} tập</span>
                <span>${anime.rating}/10</span>
            </div>
        </div>
    `;
    card.addEventListener('click', () => window.location.href = `./anime.html?id=${anime.id}`);
    return card;
}

function updatePagination(total) {
    totalPages = total;
    currentPage.textContent = `Trang ${currentPageNum}`;
    prevPage.disabled = currentPageNum === 1;
    nextPage.disabled = currentPageNum === totalPages;
}

function changePage(page) {
    if (page < 1 || page > totalPages) return;
    currentPageNum = page;
    performSearch();
}

// Initial search
performSearch();