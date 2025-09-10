// script.js

const nomesIniciais = [
  {
    nome: "Aurora",
    genero: "menina",
    origem: "Latina",
    popularidade: "Top 10",
    significado:
      "Amanhecer. Na mitologia romana, Aurora é a deusa do amanhecer, que personifica o nascer do sol e traz a luz para um novo dia.",
    variacoes: ["Aura", "Aurélia", "Rory", "Oriana"],
    favorito: false,
  },
  {
    nome: "Benjamin",
    genero: "menino",
    origem: "Hebraica",
    popularidade: "Top 10",
    significado: "Filho da mão direita, filho da felicidade. Um nome bíblico.",
    variacoes: ["Ben", "Benji"],
    favorito: false,
  },
  {
    nome: "Clara",
    genero: "menina",
    origem: "Latina",
    popularidade: "Top 50",
    significado: "Brilhante, ilustre. Um nome que evoca luz e pureza.",
    variacoes: ["Clarice", "Clare"],
    favorito: false,
  },
  {
    nome: "Davi",
    genero: "menino",
    origem: "Hebraica",
    popularidade: "Top 10",
    significado: "O amado, o querido. Nome do famoso rei bíblico.",
    variacoes: ["David"],
    favorito: false,
  },
  {
    nome: "Estela",
    genero: "menina",
    origem: "Latina",
    popularidade: "Raro",
    significado: "Estrela. Um nome poético e luminoso.",
    variacoes: ["Stella"],
    favorito: false,
  },
  {
    nome: "Felipe",
    genero: "menino",
    origem: "Grega",
    popularidade: "Top 50",
    significado:
      "Amigo dos cavalos. Nome de diversos reis e imperadores, como Filipe II da Macedônia.",
    variacoes: ["Phil", "Phelipe"],
    favorito: false,
  },
  {
    nome: "Gabriela",
    genero: "menina",
    origem: "Hebraica",
    popularidade: "Top 50",
    significado: "Mulher forte de Deus. Variação feminina de Gabriel.",
    variacoes: ["Gabi", "Gabrielly"],
    favorito: false,
  },
  {
    nome: "Henrique",
    genero: "menino",
    origem: "Germânica",
    popularidade: "Top 10",
    significado: "Senhor do lar, governante da casa. Um nome de realeza.",
    variacoes: ["Henry"],
    favorito: false,
  },
  {
    nome: "Isabela",
    genero: "menina",
    origem: "Hebraica",
    popularidade: "Top 10",
    significado: "Consagrada a Deus, meu Deus é juramento. Variação de Isabel.",
    variacoes: ["Bela", "Isabelly"],
    favorito: false,
  },
  {
    nome: "João",
    genero: "menino",
    origem: "Hebraica",
    popularidade: "Top 10",
    significado:
      "Deus é cheio de graça. Um dos nomes mais populares no Brasil.",
    variacoes: ["John", "Juan"],
    favorito: false,
  },
  {
    nome: "Luana",
    genero: "menina",
    origem: "Germânica/Hebraica",
    popularidade: "Top 50",
    significado:
      "Guerreira gloriosa ou a graciosa. Combinação de 'Lu' (guerreira) e 'Ana' (graciosa).",
    variacoes: ["Luanne"],
    favorito: false,
  },
  {
    nome: "Mateus",
    genero: "menino",
    origem: "Hebraica",
    popularidade: "Top 10",
    significado:
      "Dom de Deus, presente de Deus. Nome de um dos apóstolos de Jesus.",
    variacoes: ["Matheus", "Matthew"],
    favorito: false,
  },
  {
    nome: "Nicole",
    genero: "menina",
    origem: "Grega",
    popularidade: "Top 50",
    significado:
      "Vitória do povo. Forma feminina de Nicolau, popular em vários países.",
    variacoes: ["Nicki", "Nikole"],
    favorito: false,
  },
  {
    nome: "Pedro",
    genero: "menino",
    origem: "Grega",
    popularidade: "Top 10",
    significado: "Pedra, rochedo. Nome de um dos principais apóstolos.",
    variacoes: ["Peter", "Pietro"],
    favorito: false,
  },
  {
    nome: "Sophia",
    genero: "menina",
    origem: "Grega",
    popularidade: "Top 10",
    significado: "Sabedoria, conhecimento. Um nome clássico e elegante.",
    variacoes: ["Sofia"],
    favorito: false,
  },
];

// Salvar a lista de nomes no localStorage (apenas uma vez, se ainda não existir)
if (!localStorage.getItem("nomesCompletos")) {
  localStorage.setItem("nomesCompletos", JSON.stringify(nomesIniciais));
}

// Funções para carregar e salvar favoritos
function getFavoritos() {
  const favoritos = localStorage.getItem("nomesFavoritos");
  return favoritos ? JSON.parse(favoritos) : [];
}

function salvarFavoritos(favoritos) {
  localStorage.setItem("nomesFavoritos", JSON.stringify(favoritos));
}

function adicionarOuRemoverFavorito(nomeCompleto) {
  let favoritos = getFavoritos();
  const index = favoritos.findIndex((n) => n.nome === nomeCompleto.nome);

  if (index > -1) {
    favoritos.splice(index, 1); // Remover se já existe
    nomeCompleto.favorito = false;
  } else {
    favoritos.push({ ...nomeCompleto, favorito: true }); // Adicionar se não existe
    nomeCompleto.favorito = true;
  }
  salvarFavoritos(favoritos);

  // Atualizar o localStorage de nomesCompletos para refletir o estado de favorito
  let todosNomes = JSON.parse(localStorage.getItem("nomesCompletos"));
  const indexInAllNames = todosNomes.findIndex(
    (n) => n.nome === nomeCompleto.nome
  );
  if (indexInAllNames > -1) {
    todosNomes[indexInAllNames].favorito = nomeCompleto.favorito;
    localStorage.setItem("nomesCompletos", JSON.stringify(todosNomes));
  }

  return nomeCompleto.favorito; // Retorna o novo estado
}

// Função para obter o estado de favorito de um nome
function isFavorito(nomeAtual) {
  const favoritos = getFavoritos();
  return favoritos.some((nome) => nome.nome === nomeAtual);
}

// Aguardar o carregamento completo do DOM
document.addEventListener("DOMContentLoaded", () => {
  // --- Lógica Comum para todas as páginas (navegação do footer) ---
  const footerLinks = document.querySelectorAll("footer a");
  footerLinks.forEach((link) => {