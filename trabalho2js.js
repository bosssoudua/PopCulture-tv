let currentPage = 1;
const resultsPerPage = 24;

document.addEventListener("DOMContentLoaded", function () {
  fetchMovies(currentPage);
});

document.getElementById("searchForm").addEventListener("submit", function (event) {
  event.preventDefault();

  const searchTerm = document.getElementById("searchInput").value;

  if (searchTerm.trim() !== "") {
    currentPage = 1;
    fetchMovies(currentPage, searchTerm);
  } else {
    displayErrorMessage("Please enter a search term.");
  }
});

document.getElementById("pagination").addEventListener("click", function (event) {
  const target = event.target;

  if (target.tagName === "BUTTON") {
    const page = parseInt(target.dataset.page);

    if (!isNaN(page)) {
      currentPage = page;
      fetchMovies(currentPage);
    }
  }
});

function fetchMovies(page, searchTerm = "") {
  const apiKey = "ac9f3b4a0f58f3663314c395aa26cbaf";
  let apiUrl = `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&page=${page}`;

  if (searchTerm !== "") {
    apiUrl = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${searchTerm}&page=${page}`;
  }

  fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      const movieListContainer = document.getElementById("movieList");
      movieListContainer.innerHTML = "";

      if (data.results.length === 0) {
        displayErrorMessage("No movies found for the search term.");
      } else {
        data.results.forEach((movie) => {
          const movieCard = document.createElement("div");
          movieCard.className = "col-lg-3 col-md-4 col-sm-6 col-12 mb-3";
          movieCard.innerHTML = `
                    <div class="card">
                        <img src="https://image.tmdb.org/t/p/w500${
                          movie.poster_path
                        }" class="card-img-top" alt="${movie.title}">
                        <div class="card-body">
                            <h5 class="card-title">${movie.title}</h5>
                            <p class="card-text">${movie.overview}</p>
                        </div>
                    </div>
                `;
          movieListContainer.appendChild(movieCard);
        });

        updatePagination(data.total_pages);
      }
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      displayErrorMessage("An error occurred while fetching movies. Please try again later.");
    });
}

function updatePagination(totalPages) {
  const paginationContainer = document.getElementById("pagination");
  paginationContainer.innerHTML = "";

  const maxVisiblePages = 5; 
  let startPage = Math.max(currentPage - Math.floor(maxVisiblePages / 2), 1);
  let endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(endPage - maxVisiblePages + 1, 1);
  }

  if (currentPage > 1) {
    const previousButton = createPaginationButton("<<", currentPage - 1);
    paginationContainer.appendChild(previousButton);
  }

  for (let i = startPage; i <= endPage; i++) {
    const button = createPaginationButton(i, i);
    button.disabled = i === currentPage;
    paginationContainer.appendChild(button);
  }

  if (currentPage < totalPages) {
    const nextButton = createPaginationButton(">>", currentPage + 1);
    paginationContainer.appendChild(nextButton);
  }
}

function createPaginationButton(label, page) {
  const button = document.createElement("button");
  button.innerText = label;
  button.dataset.page = page;
  return button;
}

function displayErrorMessage(message) {
  const errorContainer = document.getElementById("errorContainer");
  errorContainer.innerHTML = `<div class="alert alert-danger" role="alert">${message}</div>`;
}

function reloadPage() {
  location.reload();
}
