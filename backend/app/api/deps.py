"""
API Dependencies

Common dependencies for API routes (auth, database, etc.).
"""

from typing import Annotated
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

# Firebase auth bearer
security = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(security)]
) -> dict:
    """
    Verify Firebase ID token and return current user.

    TODO: Implement actual Firebase token verification in Phase 7.
    """
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials

    # Placeholder: Return mock user for development
    # In production, verify token with Firebase Admin SDK
    return {
        "uid": "dev-user-id",
        "email": "dev@example.com",
    }


# Type alias for dependency injection
CurrentUser = Annotated[dict, Depends(get_current_user)]
