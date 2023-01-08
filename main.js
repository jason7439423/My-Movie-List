const BASE_URL = "https://webdev.alphacamp.io";
const INDEX_URL = BASE_URL + "/api/movies/";
const POSTER_URL = BASE_URL + "/posters/";
const MOVIES_PER_PAGE = 12;

const movies = [];
let filteredMovies = [];
let currentPage = 1;

const dataPanel = document.querySelector("#data-panel");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const paginator = document.querySelector("#paginator");
const modeChangeSwitch = document.querySelector("#change-mode");
const cardModeIcon = document.querySelector(".card-mode");
const listModeIcon = document.querySelector(".list-mode");

//函式:印出電影清單:卡片與列表模式
function renderMovieList(data) {
  if (dataPanel.dataset.mode === "card-mode") {
    cardModeIcon.classList.add("active-mode");
    listModeIcon.classList.remove("active-mode");
    let rawHTML = "";
    data.forEach((item) => {
      // title , image
      rawHTML += `
    <div class="col-sm-3">
                <div class="mb-2">
                    <div class="card">
                        <img src="${POSTER_URL + item.image}"
                            class="card-img-top btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" alt="Movie Poster" data-id="${item.id
        }" />
                        <div class="card-body">
                            <h5 class="card-title btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal">${item.title}</h5>
                        </div>
                        <div class="card-footer">
                            <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal"
                                data-bs-target="#movie-modal" data-id="${item.id
        }">More</button>
                            <button class="btn btn-info btn-add-favorite" data-id="${item.id
        }">+</button>
                        </div>
                    </div>
                </div>
            </div>
    `;
    });

    dataPanel.innerHTML = rawHTML;
  } else if (dataPanel.dataset.mode === "list-mode") {
    let rawHTML = `<ul class="list-group col-sm-12 mb-2">`;
    data.forEach((item) => {
      // title, image, id
      listModeIcon.classList.add("active-mode");
      cardModeIcon.classList.remove("active-mode");
      rawHTML += `
      <li class="list-group-item d-flex justify-content-between">
        <h5 class="card-title btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal">${item.title}</h5>
        <div>
          <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal"
            data-id="${item.id}">More</button>
          <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
        </div>
      </li>`;
    });
    rawHTML += "</ul>";
    dataPanel.innerHTML = rawHTML;
  }
}
//函式:印出分頁器
function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE); //總頁數
  let rawHTML = "";

  for (let page = 1; page <= numberOfPages; page++) {
    if (page === currentPage) {
      rawHTML += `<li class='page-item active'><a class='page-link' href='#' data-page='${page}'>${page}</a></li>`;
    } else {
      rawHTML += `<li class='page-item'><a class='page-link' href='#' data-page='${page}'>${page}</a></li>`;
    }
  }

  paginator.innerHTML = rawHTML;
}

//函式:切換模式
function changeDisplayMode(displayMode) {
  if (dataPanel.dataset.mode === displayMode) return;
  dataPanel.dataset.mode = displayMode;
}

//函式:電影分頁
function getMoviesByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies;
  const startIndex = (page - 1) * MOVIES_PER_PAGE;
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE);
}

//函式:顯示詳細資訊
function showMovieModal(id) {
  const modalTitle = document.querySelector("#movie-modal-title");
  const modalImage = document.querySelector("#movie-modal-image");
  const modalDescription = document.querySelector("#movie-modal-description");
  const modalDate = document.querySelector("#movie-modal-date");

  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results;
    modalTitle.innerText = data.title;
    modalDescription.innerText = data.description;
    modalDate.innerText = "Release date : " + data.release_date;
    modalImage.innerHTML = `<img src = "${POSTER_URL + data.image
      }" alt = "movie-poster" class = "img-fluid">`;
  });
}

//函式:加入收藏清單
function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem("favoriteMovies")) || [];
  const movie = movies.find((movie) => movie.id === id);

  if (list.some((movie) => movie.id === id)) {
    return alert("此電影已經在收藏清單中！");
  }

  list.push(movie);
  localStorage.setItem("favoriteMovies", JSON.stringify(list));
}

//監聽按鈕事件
dataPanel.addEventListener("click", function onPanelClicked(event) {
  if (event.target.matches(".btn-show-movie")) {
    showMovieModal(Number(event.target.dataset.id));
  } else if (event.target.matches(".btn-add-favorite")) {
    addToFavorite(Number(event.target.dataset.id));
  }
});

//監聽分頁器
paginator.addEventListener("click", function onPaginatorClicked(event) {
  if (event.target.tagName !== "A") return;
  const activeLink = document.querySelector("#paginator  .active");
  activeLink.classList.remove("active");
  if (event.target.matches(".page-link")) {
    event.target.parentElement.classList.add("active");
  }

  const page = Number(event.target.dataset.page);
  currentPage = page; //紀錄當前頁數
  renderMovieList(getMoviesByPage(page));
});

//監聽搜尋欄-送出按鈕
searchForm.addEventListener("submit", function onSearchFormSubmitted(event) {
  event.preventDefault();
  const keyword = searchInput.value.trim().toLowerCase();

  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  );
  currentPage = 1; //搜尋後跳至第一頁
  renderPaginator(filteredMovies.length);
  renderMovieList(getMoviesByPage(currentPage));

  if (!keyword.length) {
    //keyword輸入偵錯警告
    return alert("請輸入有效搜尋字詞!");
  } else if (filteredMovies.length === 0) {
    return alert(`沒有符合${keyword}條件的電影`);
  }
});

//監聽搜尋欄-輸入
searchForm.addEventListener("input", function onSearchFormInput(event) {
  event.preventDefault();
  const keyword = searchInput.value.trim().toLowerCase();

  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  );
  currentPage = 1;
  renderPaginator(filteredMovies.length);
  renderMovieList(getMoviesByPage(currentPage));

  if (!keyword.length) {
    //keyword輸入偵錯警告
    return renderMovieList(filteredMovies);
  } else if (filteredMovies.length === 0) {
    return (dataPanel.innerHTML = `沒有符合${keyword}條件的電影`);
  }
});

// 監聽切換事件
modeChangeSwitch.addEventListener("click", function onSwitchClicked(event) {
  if (event.target.matches("#card-mode-button")) {
    changeDisplayMode("card-mode");
    renderMovieList(getMoviesByPage(currentPage));
  } else if (event.target.matches("#list-mode-button")) {
    changeDisplayMode("list-mode");
    renderMovieList(getMoviesByPage(currentPage));
  }
});

//送出axios需求&渲染
axios
  .get(INDEX_URL) // 修改這裡
  .then((response) => {
    movies.push(...response.data.results); // push會包一層array，參數前+...可以展開
    renderPaginator(movies.length);
    renderMovieList(getMoviesByPage(currentPage));
  });
