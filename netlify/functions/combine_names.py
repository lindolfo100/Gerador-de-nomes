import json

def handler(event, context):
    try:
        body = json.loads(event.get('body', '{}'))
        name1 = body.get('name1', '').strip().capitalize()
        name2 = body.get('name2', '').strip().capitalize()

        if not name1 or not name2 or len(name1) < 2 or len(name2) < 2:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Por favor, forneça dois nomes com pelo menos 2 caracteres cada.'})
            }

        combinations = set()
        mid1 = len(name1) // 2
        mid2 = len(name2) // 2

        combinations.add(name1[:mid1] + name2[mid2:])
        combinations.add(name2[:mid2] + name1[mid1:])
        combinations.add(name1[:mid1] + name2[-mid2:])
        combinations.add(name2[:mid2] + name1[-mid1:])
        combinations.add(f"{name1} {name2}")

        final_combinations = sorted([c for c in combinations if c != name1 and c != name2])

        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(final_combinations)
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': 'Ocorreu um erro inesperado.', 'details': str(e)})
        }
