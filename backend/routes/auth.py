import os
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import User, UserSession
from backend.schemas import LoginRequest, UserResponse, AuthStatusResponse
from backend.services.auth_service import (
    verify_password,
    create_user_session,
    get_session_by_token,
    revoke_session,
    check_login_rate_limit,
    record_failed_login,
    clear_failed_login
)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

COOKIE_NAME = "regive_session"
COOKIE_MAX_AGE = 60 * 60 * 24 * 7  # 7 days


def _build_user_response(user: User) -> UserResponse:
    display_name = user.email.split("@")[0].capitalize()
    org_type = None

    if user.donor:
        display_name = user.donor.name
    elif user.partner:
        display_name = user.partner.name
        org_type = user.partner.organization_type

    return UserResponse(
        id=user.id,
        email=user.email,
        display_name=display_name,
        role=user.role,
        linked_profile_id=user.donor_id or user.partner_id,
        organization_type=org_type,
        is_active=user.is_active,
        is_verified=user.is_verified,
        created_at=user.created_at.isoformat(),
        last_login_at=user.last_login_at.isoformat() if user.last_login_at else None
    )


def get_token_from_request(request: Request) -> Optional[str]:
    """Extracts session token from cookie or Authorization: Bearer header."""
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ", 1)[1].strip()
    return token


def get_optional_user(
    request: Request,
    db: Session = Depends(get_db)
) -> Optional[User]:
    """Retrieves current user if an active session exists, else None."""
    token = get_token_from_request(request)
    if not token:
        return None

    session = get_session_by_token(db, token)
    if not session:
        return None

    user = db.query(User).filter(User.id == session.user_id).first()
    if not user or not user.is_active:
        return None

    return user


def get_current_user(
    request: Request,
    db: Session = Depends(get_db)
) -> User:
    """Dependency: Requires an active, authenticated user session."""
    user = get_optional_user(request, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please log in to access this resource."
        )
    return user


def require_role(allowed_roles: List[str]):
    """Dependency factory: Enforces Role-Based Access Control."""
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied: Requires one of [{', '.join(allowed_roles)}] privileges."
            )
        return current_user
    return role_checker


@router.post("/login", response_model=UserResponse)
def login(
    payload: LoginRequest,
    request: Request,
    response: Response,
    db: Session = Depends(get_db)
):
    """
    Shared authentication endpoint for all user roles.
    Validates credentials with Argon2id, creates session, and sets HttpOnly cookie.
    """
    client_ip = request.client.host if request.client else "127.0.0.1"

    # 1. Rate limiting check
    is_allowed, remaining = check_login_rate_limit(client_ip)
    if not is_allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many failed login attempts. Please wait 60 seconds before trying again."
        )

    # 2. Normalize and lookup email
    email_clean = payload.email.strip().lower()
    user = db.query(User).filter(User.email == email_clean).first()

    # 3. Verify user and password hash
    if not user or not verify_password(payload.password, user.password_hash):
        record_failed_login(client_ip)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email address or password."
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is currently suspended or inactive. Please contact support."
        )

    # Authentication success: clear rate-limit history
    clear_failed_login(client_ip)

    # 4. Create persistent session
    user_agent = request.headers.get("User-Agent")
    session = create_user_session(db, user, ip_address=client_ip, user_agent=user_agent)

    # 5. Set HttpOnly, SameSite=Lax cookie
    response.set_cookie(
        key=COOKIE_NAME,
        value=session.id,
        max_age=COOKIE_MAX_AGE,
        httponly=True,
        samesite="lax",
        secure=False,  # Set to False for local HTTP development
        path="/"
    )

    return _build_user_response(user)


@router.post("/logout")
def logout(
    request: Request,
    response: Response,
    db: Session = Depends(get_db)
):
    """
    Invalidates the active session in SQLite and clears the authentication cookie.
    """
    token = get_token_from_request(request)
    if token:
        revoke_session(db, token)

    # Clear cookie
    response.delete_cookie(
        key=COOKIE_NAME,
        path="/",
        httponly=True,
        samesite="lax"
    )
    return {"message": "Successfully logged out and session invalidated."}


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Returns the authenticated user's profile and role information."""
    return _build_user_response(current_user)


@router.get("/status", response_model=AuthStatusResponse)
def get_auth_status(
    request: Request,
    db: Session = Depends(get_db)
):
    """Lightweight session probe checking whether client has an active session."""
    user = get_optional_user(request, db)
    return AuthStatusResponse(
        authenticated=bool(user),
        user=_build_user_response(user) if user else None
    )


@router.post("/reset-rate-limit")
def reset_rate_limit(request: Request):
    """Internal test fixture to clear rate limiting."""
    client_ip = request.client.host if request.client else "127.0.0.1"
    clear_failed_login(client_ip)
    return {"status": "cleared"}
