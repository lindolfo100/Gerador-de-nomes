document.addEventListener('DOMContentLoaded', () => {
  const originSelect = document.getElementById('origin-select');
  const popularitySelect = document.getElementById('popularity-select');
  const generateBtn = document.getElementById('generate-btn');

  async function populateFilters() {
    try {
      const response = await fetch('/.netlify/functions/get_filters');
      if (!response.ok) {
        throw new Error('Não foi possível carregar os filtros.');
      }
      const filters = await response.json();

      // Popula o select de Origem
      filters.origins.forEach(origin => {
        const option = document.createElement('option');
        option.value = origin.value;
        option.textContent = origin.label;
        originSelect.appendChild(option);
      });

      // Popula o select de Popularidade
      filters.popularity.forEach(pop => {
        const option = document.createElement('option');
        option.value = pop.value;
        option.textContent = pop.label;
        popularitySelect.appendChild(option);
      });

    } catch (error) {
      console.error('Erro ao popular filtros:', error);
      // Poderíamos mostrar um erro na UI aqui
    }
  }

  generateBtn.addEventListener('click', () => {
    const selectedGender = document.querySelector('input[name="gender"]:checked').value;
    const selectedOrigin = originSelect.value;
    const selectedPopularity = popularitySelect.value;

    const filters = {
      gender: selectedGender,
      origin: selectedOrigin,
      popularity: selectedPopularity
    };

    // Armazena os filtros no sessionStorage para a página de resultados usar
    sessionStorage.setItem('name_filters', JSON.stringify(filters));

    // Redireciona para a página de resultados
    window.location.href = 'resultados.html';
  });

  // Carrega os filtros quando a página é carregada
  populateFilters();
});
