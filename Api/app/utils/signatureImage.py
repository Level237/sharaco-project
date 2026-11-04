PNG_DATA_URL_PREFIX = "data:image/png;base64,"
MAX_SIGNATURE_CHARS = 180_000


def normalize_png_data_url(value: str | None) -> str | None:
    if not value:
        return None
    raw = value.strip()
    if not raw.startswith(PNG_DATA_URL_PREFIX):
        raise ValueError("La signature doit être une image PNG.")
    if len(raw) > MAX_SIGNATURE_CHARS:
        raise ValueError("La signature est trop lourde.")
    return raw
