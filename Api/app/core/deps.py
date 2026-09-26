from typing import Optional
from fastapi import Depends, HTTPException, status, Query
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import settings
from app.db.engine import get_db
from app.models.user import User
from app.services.userService import UserService

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)


async def get_current_user(
    header_token: Optional[str] = Depends(oauth2_scheme),
    auth_token_query: Optional[str] = Query(None, alias="token"),
    db: AsyncSession = Depends(get_db),
) -> User:
    """Décode le JWT et retourne l'utilisateur courant.
    À utiliser comme dependency dans toutes les routes protégées.
    Supporte soit l'en-tête Authorization: Bearer <token>, soit le paramètre d'URL ?token=<token>."""
    auth_token = header_token or auth_token_query
    if not auth_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Impossible de valider les identifiants",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(
            auth_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        user_id: str | None = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = await UserService.get_by_id(db, user_id)
    if user is None:
        raise credentials_exception

    return user