import json
import os
import requests

# IMPORTANTE: Substitua estes valores no seu ambiente Netlify
API_KEY = os.environ.get('JSONBIN_API_KEY', 'YOUR_API_KEY_HERE')
BIN_ID = os.environ.get('JSONBIN_BIN_ID', 'YOUR_BIN_ID_HERE')

READ_URL = f'https://api.jsonbin.io/v3/b/{BIN_ID}/latest'
WRITE_URL = f'https://api.jsonbin.io/v3/b/{BIN_ID}'

def handler(event, context):
    try:
        # 1. Obter o nome do corpo da requisição
        body = json.loads(event.get('body', '{}'))
        name_to_remove = body.get('name')
        if not name_to_remove:
            return {'statusCode': 400, 'body': json.dumps({'error': 'Nome não fornecido.'})}

        # 2. Ler a lista atual de favoritos do JSONBin
        read_headers = {'X-Master-Key': API_KEY}
        response = requests.get(READ_URL, headers=read_headers)
        response.raise_for_status()

        current_favorites = response.json().get('record', [])

        # 3. Remover o nome se existir
        # A lista agora é de objetos, então precisamos encontrar o objeto certo para remover
        original_length = len(current_favorites)
        # O frontend enviará o objeto completo do nome, então a comparação de dicionário deve funcionar
        updated_favorites = [fav for fav in current_favorites if fav != name_to_remove]

        if len(updated_favorites) < original_length:
            # 4. Escrever a lista atualizada de volta no JSONBin
            write_headers = {
                'Content-Type': 'application/json',
                'X-Master-Key': API_KEY
            }
            put_response = requests.put(WRITE_URL, headers=write_headers, data=json.dumps(updated_favorites))
            put_response.raise_for_status()

            return {'statusCode': 200, 'body': json.dumps({'status': 'success'})}
        else:
            return {'statusCode': 404, 'body': json.dumps({'status': 'not_found'})}

    except requests.exceptions.RequestException as e:
        return {'statusCode': 500, 'body': json.dumps({'error': 'Erro de comunicação com o banco de dados.', 'details': str(e)})}
    except Exception as e:
        return {'statusCode': 500, 'body': json.dumps({'error': 'Ocorreu um erro inesperado.', 'details': str(e)})}
