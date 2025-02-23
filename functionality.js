let currentPage = 1;
const apiKey = 'ac9f3b4a0f58f3663314c395aa26cbaf';

document.addEventListener('DOMContentLoaded', function () {
  const sortSelect = document.getElementById('sortSelect');
  if (sortSelect) {
    sortSelect.addEventListener('change', function () {
      currentPage = 1;
      const searchTerm = document.getElementById('searchInput').value.trim();
      fetchMovies(currentPage, searchTerm);
    });
  }
  fetchMovies(currentPage);
});

function fetchMovies(page, searchTerm = '') {
  let apiUrl = '';
  const sortSelect = document.getElementById('sortSelect');
  const sortValue = sortSelect ? sortSelect.value : 'popularity.desc';

  if (searchTerm.trim() !== '') {
    apiUrl = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(searchTerm)}&page=${page}`;
    toggleSortingFeatures(true, searchTerm);
  } else {
    apiUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&page=${page}&sort_by=${sortValue}`;
    toggleSortingFeatures(false);
  }

  fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      const movieListContainer = document.getElementById('movieList');
      movieListContainer.innerHTML = '';

      if (!data.results || data.results.length === 0) {
        displayErrorMessage('No movies found for that search.');
      } else {
        data.results.forEach((movie) => {
          movieListContainer.appendChild(createMovieCard(movie));
        });
        updatePagination(data.page, data.total_pages);
        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        });
      }
    })
    .catch((error) => {
      console.error('Error fetching data:', error);
      displayErrorMessage('An error occurred while loading movies. Please try again.');
    });
}

function toggleSortingFeatures(isSearching, searchTerm = '') {
  const sortSelect = document.getElementById('sortSelect');
  const sortContainer = document.getElementById('sortContainer');
  const warningMessage = document.createElement('div');
  warningMessage.id = 'sortWarning';
  warningMessage.className = 'alert alert-primary mt-2';
  warningMessage.style.fontSize = '0.9rem';
  warningMessage.innerHTML = `<span>
      <i class="fas fa-info-circle mr-2"></i> Sorting is disabled during search. Clear the search to enable sorting.
    </span>`;

  // Remove existing warning if present
  const existingWarning = document.getElementById('sortWarning');
  if (existingWarning) {
    existingWarning.remove();
  }

  if (isSearching) {
    sortSelect.disabled = true;
    sortSelect.title = 'Sorting is disabled during search';
    sortContainer.appendChild(warningMessage);
  } else {
    sortSelect.disabled = false;
    sortSelect.title = 'Sort movies';
  }
}

function createMovieCard(movie) {
  const movieCard = document.createElement('div');
  movieCard.className = 'col-lg-3 col-md-4 col-sm-6 col-12 mb-3 d-flex';

  const imageUrl = movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'no-image.svg';

  const link = document.createElement('div');
  link.className = 'w-100';
  link.innerHTML = `
        <div class="card h-100 pointer">
            <div class="card-img-wrapper" style="aspect-ratio: 2/3; overflow: hidden;">
                <img src="${imageUrl}" 
                     class="card-img-top h-100 w-100" 
                     alt="${movie.title}"
                     style="object-fit: cover;"
                     onerror="this.onerror=null; this.src='no-image.svg';">
            </div>
            <div class="card-body d-flex flex-column">
                <h5 class="card-title">${movie.title}</h5>
                <div class="mt-auto">
                    <p class="card-text mb-1">Release Date: ${movie.release_date || 'N/A'}</p>
                    <p class="card-text mb-1">Rating: ${movie.vote_average ? `${(movie.vote_average * 10).toFixed(0)}%` : 'N/A'}</p>
                    <p class="card-text mb-0">Popularity: ${movie.popularity ? movie.popularity.toFixed(1) : 'N/A'}</p>
                </div>
            </div>
        </div>
    `;

  link.addEventListener('click', () => fetchMovieDetails(movie.id));
  movieCard.appendChild(link);
  return movieCard;
}

function fetchMovieDetails(movieId) {
  const apiUrl = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}&append_to_response=credits,videos`;

  fetch(apiUrl)
    .then((response) => response.json())
    .then((movie) => {
      displayMovieDetails(movie);
    })
    .catch((error) => {
      console.error('Error fetching movie details:', error);
      displayErrorMessage('Failed to load movie details.');
    });
}

function displayMovieDetails(movie) {
  const mainContainer = document.getElementById('movieList');
  const paginationContainer = document.getElementById('pagination');
  const searchContainer = document.getElementById('searchForm');
  const sortContainer = document.getElementById('sortContainer');
  const jumbotron = document.querySelector('.jumbotron'); // Add this line

  // Hide pagination, search, sort, and jumbotron
  paginationContainer.style.display = 'none';
  searchContainer.style.display = 'none';
  sortContainer.style.display = 'none';
  jumbotron.style.display = 'none'; // Add this line

  // Format runtime to hours and minutes
  const hours = Math.floor(movie.runtime / 60);
  const minutes = movie.runtime % 60;
  const runtime = `${hours}h ${minutes}m`;

  // Format genres
  const genres = movie.genres.map((genre) => genre.name).join(', ');

  // Format cast (top 5 actors)
  const cast = movie.credits.cast
    .slice(0, 5)
    .map((actor) => actor.name)
    .join(', ');

  const imageUrl = movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'no-image.svg';

  mainContainer.innerHTML = `
    <div class="container mt-4 pb-5">
      <button class="btn btn-outline-info mb-4" onclick="returnToMovieList()">← Back to Movies</button>
      
      <div class="row">
        <div class="col-md-4">
          <img src="${imageUrl}" 
               class="img-fluid rounded w-100" 
               style="aspect-ratio: 2/3; object-fit: cover;"
               alt="${movie.title}"
               onerror="this.onerror=null; this.src='no-image.svg';">
        </div>
        
        <div class="col-md-8">
          <h1 class="mb-4">${movie.title}</h1>
          
          <div class="mb-3">
            <span class="badge bg-primary me-2">${movie.release_date.split('-')[0]}</span>
            <span class="badge bg-secondary me-2">${runtime}</span>
            <span class="badge bg-info">${(movie.vote_average * 10).toFixed(0)}% Rating</span>
          </div>
          
          <h5 class="text-muted mb-3">${movie.tagline}</h5>
          
          <h4>Overview</h4>
          <p class="mb-4">${movie.overview}</p>
          
          <div class="row mb-4">
            <div class="col-md-6">
              <h4>Details</h4>
              <p><strong>Genres:</strong> ${genres}</p>
              <p><strong>Status:</strong> ${movie.status}</p>
              <p><strong>Budget:</strong> $${(movie.budget || 0).toLocaleString()}</p>
              <p><strong>Revenue:</strong> $${(movie.revenue || 0).toLocaleString()}</p>
            </div>
            
            <div class="col-md-6">
              <h4>Cast</h4>
              <p>${cast}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function returnToMovieList() {
  // Show pagination, search, sort, and jumbotron
  document.getElementById('pagination').style.display = 'block';
  document.getElementById('searchForm').style.display = 'block';
  document.getElementById('sortContainer').style.display = 'block';
  document.querySelector('.jumbotron').style.display = 'block';

  // Clear the search input
  document.getElementById('searchInput').value = '';
  // Enable sorting
  toggleSortingFeatures(false);

  // Reload the current page of movies
  fetchMovies(currentPage);
}

function displayErrorMessage(message) {
  const errorContainer = document.getElementById('messageContainer');
  // Only display error message if we're not in movie details view
  const jumbotron = document.querySelector('.jumbotron');
  if (jumbotron.style.display !== 'none') {
    errorContainer.innerHTML = `<div class="alert alert-danger">${message}</div>`;
  }
}

function updatePagination(currentPage, totalPages) {
  const paginationContainer = document.getElementById('pagination');
  paginationContainer.innerHTML = '';

  const maxVisiblePages = 5; // Show 5 pages at a time
  let startPage = Math.max(currentPage - Math.floor(maxVisiblePages / 2), 1);
  let endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(endPage - maxVisiblePages + 1, 1);
  }

  // Previous button
  const prevButton = createPaginationButton('<<', currentPage - 1, currentPage === 1);
  paginationContainer.appendChild(prevButton);

  // Numbered page buttons
  for (let i = startPage; i <= endPage; i++) {
    const button = createPaginationButton(i, i, i === currentPage);
    paginationContainer.appendChild(button);
  }

  // Next button
  const nextButton = createPaginationButton('>>', currentPage + 1, currentPage === totalPages);
  paginationContainer.appendChild(nextButton);
}

function createPaginationButton(label, page, disabled) {
  const button = document.createElement('button');
  button.innerText = label;
  button.dataset.page = page;
  button.className = 'btn btn-outline-secondary mx-1';
  button.disabled = disabled;

  button.addEventListener('click', function () {
    if (!button.disabled) {
      currentPage = page;
      fetchMovies(currentPage, document.getElementById('searchInput').value);
    }
  });

  return button;
}

document.getElementById('searchForm').addEventListener('submit', function (event) {
  event.preventDefault();
  const searchTerm = document.getElementById('searchInput').value.trim();

  if (searchTerm === '') {
    displayErrorMessage('Enter a term to search.');
    toggleSortingFeatures(false);
    return;
  }

  currentPage = 1;
  fetchMovies(currentPage, searchTerm);
});

function reloadPage() {
  location.reload();
}
