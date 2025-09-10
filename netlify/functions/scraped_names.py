import json
import requests
from bs4 import BeautifulSoup

# Cache em memória para a função serverless (dura apenas para invocações "quentes")
scraped_names_cache = []

def scrape_pampers_names():
    """Busca nomes no site da Pampers e retorna uma lista."""
    global scraped_names_cache
    if scraped_names_cache:
        return scraped_names_cache

    try:
        url = "https://www.pampers.com.br/gravidez/nomes-para-o-bebe/artigo/lista-de-nomes-femininos"
        response = requests.get(url, timeout=10) # Adiciona um timeout
        response.raise_for_status()

        soup = BeautifulSoup(response.content, 'html.parser')

        scraped_names = set()
        content_tags = soup.find_all(['p', 'li'])
        for tag in content_tags:
            text = tag.get_text().strip()
            if text and text[0].isdigit() and '.' in text:
                name_part = text.split('.', 1)[1].strip()
                name = name_part.split(' ')[0].split('–')[0].strip()
                if name.isalpha() and len(name) > 2:
                    scraped_names.add(name.capitalize())

        scraped_names_cache = sorted(list(scraped_names))
        return scraped_names_cache
    except requests.RequestException as e:
        print(f"Erro ao acessar a URL: {e}")
        return []

def handler(event, context):
    try:
        names = scrape_pampers_names()
        # Nota: A lista de nomes iniciais não está disponível aqui.
        # O frontend terá que lidar com a filtragem de duplicatas.
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(names)
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            'body': json.dumps({'error': 'Ocorreu um erro ao buscar os nomes.', 'details': str(e)})
        }
