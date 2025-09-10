import json
import os
import requests

# IMPORTANTE: Substitua estes valores no seu ambiente Netlify
API_KEY = os.environ.get('JSONBIN_API_KEY', 'YOUR_API_KEY_HERE')
BIN_ID = os.environ.get('JSONBIN_BIN_ID', 'YOUR_BIN_ID_HERE')

API_URL = f'https://api.jsonbin.io/v3/b/{BIN_ID}/latest'

def handler(event, context):
    headers = {
        'X-Master-Key': API_KEY
    }

    try:
        response = requests.get(API_URL, headers=headers)
        response.raise_for_status()

        # O JSONBin retorna os dados dentro de uma chave "record"
        data = response.json().get('record', [])

        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(data)
        }

    except requests.exceptions.RequestException as e:
        return {
            'statusCode': 500,
            'headers': { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            'body': json.dumps({'error': 'Erro ao se comunicar com o banco de dados.', 'details': str(e)})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            'body': json.dumps({'error': 'Ocorreu um erro inesperado.', 'details': str(e)})
        }
