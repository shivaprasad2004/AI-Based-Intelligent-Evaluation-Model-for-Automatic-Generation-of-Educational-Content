import re


def validate_password(password):
    errors = []
    if len(password) < 8:
        errors.append('Password must be at least 8 characters')
    if not re.search(r'[A-Z]', password):
        errors.append('Password must contain at least one uppercase letter')
    if not re.search(r'[a-z]', password):
        errors.append('Password must contain at least one lowercase letter')
    if not re.search(r'\d', password):
        errors.append('Password must contain at least one digit')
    if not re.search(r'[!@#$%^&*()\-_=+\[\]{};:,.<>?/\\|`~]', password):
        errors.append('Password must contain at least one special character')

    score = 5 - len(errors)
    if score <= 1:
        strength = 'weak'
    elif score <= 3:
        strength = 'fair'
    elif score <= 4:
        strength = 'strong'
    else:
        strength = 'very_strong'

    return {
        'valid': len(errors) == 0,
        'errors': errors,
        'strength': strength
    }


def validate_email(email):
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(pattern, email):
        return {'valid': False, 'error': 'Invalid email format'}
    return {'valid': True}


def validate_username(username):
    if len(username) < 3 or len(username) > 20:
        return {'valid': False, 'error': 'Username must be 3-20 characters'}
    if not re.match(r'^[a-zA-Z0-9_]+$', username):
        return {'valid': False, 'error': 'Username can only contain letters, numbers, and underscores'}
    return {'valid': True}
