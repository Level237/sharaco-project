import ipaddress

from fastapi import Request
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.core.config import settings


def _is_trusted_proxy(peer: str) -> bool:
    """Le pair direct peut-il écraser l'IP client via X-Forwarded-For ?"""
    allow = (settings.FORWARDED_ALLOW_IPS or "").strip()
    if allow == "*":
        return True

    extras = {item.strip() for item in allow.split(",") if item.strip()}
    if peer in extras:
        return True

    try:
        ip = ipaddress.ip_address(peer)
    except ValueError:
        return False
    return ip.is_private or ip.is_loopback


def client_ip(request: Request) -> str:
    """IP client réelle derrière un reverse proxy de confiance.

    X-Forwarded-For n'est lu que si la connexion arrive d'une IP privée,
    loopback, ou listée dans FORWARDED_ALLOW_IPS. Un client public qui
    envoie lui-même l'en-tête ne peut pas falsifier son quota.
    """
    peer = request.client.host if request.client else ""
    if peer and _is_trusted_proxy(peer):
        forwarded = request.headers.get("x-forwarded-for", "")
        if forwarded:
            candidate = forwarded.split(",")[0].strip()
            if candidate:
                return candidate
    if peer:
        return peer
    return get_remote_address(request)


limiter = Limiter(key_func=client_ip)
