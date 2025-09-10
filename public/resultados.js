document.addEventListener('DOMContentLoaded', () => {
  const resultsList = document.getElementById('results-list');
  const loadingMessage = document.getElementById('loading-message');

  // Pega os filtros do sessionStorage
  const storedFilters = sessionStorage.getItem('name_filters');
  if (!storedFilters) {
    loadingMessage.textContent = 'Nenhum filtro selecionado. Por favor, volte para a página inicial e gere novos nomes.';
    return;
  }

  const filters = JSON.parse(storedFilters);

  async function fetchAndDisplayNames() {
    try {
      // Constrói a URL com query parameters
      const params = new URLSearchParams(filters).toString();
      const response = await fetch(`/.netlify/functions/generate_names?${params}`);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Falha ao buscar nomes: ${response.status} ${response.statusText}. Detalhes: ${errorText}`);
      }

      const names = await response.json();
      loadingMessage.style.display = 'none'; // Esconde a mensagem de "carregando"

      if (names.length === 0) {
        resultsList.innerHTML = '<p class="text-center text-gray-500">Nenhum nome encontrado com esses filtros. Tente outras combinações!</p>';
        return;
      }

      // Limpa a lista antes de adicionar novos itens
      resultsList.innerHTML = '';

      names.forEach(nameInfo => {
        const nameCard = `
          <div class="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm">
            <span class="font-bold text-lg text-[#1a0f0f]">${nameInfo.nome}</span>
            <button class="save-btn flex size-10 items-center justify-center rounded-full bg-gray-100 hover:bg-red-100 transition-colors" data-name='${JSON.stringify(nameInfo)}'>
              <svg fill="currentColor" height="22px" viewBox="0 0 256 256" width="22px" class="pointer-events-none text-gray-400"><path d="M184,32H72A16,16,0,0,0,56,48V224a8,8,0,0,0,12.24,6.78L128,193.43l59.77,37.35A8,8,0,0,0,200,224V48A16,16,0,0,0,184,32Zm0,177.57-51.77-32.35a8,8,0,0,0-8.48,0L72,209.57V48H184Z"></path></svg>
            </button>
          </div>
        `;
        resultsList.insertAdjacentHTML('beforeend', nameCard);
      });

    } catch (error) {
      console.error('Erro ao buscar nomes:', error);
      loadingMessage.textContent = `❌ Erro ao buscar nomes: ${error.message}`;
    }
  }

  resultsList.addEventListener('click', async (event) => {
    if (event.target.classList.contains('save-btn')) {
      const button = event.target;
      // Pega o objeto do nome do atributo data
      const nameInfo = JSON.parse(button.dataset.name);

      try {
        await fetch('/.netlify/functions/add_favorite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: nameInfo }), // Salva o objeto inteiro
        });

        // Feedback visual
        button.disabled = true;
        button.classList.remove('bg-gray-100', 'hover:bg-red-100');
        button.classList.add('bg-red-500');
        button.querySelector('svg').classList.add('text-white');

      } catch (error) {
        console.error('Erro ao salvar nome:', error);
        alert('Não foi possível salvar o nome. Tente novamente.');
      }
    }
  });

  fetchAndDisplayNames();
});
