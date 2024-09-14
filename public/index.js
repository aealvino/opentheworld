document.addEventListener("DOMContentLoaded", async function () {
    const searchInput = document.getElementById('searchInput');
    const cardsContainer = document.getElementById('cards-container');
    const logoutButton = document.getElementById('logoutButton');
    const placesButton = document.getElementById('placesButton');
    const routesButton = document.getElementById('routesButton');
    const loginButton = document.getElementById('login_btn');
    const profileButton = document.getElementById('profile');
    const loginFormContainer = document.getElementById('login');
    const loadMoreButton = document.getElementById('load-more');
    const create = document.getElementById("create");
    const filterform= document.getElementById("filterform");
    const routeform = document.getElementById("routeform");
    const sw_filt = document.getElementById("sw_filt");
    const sw_route = document.getElementById("sw_route");
    const themeButton1 = document.getElementById("ThemeButton1");
    const themeButton2 = document.getElementById("ThemeButton2");
    let currentPlacesIndex = 0;
    const cont = document.querySelector(".cont");
    let currentRoutesIndex = 0;
    let currentData = [];
    const itemsPerPage = 200;
    let currentUrl = '/places';
    let userRatings = [];
    let userFavorites = [];
    let selectedTagIds = [];
    const token = localStorage.getItem('token');
    if (token) {
        await loadUserData();
        showProfileButton();
        await loadUserProfile(); // Загружаем профиль пользователя
        activateStartButton(); // Автоматически активируем кнопку "Начать"
    } else {
        showLoginButton();
    }
    async function loadUserData() {
        try {
            const ratingsResponse = await fetch('/ratings', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            userRatings = await ratingsResponse.json();

            const favoritesResponse = await fetch('/favorites', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            userFavorites = await favoritesResponse.json();

            updateCards();
        } catch (error) {
            console.error('Error fetching user data:', error);
        }   
    }
    async function loadUserProfile() {
        try {
            const response = await fetch('/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch profile');
            }
            const userProfile = await response.json();
            document.getElementById('profileName').textContent = userProfile.username;
        } catch (error) {
            console.error('Error loading user profile:', error);
        }
    }
    function showProfileButton() {
        loginFormContainer.style.display = 'none';
        profileButton.style.display = 'block';
    }
    function showLoginButton() {
        loginFormContainer.style.display = 'block';
        profileButton.style.display = 'none';
    }
    function activateStartButton() {
        // Эмулируем нажатие на кнопку "Начать"
        document.getElementById("main").classList.add("display");
        document.getElementById("butt_arr").classList.add("display");
    }
    function updateCards() {
        const cards = document.querySelectorAll('.item');
        cards.forEach(card => {
            const placeId = parseInt(card.dataset.placeId, 10);
            const isLiked = userFavorites.some(fav => fav.place_id === placeId);
            const userRating = userRatings.find(rating => rating.place_id === placeId);

            const likeButton = card.querySelector('.favourite');
            likeButton.classList.toggle('liked', isLiked);
            const img = likeButton.querySelector('img');
            img.src = isLiked ? 'images/heart1.svg' : 'images/heart2.svg';

            const stars = card.querySelectorAll('.star');
            stars.forEach((star, index) => {
                star.classList.toggle('rated', userRating && userRating.rating > index);
                star.style.backgroundImage = userRating && userRating.rating > index ? "url('images/star1.svg')" : "url('images/star.svg')";
            });
        });
        checkH1Lengths();
    }
    // Функция для обновления средней оценки на карточке
    function updateCardAverageRating(placeId, averageRating) {
        const card = document.querySelector(`.item[data-place-id='${placeId}']`);
        if (card) {
            const ratingElement = card.querySelector('.average-rating');
            if (ratingElement) {
                ratingElement.textContent = averageRating;
            }
        }
    }
// Функция для создания карточки маршрута
function createRouteCard(name, tourCompany, places, routeId) {
    const images = places.map(place => place.photo);
    if (!images || images.length === 0) {
        return null;  // Если нет фотографий, не создаем карточку
    }

    const card = document.createElement('div');
    card.className = 'item route';
    card.dataset.routeId = routeId;

    let placesHTML = places.map(place => `
        <li>
            <button type="button" id="">${place.name}</button>
        </li>
    `).join('');

    const uniqueTags = [...new Set(places.flatMap(place => place.Tags.map(tag => tag.TagNames.tag_name)))];
    let uniqueTagsHTML = uniqueTags.map(tag => `<li><a href="#" class="route-tag" data-tag-name="${tag}">${tag}</a></li>`).join('');

    let imagesHTML = images.length > 0 ? `
        <div class="image-container">
            <img class="item_img" src="${images[0]}" alt="${name}" onerror="this.parentElement.style.display='none'">
            <button class="prev" onclick="changeImage(event, -1)">&#10094;</button>
            <button class="next" onclick="changeImage(event, 1)">&#10095;</button>
        </div>
    ` : '';

    const websiteButtonHTML = tourCompany && tourCompany.website_url ? `
        <a href="${tourCompany.website_url}" class="map" target="_blank">
            <img src="images/internet.svg" alt="Website">
        </a>
    ` : '';

    const phoneButtonHTML = tourCompany && tourCompany.contact_info ? `
        <a href="tel:${tourCompany.contact_info}" class="map" target="_blank">
            <img src="images/phone.svg" alt="Phone">
        </a>
    ` : '';

    card.innerHTML = `
        <div class="top">
            ${imagesHTML}
            <div class="info">
                <h1 class="Name" id="Name">${name}</h1>
                <p>Туркомпания: ${tourCompany ? tourCompany.name : 'Без туроператора'}</p>
                <p>Список мест для посещения:</p>
                <ul class="place_list">
                    ${placesHTML}
                </ul>
            </div>
            <div class="circles">
                ${websiteButtonHTML}
                ${phoneButtonHTML}
            </div>
        </div>
        <div class="tags">
            <ul>
                ${uniqueTagsHTML}
            </ul>
        </div>
    `;

    card.querySelector('.item_img').addEventListener('error', function () {
        card.style.display = 'none';  // Если изображение не загрузилось, скрываем карточку
    });

    card.querySelectorAll('.route-tag').forEach(tag => {
        tag.addEventListener('click', handleRouteTagClick);
    });

    return card;
}



    // Функция для обработки кликов по тегам маршрутов
    function handleRouteTagClick(event) {
        event.preventDefault();
        const tagName = event.target.dataset.tagName;

        // Найти соответствующий чекбокс по имени тега
        const checkbox = Array.from(document.querySelectorAll('#filterContainer input[type="checkbox"]')).find(cb => {
            const label = cb.nextElementSibling?.nextElementSibling; // Найти тег рядом с чекбоксом
            return label && label.textContent === tagName;
        });

        if (checkbox) {
            checkbox.checked = true; // Отметить чекбокс
            handleFilterChange(); // Обновить фильтры
        }
    }

    async function filterRoutes() {
        let data = await fetchData('/routes');
    
        if (selectedTagIds.length > 0) {
            data = data.filter(route => {
                // Получаем теги для всех мест в маршруте
                const routeTagIds = route.places.flatMap(place => place.Tags.map(tag => tag.tag_id));
                return selectedTagIds.every(tagId => routeTagIds.includes(tagId));
            });
        }
    
        currentData = data;
        currentRoutesIndex = 0;
        cardsContainer.innerHTML = ''; // Очистка старых карточек маршрутов
        loadMoreRoutes(); // Обновление карточек маршрутов
        if (data.length > 0) {
            scrollToContent(); // Прокрутка к контенту, если есть карточки маршрутов
        }
    }
    

    // Функция для создания карточки места
    function createCard(name, description, photos, yandexMapLink, tags, placeId, averageRating, phoneNumber, websiteUrl) {
        if (!photos || photos.length === 0) {
            return null;  // Если нет фото, не создаем карточку
        }
    
        const card = document.createElement('div');
        card.className = 'item';
        card.dataset.placeId = placeId;
    
        let photoHTML = '';
        if (photos && photos.length > 0) {
            const photoUrl = photos[0].photo_url;
            photoHTML = `
                <div class="image-container">
                    <img class="item_img" src="${photoUrl}" alt="${name}" onerror="this.parentElement.style.display='none'">
                    <button class="prev" onclick="changeImage(event, -1)">&#10094;</button>
                    <button class="next" onclick="changeImage(event, 1)">&#10095;</button>
                </div>
            `;
        }
    
        const tagsHTML = tags.map(tag => `<li><a href="#" class="tag" data-tag-id="${tag.TagNames.id}">${tag.TagNames.tag_name}</a></li>`).join('');
    
        const isLiked = userFavorites.some(fav => fav.place_id === placeId);
        const userRating = userRatings.find(rating => rating.place_id === placeId);
    
        let phoneButtonHTML = '';
        if (phoneNumber) {
            phoneButtonHTML = `<a href="tel:${phoneNumber}" class="map" target="_blank"><img src="images/phone.svg" alt=""></a>`;
        }
    
        let websiteButtonHTML = '';
        if (websiteUrl) {
            websiteButtonHTML = `<a href="${websiteUrl}" class="map" target="_blank"><img src="images/internet.svg" alt=""></a>`;
        }
    
        card.innerHTML = `
            <div class="top">
                ${photoHTML}
                <button class="imgbutt favourite display ${isLiked ? 'liked' : ''}" id="favourite">
                    <img src="${isLiked ? 'images/heart1.svg' : 'images/heart2.svg'}" alt="">
                </button>
                <button class="imgbutt add_to_route" id="add_to_route">
                    <img src="images/plus.png" alt="">
                </button>
                <div class="info">
                    <h1 class="Name" id="Name">${name}</h1>
                    <p>${description}</p>
                    <div class="bottom">
                        <h1 class="average-rating">${averageRating}</h1>
                        <div class="stars">
                            <ul>
                                ${[1, 2, 3, 4, 5].map(i => `
                                    <li>
                                        <button class="star ${userRating && userRating.rating >= i ? 'rated' : ''}" id="star${i}"></button>
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                    </div>
                </div>
                <div class="circles">
                    <a href="${yandexMapLink}" class="map" target="_blank"><img src="images/pin.png" alt=""></a>
                    ${phoneButtonHTML}
                    ${websiteButtonHTML}
                </div>
            </div>
            <div class="tags">
                <ul>
                    ${tagsHTML}
                </ul>
            </div>
        `;
        
        // Обработчик ошибок при загрузке изображений
        card.querySelector('.item_img').addEventListener('error', function () {
            card.style.display = 'none';  // Если изображение не загрузилось, скрываем карточку
        });
    
        card.dataset.photos = JSON.stringify(photos);
        card.dataset.currentPhotoIndex = 0;
    
        card.querySelectorAll('.tag').forEach(tag => {
            tag.addEventListener('click', handleTagClick);
        });
    
        return card;
    }
    
    
    async function loadRoutes() {
        try {
            const response = await fetch('/routes');
            if (!response.ok) {
                throw new Error('Ошибка при загрузке маршрутов');
            }
            const routeData = await response.json();
            currentData = routeData;
            currentRoutesIndex = 0;
            cardsContainer.innerHTML = ''; // Clear previous cards
            loadMoreRoutes(routeData); // Load routes into cards
        } catch (error) {
            console.error('Error fetching routes:', error);
        }
    }

// Функция для загрузки дополнительных маршрутов
function loadMoreRoutes(data = currentData) {
    if (!data || data.length === 0) {
        console.error('Нет данных для загрузки маршрутов');
        return;
    }

    const itemsToLoad = data.slice(currentRoutesIndex, currentRoutesIndex + itemsPerPage);

    itemsToLoad.forEach(item => {
        const card = createRouteCard(item.name, item.tour_company, item.places, item.route_id);
        
        if (card) {  // Проверка, что карточка создана
            cardsContainer.appendChild(card);
        }
    });

    currentRoutesIndex += itemsPerPage;

    if (currentRoutesIndex >= data.length) {
        loadMoreButton.style.display = 'none';
    } else {
        loadMoreButton.style.display = 'block';
    }
}


    // Функция для обработки кликов по тегам
    function handleTagClick(event) {
        event.preventDefault();
        const tagId = event.target.dataset.tagId;
        const checkbox = document.querySelector(`#filterContainer input[type="checkbox"][value="${tagId}"]`);
        if (checkbox) {
            checkbox.checked = true;
            handleFilterChange(); // Обновляем фильтры при изменении состояния чекбоксов
        }
    }   
    // Функция для получения данных с сервера
// Функция для получения данных с сервера по указанному URL
function fetchData(url) {
    return fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error fetching data');
            }
            return response.json();
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
}

    // Функция для загрузки данных о местах
    function loadPlaces() {
        fetchData('/places').then(data => {
            currentData = data;
            isSearchActive = false;
            currentPlacesIndex = 0;
            cardsContainer.innerHTML = ''; // Clear existing cards
            loadMorePlaces();
            createSuggestionsList(data);
        });
    }
    // Функция для добавления обработчиков событий для звезд
    function addStarEventListeners(card) {
        const stars = card.querySelectorAll('.star');
        stars.forEach((star, index) => {
            // Проверяем авторизацию при наведении на звездочки
            star.addEventListener('mouseover', () => {
                const token = localStorage.getItem('token');
                if (!token) return;  // Если пользователь не авторизован, ничего не делаем

                stars.forEach((s, i) => {
                    if (i <= index) {
                        s.style.backgroundImage = "url('images/star1.svg')";
                    } else {
                        s.style.backgroundImage = "url('images/star.svg')";
                    }
                });
            });

            star.addEventListener('mouseout', () => {
                const token = localStorage.getItem('token');
                if (!token) return;  // Если пользователь не авторизован, ничего не делаем

                const currentRating = Array.from(stars).filter(s => s.classList.contains('rated')).length;
                stars.forEach((s, i) => {
                    if (i < currentRating) {
                        s.style.backgroundImage = "url('images/star1.svg')";
                    } else {
                        s.style.backgroundImage = "url('images/star.svg')";
                    }
                });
            });

            star.addEventListener('click', async (event) => {
                const token = localStorage.getItem('token');
                if (!token) {
                    document.getElementById("registerPopup").style.display = "flex";
                    return;  // Если пользователь не авторизован, открываем окно регистрации и выходим из функции
                }

                await handleRatingClick(event);  // Если пользователь авторизован, выполняем обработку клика
            });
        });
    }   
    // Функция для загрузки дополнительных мест
    function loadMorePlaces() {
        const itemsToLoad = currentData.slice(currentPlacesIndex, currentPlacesIndex + itemsPerPage);
        itemsToLoad.forEach(item => {
            const card = createCard(
                item.name, 
                item.description, 
                item.Photos, 
                item.Branches[0]?.yandex_map_link, 
                item.Tags, 
                item.id, 
                item.average_rating,
                item.phone_number,   
                item.website_url     
            );
    
            if (card) {  // Проверка, что карточка создана
                cardsContainer.appendChild(card);
                addStarEventListeners(card);
                card.querySelector('.favourite').addEventListener('click', handleLikeClick);
            }
        });
        currentPlacesIndex += itemsPerPage;
        updateCards();
    
        if (currentPlacesIndex >= currentData.length) {
            loadMoreButton.style.display = 'none';
        } else {
            loadMoreButton.style.display = 'block';
        }
    }
    
    // Функция для создания списка предложений для поиска
    function createPlaceSuggestionsList(data) {
        searchInput.addEventListener('input', function () {
            const searchQuery = searchInput.value.trim().toLowerCase();
            suggestionsList.innerHTML = ''; // Очистка предыдущих предложений
            if (searchQuery === '') {
                suggestionsList.style.display = 'none';
                return;
            }
    
            // Фильтрация мест по названию
            const filteredPlaces = data.filter(place => place.name.toLowerCase().includes(searchQuery));
            const sortedPlaces = filteredPlaces.sort((a, b) => {
                const aStartsWithQuery = a.name.toLowerCase().startsWith(searchQuery);
                const bStartsWithQuery = b.name.toLowerCase().startsWith(searchQuery);
                return aStartsWithQuery && !bStartsWithQuery ? -1 : !aStartsWithQuery && bStartsWithQuery ? 1 : 0;
            });
            const limitedPlaces = sortedPlaces.slice(0, 5); // Ограничение до 5 предложений
    
            limitedPlaces.forEach(place => {
                const suggestion = document.createElement('li');
                suggestion.textContent = place.name;
                suggestion.addEventListener('click', function () {
                    searchInput.value = place.name; // Устанавливаем выбранное значение
                    suggestionsList.innerHTML = ''; // Очистка предложений
                    suggestionsList.style.display = 'none';
                    filterPlaceCards(place.name); // Фильтрация карточек мест
                });
                suggestionsList.appendChild(suggestion); // Добавление предложений
            });
            suggestionsList.style.display = 'block';
        });
    }
    

    function createRouteSuggestionsList(data) {
        searchInput.addEventListener('input', function () {
            const searchQuery = searchInput.value.trim().toLowerCase();
            suggestionsList.innerHTML = ''; // Очистка предыдущих предложений
            if (searchQuery === '') {
                suggestionsList.style.display = 'none';
                return;
            }
    
            // Фильтрация маршрутов по названию
            const filteredRoutes = data.filter(route => route.name.toLowerCase().includes(searchQuery));
            const sortedRoutes = filteredRoutes.sort((a, b) => {
                const aStartsWithQuery = a.name.toLowerCase().startsWith(searchQuery);
                const bStartsWithQuery = b.name.toLowerCase().startsWith(searchQuery);
                return aStartsWithQuery && !bStartsWithQuery ? -1 : !aStartsWithQuery && bStartsWithQuery ? 1 : 0;
            });
            const limitedRoutes = sortedRoutes.slice(0, 5); // Ограничение до 5 предложений
    
            limitedRoutes.forEach(route => {
                const suggestion = document.createElement('li');
                suggestion.textContent = route.name;
                suggestion.addEventListener('click', function () {
                    searchInput.value = route.name; // Устанавливаем выбранное значение
                    suggestionsList.innerHTML = ''; // Очистка предложений
                    suggestionsList.style.display = 'none';
                    filterRouteCards(route.name); // Фильтрация карточек маршрутов
                });
                suggestionsList.appendChild(suggestion); // Добавление предложений
            });
            suggestionsList.style.display = 'block';
        });
    }
    function filterRouteCards(searchQuery) {
        fetchData('/routes').then(data => {
            if (!searchQuery) {
                currentRoutesIndex = 0;
                currentData = data;
                cardsContainer.innerHTML = ''; // Очистка карточек
                loadMoreRoutes(); // Загрузка всех маршрутов
                return;
            }
    
            const lowerCaseQuery = searchQuery.toLowerCase();
    
            // Маршруты, которые начинаются с введённого текста
            const startsWithQuery = data.filter(item => item.name.toLowerCase().startsWith(lowerCaseQuery));
    
            // Маршруты, которые содержат введённый текст, но не начинаются с него
            const containsQuery = data.filter(item => item.name.toLowerCase().includes(lowerCaseQuery) && !item.name.toLowerCase().startsWith(lowerCaseQuery));
    
            // Объединяем обе выборки
            const filteredData = [...startsWithQuery, ...containsQuery];
    
            currentRoutesIndex = 0;
            currentData = filteredData;
            cardsContainer.innerHTML = ''; // Очищаем контейнер с карточками
            loadMoreRoutes(); // Загружаем отфильтрованные маршруты
    
            if (filteredData.length > 0) {
                scrollToContent(); // Прокручиваем к карточкам
            }
        });
    }
    function loadMorePlacesOrRoutes(url) {
        if (url === '/places') {
            loadMorePlaces(); // Загружаем места
        } else if (url === '/routes') {
            loadMoreRoutes(); // Загружаем маршруты
        }
    }
// Функция для фильтрации карточек по запросу поиска
function filterCards(searchQuery, url) {
    fetchData(url).then(data => {
        // Если поисковый запрос пуст, загружаем все карточки
        if (!searchQuery) {
            if (url === '/places') {
                currentPlacesIndex = 0;
            } else if (url === '/routes') {
                currentRoutesIndex = 0;
            }
            currentData = data;
            cardsContainer.innerHTML = '';
            loadMorePlacesOrRoutes(url); // Загружаем места или маршруты
            return;
        }

        const lowerCaseQuery = searchQuery.toLowerCase();

        // Фильтрация по введённому тексту
        const startsWithQuery = data.filter(item => item.name.toLowerCase().startsWith(lowerCaseQuery));
        const containsQuery = data.filter(item => item.name.toLowerCase().includes(lowerCaseQuery) && !item.name.toLowerCase().startsWith(lowerCaseQuery));

        // Объединяем фильтры
        const filteredData = [...startsWithQuery, ...containsQuery];

        if (url === '/places') {
            currentPlacesIndex = 0;
        } else if (url === '/routes') {
            currentRoutesIndex = 0;
        }

        currentData = filteredData;
        cardsContainer.innerHTML = ''; // Очищаем контейнер с карточками
        loadMorePlacesOrRoutes(url); // Загружаем отфильтрованные карточки

        if (filteredData.length > 0) {
            scrollToContent(); // Прокрутка к результатам поиска
        }
    });
}


// Обработчик ввода в поле поиска
// Ссылка на контейнер с подсказками
const suggestionsList = document.getElementById('suggestionsList'); // Добавьте элемент для списка подсказок

// Обработчик ввода в поле поиска
searchInput.addEventListener('input', function () {
    const searchQuery = searchInput.value.trim(); // Получаем введённый текст
    filterCards(searchQuery, currentUrl); // Фильтруем карточки по запросу
});

// Обработчик клика на поле поиска — подсказки должны снова появляться
searchInput.addEventListener('focus', function () {
    if (suggestionsList.children.length > 0) {
        suggestionsList.style.display = 'block'; // Показываем подсказки, если они есть
    }
});

// Обработчик клика на документ — скрываем подсказки при клике вне поля поиска
document.addEventListener('click', function (event) {
    if (!searchInput.contains(event.target) && !suggestionsList.contains(event.target)) {
        suggestionsList.style.display = 'none'; // Скрываем подсказки при клике вне поля поиска или списка подсказок
    }
});


    // Функция для прокрутки к выбранной карточке
    function scrollToContent() {
        const content = document.querySelector('.content');
        if (content) {
            content.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
    // Обработчик события для поиска по нажатию Enter
    searchInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            const searchQuery = searchInput.value.trim();
            filterCards(searchQuery, currentUrl);
        }
    });
    // Обработчик события для загрузки мест при нажатии кнопки "Места"
    placesButton.addEventListener('click', function () {
        if (!placesButton.classList.contains('active')) { // Проверка на активность кнопки
            setActiveButton(placesButton, routesButton);
            currentUrl = '/places';
            currentPlacesIndex = 0;
            cardsContainer.innerHTML = ''; // Очистка карточек
            fetchData('/places').then(data => {
                currentData = data;
                loadPlaces(); // Загружаем места
                createPlaceSuggestionsList(data); // Генерация предложений для мест
            });
        }
    });
    
    routesButton.addEventListener('click', function () {
        if (!routesButton.classList.contains('active')) { // Проверка на активность кнопки
            setActiveButton(routesButton, placesButton);
            currentUrl = '/routes';
            currentRoutesIndex = 0;
            cardsContainer.innerHTML = ''; // Очистка карточек
            fetchData('/routes').then(data => {
                currentData = data;
                loadRoutes(); // Загружаем маршруты
                createRouteSuggestionsList(data); // Генерация предложений для маршрутов
            });
        }
    });
    
    // Функция для установки активной кнопки
    function setActiveButton(activeButton, inactiveButton) {
        activeButton.classList.add('active');
        inactiveButton.classList.remove('active');
    }
    // Обработчик события для входа в систему
    document.getElementById("login_btn").addEventListener("click", function () {
        document.getElementById("login").classList.toggle("display");
    });
    // Обработчик события для отображения фильтров
    document.getElementById("filter_btn").addEventListener("click", function () {
        document.getElementById("filters").classList.toggle("display");
        document.getElementById("container").classList.toggle("wide");
    });
    // Обработчик события для кнопки "Начать"
    document.getElementById("Start").addEventListener("click", function () {
        document.getElementById("main").classList.toggle("display");
        document.getElementById("butt_arr").classList.toggle("display");
    });
    document.getElementById("menu_butt").addEventListener("click", function () {
        document.getElementById("profile_menu").classList.toggle("display");
    });
    function filtersSwitch(){
        filterform.classList.toggle("display");
        routeform.classList.toggle("display");
        sw_filt.classList.toggle("active");
        sw_route.classList.toggle("active");
    }
    //обработчик события для кнопки-переключателя "фильтры"
    sw_filt.addEventListener("click", function() {
        filtersSwitch();
        document.documentElement.style.setProperty('--back', "#f2f2f2");
    });
    //обработчик события для кнопки-переключателя "твой маршрут"
    sw_route.addEventListener("click", function() {
        filtersSwitch();
        // document.documentElement.style.setProperty('--back', "#0d1117");
    });

    function ThemeSwitch() {
        themeButton1.classList.toggle("display");
        themeButton2.classList.toggle("display");
    }
    
    themeButton1.addEventListener("click", function () {
        ThemeSwitch();
        document.documentElement.style.setProperty('--back', "#1e2228");
        document.querySelector("header").style.setProperty("background-color", "#1e2228");
        document.getElementById("menu_butt").style.setProperty("background-color", "#1e2228");
        const allChildren = document.getElementById("profile_menu").querySelectorAll('button');
        allChildren.forEach(child => {
            child.style.setProperty("background-color", '#1e2228');
        });
        const filterchildren = document.querySelectorAll(".filter-item");
        filterchildren.forEach(child => {
            child.style.setProperty("color", "#fff");
        });
        const labels = document.querySelectorAll(".checkbox-label");
        labels.forEach(child => {
            child.style.setProperty("color", "#fff");
        });
        document.querySelector(".namelabel").style.setProperty("color", "#fff");
        const items = document.querySelectorAll(".item");
        items.forEach(item => {
            item.style.setProperty("box-shadow", "5px 5px 5px #444");
        });
        cont.style.setProperty("background", "linear-gradient(180deg, rgba(var(--accent), 60%) 15%, #0006 85%), url(images/BACKGROUND.jpg)");
        cont.style.setProperty("background-size", "100% 145%");
        cont.style.setProperty("background-position-y", "-260px");
        
        const images = [
            { class: "arr_dwn", lightSrc: "images/arr_dwn1.png", darkSrc: "images/arr_dwn1-.png" },
            { class: "orn", lightSrc: "images/orn2.png", darkSrc: "images/orn2-.png" },
            { class: "profile_img", lightSrc: "images/profile2.png", darkSrc: "images/profile2-.png" },
            { class: "", lightSrc: "images/star_fav1.png", darkSrc: "images/star_fav1-.png" } // Without class, using <img> tag directly
        ];
    
        images.forEach(img => {
            if (img.class) {
                const elements = document.querySelectorAll(`.${img.class}`);
                elements.forEach(element => {
                    element.src = img.darkSrc;
                });
            } else {
                const element = document.querySelector(`img[src='${img.lightSrc}']`);
                if (element) {
                    element.src = img.darkSrc;
                }
            }
        });
    });
    
    themeButton2.addEventListener("click", function () {
        ThemeSwitch();
        document.documentElement.style.setProperty('--back', "#f2f2f2");
        document.querySelector("header").style.setProperty("background-color", "#fff");
        document.getElementById("menu_butt").style.setProperty("background-color", "#fff");
        const allChildren = document.getElementById("profile_menu").querySelectorAll('button');
        allChildren.forEach(child => {
            child.style.setProperty("background-color", '#f2f2f2');
        });
        const filterchildren = document.querySelectorAll(".filter-item");
        filterchildren.forEach((child, index) => {
            if (index !== 0) {
                child.style.setProperty("color", "#000");
            }
        });
        const labels = document.querySelectorAll(".checkbox-label");
        labels.forEach(child => {
            child.style.setProperty("color", "#000");
        });
        document.querySelector(".namelabel").style.setProperty("color", "#000");
        const items = document.querySelectorAll(".item");
        items.forEach(item => {
            item.style.setProperty("box-shadow", "5px 5px 5px #888");
        });
        cont.style.setProperty("background", "linear-gradient(180deg, rgba(var(--accent), 30%) 15%, #0000 85%), url(images/BACKGROUND.jpg)");
        cont.style.setProperty("background-size", "100% 145%");
        cont.style.setProperty("background-position-y", "-260px");
    
        const images = [
            { class: "arr_dwn", lightSrc: "images/arr_dwn1.png", darkSrc: "images/arr_dwn1-.png" },
            { class: "orn", lightSrc: "images/orn2.png", darkSrc: "images/orn2-.png" },
            { class: "profile_img", lightSrc: "images/profile2.png", darkSrc: "images/profile2-.png" },
            { class: "", lightSrc: "images/star_fav1.png", darkSrc: "images/star_fav1-.png" }
        ];
    
        images.forEach(img => {
            if (img.class) {
                const elements = document.querySelectorAll(`.${img.class}`);
                elements.forEach(element => {
                    element.src = img.lightSrc;
                });
            } else {
                const element = document.querySelector(`img[src='${img.darkSrc}']`);
                if (element) {
                    element.src = img.lightSrc;
                }
            }
        });
    });

    
    let isCreateButtonClicked = false;

    // Обработчик события для кнопки "создать маршрут"
    create.addEventListener("click", function() {
        isCreateButtonClicked = !isCreateButtonClicked; // Переключаем флаг при каждом клике

        create.classList.toggle("active");
        routeform.classList.add("display");
        filterform.classList.remove("display");
        sw_route.classList.add("active");
        sw_filt.classList.remove("active");
        placesButton.click();

        // Выполняем filterPlaces, которая будет проверять флаг
        filterPlaces();
    });

    // Функция для создания списка тегов в фильтрах
    function createTagList(tags) {
        const filterContainer = document.getElementById('filterContainer');
        filterContainer.innerHTML = '<button class="filters_clear" type="button">Сброс</button><label class="filter-item"><input type="checkbox" value="favourites" id="favfilt"> <span></span>Избранные</label>';
        tags.forEach(tag => {
            const tagItem = document.createElement('label');
            tagItem.className = 'filter-item';
            tagItem.innerHTML = `<input type="checkbox" value="${tag.id}"> <span></span><span class="checkbox-label">${tag.tag_name}</span>`;
            filterContainer.appendChild(tagItem);

            // Add event listener to each checkbox
            tagItem.querySelector('input').addEventListener('change', handleFilterChange);
        });

        // Add event listener to "Избранные" checkbox
        document.querySelector('#filterContainer input[value="favourites"]').addEventListener('change', function() {
            filterFavorites = this.checked;
            handleFilterChange();
        });
    }
    // Функция для получения тегов с сервера
    function fetchTags() {
        fetch('/tags')
            .then(response => response.json())
            .then(tags => {
                createTagList(tags);
            })
            .catch(error => console.error('Error fetching tags:', error));
    }
    function handleFilterChange() {
        selectedTagIds = Array.from(document.querySelectorAll('#filterContainer input[type="checkbox"]:checked'))
            .map(checkbox => parseInt(checkbox.value, 10))
            .filter(value => !isNaN(value));
    
        if (currentUrl === '/routes') {
            filterRoutes(); // Фильтрация маршрутов
        } else if (currentUrl === '/places') {
            filterPlaces(); // Фильтрация мест
        }
    }
    
    async function filterPlaces() {
        let data = await fetchData('/places');

        if (selectedTagIds.length > 0) {
            data = data.filter(place => {
                const placeTagIds = place.Tags.map(tag => tag.tag_id);
                return selectedTagIds.every(tagId => placeTagIds.includes(tagId));
            });
        }

        currentData = data;
        currentPlacesIndex = 0;
        cardsContainer.innerHTML = ''; // Очистка старых карточек мест
        loadMorePlaces(); // Обновление карточек мест
        if (data.length > 0) {
            scrollToContent(); // Прокрутка к контенту, если есть карточки мест
        }

        if (isCreateButtonClicked) {
            const favButtons = document.querySelectorAll(".favourite");
            favButtons.forEach(button => {
                button.classList.toggle("display", !button.classList.contains("display"));
            });

            const addButtons = document.querySelectorAll(".add_to_route");
            addButtons.forEach(button => {
                button.classList.toggle("display", !button.classList.contains("display"));
            });
        }
    }
    
    function resetFilters() {
        const checkboxes = document.querySelectorAll('#filterContainer input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        
        selectedTagIds = [];
        filterFavorites = false;
        handleFilterChange();
    }
    const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.classList && node.classList.contains('filters_clear')) {
                        node.addEventListener('click', (event) => {
                            event.preventDefault();
                            resetFilters();
                        });
                    }
                });
            });
        });
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    // Вызов функции для получения тегов при загрузке страницы
    fetchTags();
    // Инициализация загрузки мест при загрузке страницы
    placesButton.click();
    // Обработчик события для загрузки дополнительных элементов при нажатии на кнопку "Ещё"
    loadMoreButton.addEventListener('click', function () {
        if (currentUrl === '/places') {
            loadMorePlaces();
        } else if (currentUrl === '/routes') {
        }
    });
    const registerBtn = document.getElementById("register_btn");
    const registerPopup = document.getElementById("registerPopup");
    const closeBtn = document.getElementsByClassName("close")[0];
    // Обработчик события для открытия окна регистрации
    registerBtn.onclick = function () {
        registerPopup.style.display = "flex";
    };
    // Обработчик события для закрытия окна регистрации
    closeBtn.onclick = function () {
        registerPopup.style.display = "none";
    };
    // Обработчик события для закрытия окна регистрации при клике вне его
    window.onclick = function (event) {
        if (event.target == registerPopup) {
            registerPopup.style.display = "none";
        }
    };
    // Обработчик клика по звездам
    window.handleRatingClick = async function (event) {
        const star = event.target.closest('.star');
        const rating = parseInt(star.id.replace('star', ''));
        const card = star.closest('.item');
        const placeId = card.dataset.placeId;
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/ratings/rate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ place_id: placeId, rating: rating })
            });

            const data = await response.json();
            if (response.ok) {
                const stars = star.parentNode.parentNode.querySelectorAll('.star');
                stars.forEach((s, i) => {
                    if (i < rating) {
                        s.classList.add('rated');
                        s.style.backgroundImage = "url('images/star1.svg')";
                    } else {
                        s.classList.remove('rated');
                        s.style.backgroundImage = "url('images/star.svg')";
                    }
                });
                updateCardAverageRating(placeId, data.averageRating);
                await loadUserData(); // Обновляем данные пользователя после изменения оценки
            } else {
                console.error('Error:', data);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };
    // Обработчик события для закрытия окна регистрации по нажатию Escape
    document.addEventListener('keydown', function (event) {
        if (event.key === "Escape") {
            registerPopup.style.display = "none";
        }
    });
    const registerForm = document.getElementById('registerForm');
    const errorContainer = document.createElement('div');
    errorContainer.className = 'error-message';
    errorContainer.style.color = 'red';
    registerForm.insertBefore(errorContainer, registerForm.querySelector('.submit'));
    // Обработчик события для отправки формы регистрации
    registerForm.addEventListener('submit', function (event) {
        event.preventDefault();
        errorContainer.textContent = ''; // Clear previous errors

        const formData = new FormData(registerForm);
        const data = {
            username: formData.get('reg_login'),
            email: formData.get('reg_mail'),
            password: formData.get('reg_pwd'),
            confirmPassword: formData.get('reg_confirm_pwd')
        };

        // Password validation
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
        if (!passwordRegex.test(data.password)) {
            errorContainer.textContent = 'Пароль должен содержать минимум 8 символов и включать буквы и цифры.';
            return;
        }

        fetch('/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                errorContainer.textContent = data.error;
            } else {
                alert('Регистрация прошла успешно!');
                registerPopup.style.display = "none";
            }
        })
        .catch(error => {
            console.error('Error:', error);
            errorContainer.textContent = 'Произошла непредвиденная ошибка. Пожалуйста, попробуйте позже.';
        });
    });
    const loginForm = document.getElementById('loginForm');
    const loginErrorContainer = document.getElementById('loginError');
    // Обработчик события для отправки формы логина
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        loginErrorContainer.textContent = ''; // Clear previous errors

        const formData = new FormData(loginForm);
        const data = {
            email: formData.get('mail'),
            password: formData.get('pwd')
        };

        const response = await fetch('/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            localStorage.setItem('token', result.token);
            showProfileButton();
            document.getElementById("login").style.display = "none"; // Hide login form
            window.location.reload(); // Reload the page after successful login
        } else {
            loginErrorContainer.textContent = result.error;
        }
    });
    // Обработчик события для выхода из системы
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('token');
        showLoginButton();
        window.location.reload(); // Reload the page
    });
    // Show or hide buttons based on authentication status
    function showProfileButton() {
        loginFormContainer.style.display = 'none';
        profileButton.style.display = 'block';
    }
    function showLoginButton() {
        loginFormContainer.style.display = 'block';
        profileButton.style.display = 'none';
    }
});
// Функция для показа/скрытия пароля
function ShowPassword() {
    const x = document.getElementById("pwd");
    x.type = x.type === "password" ? "text" : "password";
}
// Функция для смены изображения в карточке
function changeImage(event, direction) {
    const imageContainer = event.target.closest('.image-container');
    const card = imageContainer.closest('.item');
    const photos = JSON.parse(card.dataset.photos);
    let currentPhotoIndex = parseInt(card.dataset.currentPhotoIndex, 10);
    const placeId = card.dataset.placeId || card.dataset.routeId;
    const placeName = card.querySelector('.Name').textContent;

    // Функция для проверки доступности изображения
    function checkImageStatus(url, callback) {
        const img = new Image();

        img.onload = function () {
            callback(true);  // Если изображение доступно
        };

        img.onerror = function () {
            // Пропуск ошибочного изображения и загрузка следующего
            currentPhotoIndex = (currentPhotoIndex + direction + photos.length) % photos.length;
            loadImage(currentPhotoIndex);  // Переход на следующее изображение
        };

        img.src = url;  // Проверка доступности изображения
    }

    // Функция для загрузки следующего изображения
    function loadImage(index) {
        const imgElement = imageContainer.querySelector('.item_img');
        const photoUrl = photos[index].photo_url || photos[index];  // Для маршрутов может быть просто URL

        // Проверяем доступность изображения
        checkImageStatus(photoUrl, function (isAvailable) {
            if (isAvailable) {
                // Устанавливаем новый URL изображения
                imgElement.src = photoUrl;
                card.dataset.currentPhotoIndex = currentPhotoIndex;
            } else {
                // Подавляем нежелательные сообщения в консоли
                console.warn(`Не удалось загрузить изображение для "${placeName}" (ID: ${placeId}). Переход к следующему изображению.`);
            }
        });
    }

    // Пытаемся загрузить следующее изображение
    currentPhotoIndex = (currentPhotoIndex + direction + photos.length) % photos.length;
    loadImage(currentPhotoIndex);
}
// Пример вызова функции при клике на элемент
document.querySelectorAll('.image-container').forEach(container => {
    container.addEventListener('click', function(event) {
        changeImage(event, 1);  // Пример смены на следующее изображение
    });
});
// Обработчик клика по кнопке лайка
window.handleLikeClick = async function (event) {
    const token = localStorage.getItem('token');
    if (!token) {
        document.getElementById("registerPopup").style.display = "flex";
        return;
    }

    const button = event.currentTarget;
    const card = button.closest('.item');
    const placeId = card.dataset.placeId;
    const isLiked = button.classList.contains('liked');

    const url = isLiked ? '/favorites/remove' : '/favorites/add';

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ place_id: placeId })
        });

        const data = await response.json();
        if (response.ok) {
            button.classList.toggle('liked');
            const img = button.querySelector('img');
            img.src = button.classList.contains('liked') ? 'images/heart1.svg' : 'images/heart2.svg';
             // Обновляем данные пользователя после изменения лайка
        } else {
            console.error('Error:', data);
        }
    } catch (error) {
        console.error('Error:', error);
    }
};
// Добавляем события для изменения изображения при наведении
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.favourite').forEach(button => {
        const img = button.querySelector('img');

        button.addEventListener('mouseover', () => {
            img.src = 'images/heart1.svg';
        });

        button.addEventListener('mouseout', () => {
            if (!button.classList.contains('liked')) {
                img.src = 'images/heart2.svg';
            }
        });
    });
});

function checkH1Lengths() {
    const h1Elements = document.querySelectorAll('.Name');
    const maxLength = 25;
    const maxLength2 = 30;

    h1Elements.forEach(h1 => {
        if (h1.textContent.length > maxLength) {
            h1.style.fontSize = '28px';
        }
        if (h1.textContent.length > maxLength2){
            h1.style.fontSize = '25px';
        }
    });
}
const colors = [
    "27, 120, 242",   // Стандарт
    "80, 120, 80",    // лесной-зеленый
    "83, 110, 152",   // бледно-синяя
    "0, 150, 120",    // Рома
    "0, 100, 40",     // Искен
    "100, 0, 40",     // малиновая
    "200, 70, 50",    // клубничная
    "200, 120, 70",   // бежевая
    "200, 90, 40"     // оранжевая
];

let currentIndex = 0;

const themeColorButton = document.getElementById("ThemeColorButton");

themeColorButton.addEventListener("click", function() {
    // Меняем значение CSS-переменной --accent
    document.documentElement.style.setProperty('--accent', colors[currentIndex]);

    // Увеличиваем индекс, возвращаем в начало, если дошли до конца
    currentIndex = (currentIndex + 1) % colors.length;
}); 

/*const root = document.documentElement;
const colors = [
  [150, 0, 0],    // красный
  [150, 75, 0],   // оранжевый
  [150, 150, 0],  // желтый
  [0, 150, 0],    // зеленый
  [0, 150, 150],  // голубой
  [0, 0, 150],    // синий
  [75, 0, 150]    // фиолетовый
];

let currentColorIndex = 0;
let nextColorIndex = 1;
let step = 0;
const stepsPerColor = 200; // количество шагов для плавного перехода

function interpolateColor(color1, color2, factor) {
  return color1.map((c, i) => Math.round(c + factor * (color2[i] - c)));
}

function animate() {
  const currentColor = colors[currentColorIndex];
  const nextColor = colors[nextColorIndex];
  const factor = step / stepsPerColor;
  const interpolatedColor = interpolateColor(currentColor, nextColor, factor);
  const colorString = `${interpolatedColor[0]}, ${interpolatedColor[1]}, ${interpolatedColor[2]}`;
  
  root.style.setProperty('--blue', colorString); // Устанавливаем значение как строку RGB
  
  step++;
  if (step > stepsPerColor) {
    step = 0;
    currentColorIndex = nextColorIndex;
    nextColorIndex = (nextColorIndex + 1) % colors.length;
  }
  requestAnimationFrame(animate);
}

animate();*/