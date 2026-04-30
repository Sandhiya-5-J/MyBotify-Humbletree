"""
Rate limiter configuration.

Uses SlowAPI to limit requests per IP address on sensitive endpoints
like login, registration, and password reset.
"""

from slowapi import Limiter
from slowapi.util import get_remote_address

# Global rate limiter instance — keyed by client IP address
limiter = Limiter(key_func=get_remote_address)
