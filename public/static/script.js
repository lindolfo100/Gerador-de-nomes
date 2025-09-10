document.addEventListener('DOMContentLoaded', () => {
    const nameList = document.getElementById('name-list');
    const favoritesList = document.getElementById('favorites-list');
    const suggestionsList = document.getElementById('suggestion-list');

    // 1. Carregar nomes iniciais e favoritos existentes
    loadInitialNames();
    loadFavorites();

    // 2. Lidar com o clique para adicionar um favorito
    nameList.addEventListener('click', (event) => {
        if (event.target.classList.contains('favorite-btn')) {
            const nameSpan = event.target.previousElementSibling;
            const name = nameSpan.textContent;

            // Adiciona na UI e envia para o backend
            addNameToFavoritesList(name);
            saveFavoriteToServer(name);
        }
    });

    // 3. Lidar com o clique para remover um favorito
    favoritesList.addEventListener('click', (event) => {
        if (event.target.classList.contains('remove-btn')) {
            const li = event.target.parentElement;
            const name = li.querySelector('span').textContent;

            // Remove da UI e envia para o backend
            favoritesList.removeChild(li);
            removeFavoriteFromServer(name);
        }
    });

    // --- Funções Auxiliares ---

    function addNameToFavoritesList(name) {
        const existingNames = Array.from(favoritesList.querySelectorAll('li span')).map(span => span.textContent);
        if (existingNames.includes(name)) {
            return;
        }

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

    async function loadFavorites() {
        try {
            const response = await fetch('/api/favorites');
            const names = await response.json();
            names.forEach(name => addNameToFavoritesList(name));
        } catch (error) {
            console.error('Erro ao carregar favoritos:', error);
        }
    }

    async function saveFavoriteToServer(name) {
        try {
            await fetch('/api/favorites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: name }),
            });
        } catch (error) {
            console.error('Erro ao salvar favorito:', error);
        }
    }

    async function removeFavoriteFromServer(name) {
        try {
            await fetch('/api/favorites', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: name }),
            });
        } catch (error) {
            console.error('Erro ao remover favorito:', error);
        }
    }

    // --- Lógica para Ações (Scraping e IA) ---

    const scrapeBtn = document.getElementById('scrape-btn');
    const aiBtn = document.getElementById('ai-btn');
    const statusMessage = document.getElementById('status-message');

    scrapeBtn.addEventListener('click', async () => {
        statusMessage.textContent = 'Buscando nomes na internet, por favor aguarde...';
        statusMessage.classList.remove('hidden');
        scrapeBtn.disabled = true;
        aiBtn.disabled = true;

        try {
            const response = await fetch('/api/scraped-names');
            const newNames = await response.json();

            if (newNames.length > 0) {
                newNames.forEach(name => addNameToSuggestionList(name));
                statusMessage.textContent = `${newNames.length} novos nomes foram adicionados!`;
            } else {
                statusMessage.textContent = 'Nenhum nome novo encontrado ou a busca já foi realizada.';
            }
        } catch (error) {
            console.error('Erro ao buscar nomes:', error);
            statusMessage.textContent = 'Ocorreu um erro ao buscar os nomes.';
            scrapeBtn.disabled = false; // Permite tentar novamente em caso de erro
        } finally {
            aiBtn.disabled = false;
        }
    });

    aiBtn.addEventListener('click', async () => {
        statusMessage.textContent = 'A IA está gerando nomes, por favor aguarde...';
        statusMessage.classList.remove('hidden');
        aiBtn.disabled = true;
        scrapeBtn.disabled = true;

        try {
            const response = await fetch('/api/ai-suggestions');
            const newNames = await response.json();

            if (newNames.length > 0) {
                newNames.forEach(name => addNameToSuggestionList(name));
                statusMessage.textContent = `A IA gerou ${newNames.length} novos nomes!`;
            } else {
                statusMessage.textContent = 'A IA não conseguiu gerar novos nomes. Tente buscar mais nomes na internet primeiro.';
            }
        } catch (error) {
            console.error('Erro ao gerar nomes com IA:', error);
            statusMessage.textContent = 'Ocorreu um erro ao gerar nomes com a IA.';
        } finally {
            aiBtn.disabled = false;
            scrapeBtn.disabled = false;
        }
    });

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

    // --- Lógica para o Combinador de Nomes ---

    const combineBtn = document.getElementById('combine-btn');
    const name1Input = document.getElementById('name1-input');
    const name2Input = document.getElementById('name2-input');
    const combinationList = document.getElementById('combination-list');
    const combinationResults = document.getElementById('combination-results');

    combineBtn.addEventListener('click', async () => {
        const name1 = name1Input.value;
        const name2 = name2Input.value;

        if (!name1 || !name2) {
            alert('Por favor, insira dois nomes para combinar.');
            return;
        }

        try {
            const response = await fetch('/api/combine-names', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name1: name1, name2: name2 }),
            });

            combinationList.innerHTML = ''; // Limpa resultados anteriores
            const results = await response.json();

            if (response.ok) {
                if (results.length > 0) {
                    results.forEach(name => {
                        const li = document.createElement('li');
                        li.textContent = name;
                        combinationList.appendChild(li);
                    });
                } else {
                    const li = document.createElement('li');
                    li.textContent = 'Nenhuma combinação única encontrada.';
                    combinationList.appendChild(li);
                }
            } else {
                alert(`Erro: ${results.error}`);
            }
        } catch (error) {
            console.error('Erro ao combinar nomes:', error);
            alert('Ocorreu um erro de comunicação com o servidor.');
        }
    });
});
