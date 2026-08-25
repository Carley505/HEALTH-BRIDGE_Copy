"""
API Dependencies

Common dependencies for API routes (auth, database, etc.).
"""

import logging
from typing import Annotated
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.config.settings import settings

logger = logging.getLogger(__name__)

# Firebase auth bearer
security = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(security)]
) -> dict:
    """
    Verify Firebase ID token and return current user.

    Auth bypass is only possible when SKIP_AUTH=true AND ENV=development.
    This is enforced at startup by Settings.model_validator.
    """
    # Dev bypass (guarded by Settings validator — can only be true in development)
    if settings.SKIP_AUTH:
        return {"uid": "dev_user_123", "email": "dev@example.com", "name": "Dev User"}

    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials

    # Firebase token verification
    try:
        from firebase_admin import auth
        decoded_token = auth.verify_id_token(token)
        uid = decoded_token["uid"]
        email = decoded_token.get("email")

    except Exception as e:
        logger.warning("Firebase auth failed: %s", e)

        # Dev token fallback (also guarded by Settings validator)
        if settings.ALLOW_DEV_TOKEN and settings.DEV_TOKEN:
            if token == settings.DEV_TOKEN:
                logger.info("Dev token accepted for development")
                return {"uid": "dev-user", "email": "dev@example.com"}

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Find or create user in MongoDB
    try:
        from app.models.user import User
        user = await User.find_one(User.firebase_uid == uid)
        token_name = decoded_token.get('name') or (email.split('@')[0] if email else None)
        
        if not user:
            user = User(
                email=email,
                firebase_uid=uid,
                display_name=token_name,
            )
            await user.create()
        elif token_name and not user.display_name:
            user.display_name = token_name
            await user.save()
            
        return user if user else {"uid": uid, "email": email, "display_name": token_name}
        
    except Exception as e:
        print(f"User DB Error: {e}")
        # Fallback if DB fails but token valid
        fallback_name = decoded_token.get('name') or (email.split('@')[0] if email else None)
        return {"uid": uid, "email": email, "display_name": fallback_name}


# Type alias for dependency injection
CurrentUser = Annotated[dict, Depends(get_current_user)]
