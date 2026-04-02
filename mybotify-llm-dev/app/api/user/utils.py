import random
import hashlib


def get_text_hash(plain_text: str) -> str:
    return hashlib.sha256(plain_text.encode('utf-8')).hexdigest()

def get_otp() -> str:
    return str(random.randint(111, 999999)).zfill(6)