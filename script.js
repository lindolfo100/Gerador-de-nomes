document.addEventListener('DOMContentLoaded', () => {
    // Existing variables
    const generateButton = document.getElementById('generate-button');
    const nameListDiv = document.getElementById('name-list');
    const genderFilter = document.getElementById('gender-filter');
    const nameSearchInput = document.getElementById('name-search-input');
    const favoritesList = document.getElementById('favorites-list');

    // New variables for meaning search
    const searchMeaningButton = document.getElementById('search-meaning-button');
    const meaningInput = document.getElementById('meaning-input');
    const meaningResultDiv = document.getElementById('meaning-result');

    let favorites = JSON.parse(localStorage.getItem('favoriteNames')) || [];

    // --- FAVORITES FUNCTIONS ---
    function saveFavorites() {
        localStorage.setItem('favoriteNames', JSON.stringify(favorites));
    }

    function displayFavorites() {
        favoritesList.innerHTML = '';
        favorites.forEach(name => {
            const li = document.createElement('li');
            li.textContent = name;
            favoritesList.appendChild(li);
        });
    }

    function toggleFavorite(name, button) {
        if (favorites.includes(name)) {
            favorites = favorites.filter(fav => fav !== name);
            button.textContent = '♡';
        } else {
            favorites.push(name);
            button.textContent = '♥';
        }
        saveFavorites();
        displayFavorites();
    }

    // --- NAME DISPLAY AND FILTERING FUNCTIONS ---
    function displayNames(names) {
        nameListDiv.innerHTML = '';
        const ul = document.createElement('ul');
        names.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item.name + ' ';
            const favButton = document.createElement('button');
            favButton.textContent = favorites.includes(item.name) ? '♥' : '♡';
            favButton.classList.add('fav-button');
            favButton.addEventListener('click', () => toggleFavorite(item.name, favButton));
            li.appendChild(favButton);
            ul.appendChild(li);
        });
        nameListDiv.appendChild(ul);
    }

    function filterNames() {
        const selectedGender = genderFilter.value;
        const searchTerm = nameSearchInput.value.toUpperCase();
        let filteredNames = popularNames;

        if (selectedGender !== 'all') {
            filteredNames = filteredNames.filter(name => name.gender === selectedGender);
        }
        if (searchTerm) {
            filteredNames = filteredNames.filter(name => name.name.includes(searchTerm));
        }
        displayNames(filteredNames);
    }

    // --- MEANING SEARCH FUNCTION ---
    function searchMeaning() {
        const nameToSearch = meaningInput.value.trim().toUpperCase();
        meaningResultDiv.innerHTML = '';

        if (!nameToSearch) {
            meaningResultDiv.textContent = 'Por favor, digite um nome.';
            return;
        }

        // Mock search logic
        const meanings = {
            "MARIA": "Significa “senhora soberana”, “vidente” ou “a pura”.",
            "JOSE": "Significa “aquele que acrescenta”, “acréscimo do Senhor” ou “Deus multiplica”.",
            "ANA": "Significa \"graciosa\" ou \"cheia de graça\".",
            "JOAO": "Significa “Deus é cheio de graça”, “agraciado por Deus”."
        };

        const meaning = meanings[nameToSearch];

        if (meaning) {
            meaningResultDiv.textContent = meaning;
        } else {
            meaningResultDiv.textContent = `Significado para "${nameToSearch}" não encontrado em nossa base de dados simulada.`;
        }
    }

    // --- INITIAL DISPLAYS & EVENT LISTENERS ---
    displayNames(popularNames);
    displayFavorites();

    generateButton.addEventListener('click', filterNames);
    nameSearchInput.addEventListener('input', filterNames);
    searchMeaningButton.addEventListener('click', searchMeaning);
});
