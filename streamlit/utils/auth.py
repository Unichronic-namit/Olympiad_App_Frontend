import requests
from config.api_config import API_BASE_URL


def signup_user(user_data):
    """Sign up a new user"""
    try:
        response = requests.post(f"{API_BASE_URL}/signup", json=user_data)
        return response
    except Exception as e:
        return None


def login_user(email, password):
    """Login user"""
    try:
        response = requests.post(f"{API_BASE_URL}/login", json={
            "email": email,
            "password": password
        })
        return response
    except Exception as e:
        return None
