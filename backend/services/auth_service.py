import secrets
from datetime import datetime, timedelta
from typing import Optional, Tuple
from collections import defaultdict
from sqlalchemy.orm import Session
from pwdlib import PasswordHash
from pwdlib.hashers.argon2 import Argon2Hasher

from backend.models import User, UserSession

# Initialize Argon2id password hasher
_password_hasher = PasswordHash((Argon2Hasher(),))

# Session duration configuration
SESSION_DURATION_HOURS = 24 * 7  # 7-day persistent session

# In-memory rate limiter for brute-force prevention: IP -> list of attempt timestamps
_login_failed_attempts = defaultdict(list)
RATE_LIMIT_WINDOW_SECONDS = 60
MAX_ATTEMPTS_PER_WINDOW = 5

def hash_password(password: str) -> str:
    """Hashes a password using Argon2id."""
    return _password_hasher.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain password against an Argon2id hash."""
    return _password_hasher.verify(plain_password, hashed_password)

def check_login_rate_limit(client_ip: str) -> Tuple[bool, int]:
    """
    Checks if client IP has exceeded failed login attempt threshold.
    Returns (is_allowed, remaining_attempts).
    """
    now = datetime.utcnow()
    window_start = now - timedelta(seconds=RATE_LIMIT_WINDOW_SECONDS)
    
    # Prune old attempts
    _login_failed_attempts[client_ip] = [
        t for t in _login_failed_attempts[client_ip] if t > window_start
    ]
    
    current_attempts = len(_login_failed_attempts[client_ip])
    if current_attempts >= MAX_ATTEMPTS_PER_WINDOW:
        return False, 0
    return True, MAX_ATTEMPTS_PER_WINDOW - current_attempts

def record_failed_login(client_ip: str):
    """Records a failed login attempt timestamp for the client IP."""
    _login_failed_attempts[client_ip].append(datetime.utcnow())

def clear_failed_login(client_ip: str):
    """Clears failed login attempt history on successful authentication."""
    if client_ip in _login_failed_attempts:
        del _login_failed_attempts[client_ip]

def create_user_session(
    db: Session,
    user: User,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None
) -> UserSession:
    """
    Creates a new server-side session with an unpredictable cryptographically random 64-char token.
    """
    session_token = secrets.token_hex(32)  # 256 bits of entropy
    now = datetime.utcnow()
    expires_at = now + timedelta(hours=SESSION_DURATION_HOURS)

    session_record = UserSession(
        id=session_token,
        user_id=user.id,
        created_at=now,
        expires_at=expires_at,
        last_activity_at=now,
        ip_address=ip_address,
        user_agent=user_agent,
        is_revoked=False
    )
    db.add(session_record)

    # Update user's last login
    user.last_login_at = now
    db.commit()
    db.refresh(session_record)
    return session_record

def get_session_by_token(db: Session, session_token: str) -> Optional[UserSession]:
    """
    Retrieves and validates an active session token. Updates last activity timestamp.
    """
    if not session_token:
        return None

    session = db.query(UserSession).filter(
        UserSession.id == session_token,
        UserSession.is_revoked == False
    ).first()

    if not session:
        return None

    # Check expiration
    if session.expires_at < datetime.utcnow():
        session.is_revoked = True
        db.commit()
        return None

    # Update last activity
    session.last_activity_at = datetime.utcnow()
    db.commit()
    return session

def revoke_session(db: Session, session_token: str) -> bool:
    """Invalidates/revokes an active server-side session."""
    if not session_token:
        return False

    session = db.query(UserSession).filter(UserSession.id == session_token).first()
    if session:
        session.is_revoked = True
        db.commit()
        return True
    return False
