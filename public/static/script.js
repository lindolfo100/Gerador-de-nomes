document.addEventListener('DOMContentLoaded', () => {
    const nameList = document.getElementById('name-list');
    const favoritesList = document.getElementById('favorites-list');
    const suggestionsList = document.getElementById('suggestion-list');
    const errorDisplay = document.getElementById('error-display');

    function showError(message) {
        errorDisplay.textContent = `❌ Erro: ${message}`;
        errorDisplay.classList.remove('hidden');
    }

    function addNameToFavoritesList(name) {
        const existingNames = Array.from(favoritesList.querySelectorAll('li span')).map(span => span.textContent);
        if (existingNames.includes(name)) return;
        const li = document.createElement('li');
        const span = document.createElement('span');
        span.textContent = name;
        li.appendChild(span);
        const removeBtn = document.createElement('button');
        removeBtn.textContent = '❌';
        removeBtn.className = 'remove-btn';
        li.appendChild(removeBtn);
        favoritesList.appendChild(li);
    }

    function addNameToSuggestionList(name) {
        const li = document.createElement('li');
        const span = document.createElement('span');
        span.textContent = name;
        const button = document.createElement('button');
        button.className = 'favorite-btn';
        button.textContent = '❤️';
        li.appendChild(span);
        li.appendChild(button);
        suggestionsList.appendChild(li);
    }

    async function fetchData(url, options = {}) {
        const response = await fetch(url, options);
        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Falha na chamada da API para ${url}: ${response.status} ${response.statusText}. Detalhes: ${errorBody}`);
        }
        return response.json();
    }

    async function loadInitialData() {
        try {
            const initialNames = await fetchData('/.netlify/functions/initial_names');
            initialNames.forEach(addNameToSuggestionList);

            const favoriteNames = await fetchData('/.netlify/functions/get_favorites');
            favoriteNames.forEach(addNameToFavoritesList);
        } catch (error) {
            showError(`${error.message}. Verifique se as variáveis de ambiente (chaves de API) estão configuradas corretamente no Netlify e se as funções serverless foram implantadas sem erros.`);
            console.error(error);
        }
    }

    loadInitialData();

    nameList.addEventListener('click', async (event) => {
        if (event.target.classList.contains('favorite-btn')) {
            const name = event.target.previousElementSibling.textContent;
            addNameToFavoritesList(name);
            try {
                await fetchData('/.netlify/functions/add_favorite', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name }),
                });
            } catch (error) {
                showError(`Não foi possível salvar o favorito. ${error.message}`);
                console.error(error);
            }
        }
    });

    favoritesList.addEventListener('click', async (event) => {
        if (event.target.classList.contains('remove-btn')) {
            const li = event.target.parentElement;
            const name = li.querySelector('span').textContent;
            favoritesList.removeChild(li);
            try {
                await fetchData('/.netlify/functions/remove_favorite', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name }),
                });
            } catch (error) {
                showError(`Não foi possível remover o favorito. ${error.message}`);
                console.error(error);
            }
        }
    });

    const scrapeBtn = document.getElementById('scrape-btn');
    const aiBtn = document.getElementById('ai-btn');
    const statusMessage = document.getElementById('status-message');

    scrapeBtn.addEventListener('click', async () => {
        statusMessage.textContent = 'Buscando nomes...';
        statusMessage.classList.remove('hidden');
        scrapeBtn.disabled = true;
        aiBtn.disabled = true;
        try {
            const newNames = await fetchData('/.netlify/functions/scraped_names');
            if (newNames.length > 0) {
                newNames.forEach(addNameToSuggestionList);
                statusMessage.textContent = `${newNames.length} novos nomes adicionados!`;
            } else {
                statusMessage.textContent = 'Nenhum nome novo encontrado.';
            }
        } catch (error) {
            showError(error.message);
            console.error(error);
        } finally {
            scrapeBtn.disabled = false;
            aiBtn.disabled = false;
        }
    });

    aiBtn.addEventListener('click', async () => {
        statusMessage.textContent = 'Gerando nomes com IA...';
        statusMessage.classList.remove('hidden');
        aiBtn.disabled = true;
        scrapeBtn.disabled = true;
        try {
            const newNames = await fetchData('/.netlify/functions/ai_suggestions');
            if (newNames.length > 0) {
                newNames.forEach(addNameToSuggestionList);
                statusMessage.textContent = `A IA gerou ${newNames.length} novos nomes!`;
            } else {
                statusMessage.textContent = 'A IA não conseguiu gerar novos nomes.';
            }
        } catch (error) {
            showError(error.message);
            console.error(error);
        } finally {
            aiBtn.disabled = false;
            scrapeBtn.disabled = false;
        }
    });

    const combineBtn = document.getElementById('combine-btn');
    const name1Input = document.getElementById('name1-input');
    const name2Input = document.getElementById('name2-input');
    const combinationList = document.getElementById('combination-list');

    combineBtn.addEventListener('click', async () => {
        const name1 = name1Input.value;
        const name2 = name2Input.value;
        if (!name1 || !name2) {
            alert('Por favor, insira dois nomes.');
            return;
        }
        try {
            const results = await fetchData('/.netlify/functions/combine_names', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name1, name2 }),
            });
            combinationList.innerHTML = '';
            if (results.length > 0) {
                results.forEach(name => {
                    const li = document.createElement('li');
                    li.textContent = name;
                    combinationList.appendChild(li);
                });
            } else {
                combinationList.innerHTML = '<li>Nenhuma combinação encontrada.</li>';
            }
        } catch (error) {
            alert(`Erro ao combinar nomes: ${error.message}`);
            console.error(error);
        }
    });
});
