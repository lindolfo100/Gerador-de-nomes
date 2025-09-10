import json

def handler(event, context):
    initial_names = ["Alice", "Bia", "Clara", "Duda", "Elisa", "Fernanda", "Gabi", "Helena", "Isis", "Julia"]

    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*' # CORS
        },
        'body': json.dumps(initial_names)
    }
