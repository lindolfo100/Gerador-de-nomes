import requests
from bs4 import BeautifulSoup
from flask import Flask, render_template, request, jsonify
import random
import json
import os

app = Flask(__name__)

# --- Armazenamento de Nomes ---
FAVORITES_FILE = "favorites.json"
initial_names = ["Alice", "Bia", "Clara", "Duda", "Elisa", "Fernanda", "Gabi", "Helena", "Isis", "Julia"]
scraped_names_cache = []

def load_favorites():
    """Carrega os nomes favoritos de um arquivo JSON."""
    if os.path.exists(FAVORITES_FILE):
        with open(FAVORITES_FILE, 'r') as f:
            return json.load(f)
    return []

def save_favorites(names):
    """Salva os nomes favoritos em um arquivo JSON."""
    with open(FAVORITES_FILE, 'w') as f:
        json.dump(names, f, indent=2)

favorite_names = load_favorites()

@app.route('/')
def index():
    return render_template('index.html', names=initial_names)

# --- API para Favoritos ---

@app.route('/api/favorites', methods=['GET'])
def get_favorites():
    return jsonify(favorite_names)

@app.route('/api/favorites', methods=['POST'])
def add_favorite():
    data = request.get_json()
    name = data.get('name')

    if not name:
        return jsonify({'status': 'error', 'message': 'Nome não fornecido'}), 400

    if name not in favorite_names:
        favorite_names.append(name)
        save_favorites(favorite_names)
        return jsonify({'status': 'success', 'message': f'{name} adicionado aos favoritos.'})
    else:
        return jsonify({'status': 'exists', 'message': f'{name} já está nos favoritos.'})

@app.route('/api/favorites', methods=['DELETE'])
def remove_favorite():
    data = request.get_json()
    name = data.get('name')

    if not name:
        return jsonify({'status': 'error', 'message': 'Nome não fornecido'}), 400

    if name in favorite_names:
        favorite_names.remove(name)
        save_favorites(favorite_names)
        return jsonify({'status': 'success', 'message': f'{name} removido dos favoritos.'})
    else:
        return jsonify({'status': 'not_found', 'message': f'{name} não está nos favoritos.'})

# --- API para Web Scraping ---

def scrape_pampers_names():
    """Busca nomes no site da Pampers e retorna uma lista."""
    global scraped_names_cache
    if scraped_names_cache:
        return scraped_names_cache

    try:
        url = "https://www.pampers.com.br/gravidez/nomes-para-o-bebe/artigo/lista-de-nomes-femininos"
        response = requests.get(url)
        response.raise_for_status() # Lança um erro para status ruins (4xx ou 5xx)

        soup = BeautifulSoup(response.content, 'html.parser')

        scraped_names = set() # Usar um set para evitar duplicatas iniciais

        # O conteúdo está dentro de um <p> ou <li>, vamos procurar por tags que contenham texto
        # e que comecem com um número seguido de ponto. Ex: "1. Adele"
        # Esta é uma abordagem frágil, mas deve funcionar para a estrutura atual da página.
        content_tags = soup.find_all(['p', 'li'])
        for tag in content_tags:
            text = tag.get_text().strip()
            # Ex: "1. Adele" ou "1. Alessia – Defensora..."
            if text and text[0].isdigit() and '.' in text:
                # Pega a parte depois do número e ponto
                name_part = text.split('.', 1)[1].strip()
                # Pega a primeira palavra, que geralmente é o nome
                name = name_part.split(' ')[0].split('–')[0].strip()
                if name.isalpha() and len(name) > 2: # Filtra ruídos
                    scraped_names.add(name.capitalize())

        scraped_names_cache = sorted(list(scraped_names))
        return scraped_names_cache
    except requests.RequestException as e:
        print(f"Erro ao acessar a URL: {e}")
        return []

@app.route('/api/scraped-names')
def get_scraped_names():
    names = scrape_pampers_names()
    # Retorna apenas nomes que ainda não estão na lista inicial
    new_names = [name for name in names if name not in initial_names]
    return jsonify(new_names)

# --- API para Geração com IA (Cadeia de Markov) ---

def build_markov_chain(names, chain=None):
    """Constrói ou atualiza um modelo de Cadeia de Markov a partir de uma lista de nomes."""
    if chain is None:
        chain = {}

    for name in names:
        name = "^" + name.lower() + "$" # Marcadores de início e fim
        for i in range(len(name) - 1):
            char = name[i]
            next_char = name[i+1]
            if char not in chain:
                chain[char] = []
            chain[char].append(next_char)
    return chain

def generate_ai_name(chain, min_len=4, max_len=8):
    """Gera um nome usando o modelo de Cadeia de Markov."""
    name = "^"
    while True:
        last_char = name[-1]
        if last_char not in chain:
            break # Fim da linha se não houver continuação

        next_char = random.choice(chain[last_char])
        if next_char == "$":
            break
        name += next_char

    final_name = name[1:].capitalize()
    if min_len <= len(final_name) <= max_len:
        return final_name
    return None # Retorna None se o nome não estiver no tamanho desejado

@app.route('/api/ai-suggestions')
def get_ai_suggestions():
    # Treina o modelo com todos os nomes disponíveis
    all_known_names = initial_names + scraped_names_cache
    if not all_known_names:
        return jsonify([])

    chain = build_markov_chain(all_known_names)

    generated_names = set()
    attempts = 0
    while len(generated_names) < 10 and attempts < 100:
        new_name = generate_ai_name(chain)
        if new_name and new_name not in all_known_names:
            generated_names.add(new_name)
        attempts += 1

    return jsonify(sorted(list(generated_names)))

# --- API para Combinação de Nomes ---

@app.route('/api/combine-names', methods=['POST'])
def combine_names_api():
    data = request.get_json()
    name1 = data.get('name1', '').strip().capitalize()
    name2 = data.get('name2', '').strip().capitalize()

    if not name1 or not name2:
        return jsonify({'error': 'Por favor, forneça dois nomes.'}), 400

    if len(name1) < 2 or len(name2) < 2:
        return jsonify({'error': 'Os nomes devem ter pelo menos 2 caracteres.'}), 400

    combinations = set()

    # Combinação 1: Metade + Metade
    mid1 = len(name1) // 2
    mid2 = len(name2) // 2
    combinations.add(name1[:mid1] + name2[mid2:])
    combinations.add(name2[:mid2] + name1[mid1:])

    # Combinação 2: Início + Fim
    combinations.add(name1[:mid1] + name2[-mid2:])
    combinations.add(name2[:mid2] + name1[-mid1:])

    # Combinação 3: Nome Composto
    combinations.add(f"{name1} {name2}")

    # Filtra os resultados para serem únicos e não iguais aos originais
    final_combinations = [c for c in combinations if c != name1 and c != name2]

    return jsonify(sorted(list(final_combinations)))


if __name__ == '__main__':
    app.run(debug=True)
