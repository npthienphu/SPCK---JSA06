// DOM Elements
const genreSearch = document.getElementById('genreSearch');
const genreCards = document.querySelectorAll('.genre-card');

// Event Listeners
genreSearch.addEventListener('input', filterGenres);

// Functions
function filterGenres(e) {
    const searchTerm = e.target.value.toLowerCase();

    genreCards.forEach(card => {
        const genreName = card.querySelector('h3').textContent.toLowerCase();
        const shouldShow = genreName.includes(searchTerm);
        card.style.display = shouldShow ? 'block' : 'none';
    });
}