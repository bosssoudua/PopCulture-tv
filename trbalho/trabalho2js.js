let currentPage = 1;
const apiKey = "ac9f3b4a0f58f3663314c395aa26cbaf";

document.addEventListener("DOMContentLoaded", function () {
    fetchMovies(currentPage);
});

function fetchMovies(page, searchTerm = "") {
    let apiUrl = `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&page=${page}`;

    if (searchTerm.trim() !== "") {
        apiUrl = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(searchTerm)}&page=${page}`;
    }

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            const movieListContainer = document.getElementById("movieList");
            movieListContainer.innerHTML = "";

            if (!data.results || data.results.length === 0) {
                displayErrorMessage("Nenhum filme encontrado para essa pesquisa.");
            } else {
                data.results.forEach(movie => {
                    movieListContainer.appendChild(createMovieCard(movie));
                });
                updatePagination(data.page, data.total_pages);
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            }
        })
        .catch(error => {
            console.error("Erro ao buscar dados:", error);
            displayErrorMessage("Ocorreu um erro ao carregar os filmes. Tente novamente.");
        });
}

function createMovieCard(movie) {
    const movieCard = document.createElement("div");
    movieCard.className = "col-lg-3 col-md-4 col-sm-6 col-12 mb-3";

    const link = document.createElement("a");
    link.href = `https://www.themoviedb.org/movie/${movie.id}`;
    link.target = "_blank";
    link.innerHTML = `
        <div class="card">
            <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" class="card-img-top" alt="${movie.title}">
            <div class="card-body">
                <h5 class="card-title">${movie.title}</h5>
                <p class="card-text">Lançamento: ${movie.release_date || "N/A"}</p>
                <p class="card-text">Avaliação: ${movie.vote_average ? movie.vote_average * 10 : "N/A"}</p>
            </div>
        </div>
    `;

    movieCard.appendChild(link);
    return movieCard;
}

function displayErrorMessage(message) {
    const errorContainer = document.getElementById("messageContainer");
    errorContainer.innerHTML = `<div class="alert alert-danger">${message}</div>`;
}

function updatePagination(currentPage, totalPages) {
    const paginationContainer = document.getElementById("pagination");
    paginationContainer.innerHTML = "";

    const maxVisiblePages = 5; // Show 5 pages at a time
    let startPage = Math.max(currentPage - Math.floor(maxVisiblePages / 2), 1);
    let endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);

    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(endPage - maxVisiblePages + 1, 1);
    }

    // Previous button
    const prevButton = createPaginationButton("<<", currentPage - 1, currentPage === 1);
    paginationContainer.appendChild(prevButton);

    // Numbered page buttons
    for (let i = startPage; i <= endPage; i++) {
        const button = createPaginationButton(i, i, i === currentPage);
        paginationContainer.appendChild(button);
    }

    // Next button
    const nextButton = createPaginationButton(">>", currentPage + 1, currentPage === totalPages);
    paginationContainer.appendChild(nextButton);
}

function createPaginationButton(label, page, disabled) {
    const button = document.createElement("button");
    button.innerText = label;
    button.dataset.page = page;
    button.className = "btn btn-outline-secondary mx-1";
    button.disabled = disabled;

    button.addEventListener("click", function () {
        if (!button.disabled) {
            currentPage = page;
            fetchMovies(currentPage, document.getElementById("searchInput").value);
        }
    });

    return button;
}

document.getElementById("searchForm").addEventListener("submit", function (event) {
    event.preventDefault();
    const searchTerm = document.getElementById("searchInput").value.trim();

    if (searchTerm === "") {
        displayErrorMessage("Digite um termo para pesquisar.");
        return;
    }

    currentPage = 1;
    fetchMovies(currentPage, searchTerm);
});

function reloadPage() {
    location.reload();
}
