import math

def sanitize_json(obj):
    """Recursively NaN/inf ko None me convert karta hai — poori nested structure (dict/list) ke andar bhi."""
    if isinstance(obj, float):
        if math.isnan(obj) or math.isinf(obj):
            return None
        return obj
    elif isinstance(obj, dict):
        return {k: sanitize_json(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [sanitize_json(v) for v in obj]
    else:
        return obj