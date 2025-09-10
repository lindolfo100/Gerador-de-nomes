import json
import csv
import os
import random

def load_names_from_csv(file_path):
    """Lê um arquivo CSV e retorna uma lista de dicionários."""
    names = []
    try:
        with open(file_path, mode='r', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                names.append(row)
    except FileNotFoundError:
        print(f"Arquivo não encontrado: {file_path}")
    except Exception as e:
        print(f"Erro ao ler o arquivo {file_path}: {e}")
    return names

def get_origin(name):
    """Retorna a origem de um nome com base em uma lista pré-definida."""
    # Esta é uma simplificação. Um sistema real usaria um banco de dados de etimologia.
    origins = {
        "Bíblico": ["Maria", "Ana", "Jose", "Joao", "Gabriel", "Rafael", "Daniel", "Samuel", "Davi", "Ester"],
        "Latim": ["Julia", "Laura", "Beatriz", "Marcos", "Lucas", "Augusto", "Cesar", "Renato", "Livia"],
        "Grego": ["Helena", "Alice", "Sofia", "Nicolas", "Pedro", "Felipe", "Alexandre", "Heitor"],
        "Germânico": ["Luiza", "Francisca", "Guilherme", "Fernando", "Carlos", "Luiz", "Henrique"],
        "Brasileiro (Tupi)": ["Iara", "Jurema", "Moacir", "Ubirajara", "Caua", "Caua"]
    }
    for origin, names_list in origins.items():
        if name.upper() in [n.upper() for n in names_list]:
            return origin
    return "Outra"

def handler(event, context):
    try:
        params = event.get('queryStringParameters', {})
        gender = params.get('gender', 'both')
        origin = params.get('origin', 'all')
        popularity = params.get('popularity', 'all')

        # Constrói o caminho para os arquivos de dados
        # As funções Netlify rodam a partir da raiz do projeto
        base_path = os.path.dirname(os.path.abspath(__file__))
        fem_path = os.path.join(base_path, '../../data/ibge-fem.csv')
        mas_path = os.path.join(base_path, '../../data/ibge-mas.csv')

        all_names = []
        if gender == 'female' or gender == 'both':
            all_names.extend(load_names_from_csv(fem_path))
        if gender == 'male' or gender == 'both':
            all_names.extend(load_names_from_csv(mas_path))

        # Adicionar origem aos dados
        for item in all_names:
            item['origin'] = get_origin(item['nome'])

        # --- Filtragem ---
        filtered_names = all_names

        # 1. Filtro de Origem
        if origin != 'all':
            filtered_names = [p for p in filtered_names if p['origin'].lower() == origin.lower()]

        # 2. Filtro de Popularidade
        if popularity != 'all' and popularity != 'rare':
            limit = int(popularity)
            # Ordena por rank (menor é mais popular) e pega o top 'limit'
            filtered_names = sorted(filtered_names, key=lambda x: int(x['rank']))[:limit]
        elif popularity == 'rare':
            # Pega nomes fora do top 1000
            filtered_names = [p for p in filtered_names if int(p['rank']) > 1000]

        # Embaralha e retorna uma amostra (ex: até 50 nomes)
        random.shuffle(filtered_names)
        results = filtered_names[:50]

        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(results)
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': 'Erro ao gerar nomes.', 'details': str(e)})
        }
