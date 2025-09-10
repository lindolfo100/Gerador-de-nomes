import json

def handler(event, context):
    filters = {
        "origins": [
            {"value": "all", "label": "Qualquer Origem"},
            {"value": "biblical", "label": "Bíblico"},
            {"value": "latin", "label": "Latim"},
            {"value": "greek", "label": "Grego"},
            {"value": "germanic", "label": "Germânico"},
            {"value": "brazilian", "label": "Brasileiro (Tupi)"}
        ],
        "popularity": [
            {"value": "all", "label": "Qualquer Popularidade"},
            {"value": "100", "label": "Top 100"},
            {"value": "500", "label": "Top 500"},
            {"value": "1000", "label": "Top 1000"},
            {"value": "rare", "label": "Raro (Fora do Top 1000)"}
        ]
    }

    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps(filters)
    }
