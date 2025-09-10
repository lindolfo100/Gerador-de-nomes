import json
import random

# --- Lógica da Cadeia de Markov ---

def build_markov_chain(names, chain=None):
    if chain is None:
        chain = {}
    for name in names:
        name = "^" + name.lower() + "$"
        for i in range(len(name) - 1):
            char = name[i]
            next_char = name[i+1]
            if char not in chain:
                chain[char] = []
            chain[char].append(next_char)
    return chain

def generate_ai_name(chain, min_len=4, max_len=8):
    name = "^"
    attempts = 0
    while attempts < 50: # Evita loops infinitos
        if name[-1] not in chain:
            break
        next_char = random.choice(chain[name[-1]])
        if next_char == "$":
            break
        name += next_char
        attempts += 1

    final_name = name[1:].capitalize()
    if min_len <= len(final_name) <= max_len:
        return final_name
    return None

# --- Handler da Função ---

def handler(event, context):
    # Lista de nomes para treinar o modelo. É um subconjunto para manter a função leve.
    training_names = [
        "Alice", "Bia", "Clara", "Duda", "Elisa", "Fernanda", "Gabi", "Helena", "Isis", "Julia",
        "Laura", "Livia", "Lorena", "Luiza", "Manuela", "Mariana", "Marina", "Melissa", "Nicole"
    ]

    chain = build_markov_chain(training_names)

    generated_names = set()
    attempts = 0
    while len(generated_names) < 10 and attempts < 200:
        new_name = generate_ai_name(chain)
        if new_name and new_name not in training_names:
            generated_names.add(new_name)
        attempts += 1

    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps(sorted(list(generated_names)))
    }
