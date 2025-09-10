document.addEventListener('DOMContentLoaded', () => {
  const savedList = document.getElementById('saved-names-list');
  const loadingMessage = document.getElementById('loading-message');

  async function fetchAndDisplaySavedNames() {
    try {
      const response = await fetch('/.netlify/functions/get_favorites');
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Falha ao buscar nomes salvos: ${response.status} ${response.statusText}. Detalhes: ${errorText}`);
      }

      const names = await response.json();
      loadingMessage.style.display = 'none';

      if (names.length === 0) {
        savedList.innerHTML = '<p class="text-center text-gray-500">Você ainda não salvou nenhum nome.</p>';
        return;
      }

      savedList.innerHTML = '';

      names.forEach(nameInfo => {
        const nameCard = `
          <div class="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm">
            <div>
              <p class="font-bold text-lg text-[#1a0f0f]">${nameInfo.nome}</p>
              <p class="text-sm text-gray-500">Popularidade: #${nameInfo.rank} | Gênero: ${nameInfo.sexo}</p>
            </div>
            <button class="remove-btn flex size-10 items-center justify-center rounded-full bg-gray-100 hover:bg-red-100 transition-colors" data-name='${JSON.stringify(nameInfo)}'>
              <svg class="pointer-events-none" fill="currentColor" height="20" viewBox="0 0 256 256" width="20"><path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96ZM192,208H64V64H192Zm-80-104V160a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0V160a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z"></path></svg>
            </button>
          </div>
        `;
        savedList.insertAdjacentHTML('beforeend', nameCard);
      });

    } catch (error) {
      console.error('Erro ao buscar nomes salvos:', error);
      loadingMessage.textContent = `❌ Erro: ${error.message}`;
    }
  }

  savedList.addEventListener('click', async (event) => {
    const button = event.target.closest('.remove-btn');
    if (button) {
      const nameInfo = JSON.parse(button.dataset.name);

      // Remove da UI
      button.parentElement.remove();

      try {
        await fetch('/.netlify/functions/remove_favorite', {
          method: 'POST', // Usando POST para enviar um corpo, como o Netlify Functions espera
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: nameInfo }),
        });
      } catch (error) {
        console.error('Erro ao remover nome:', error);
        alert('Não foi possível remover o nome. Tente recarregar a página.');
        // Opcional: Adicionar o item de volta à lista se a remoção falhar
      }
    }
  });

  fetchAndDisplaySavedNames();
});
