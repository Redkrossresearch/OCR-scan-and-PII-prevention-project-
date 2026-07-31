from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.user import User

from app.schemas.user import (
    UserRegister,
    UserResponse,
    UserLogin,
)

from app.schemas.token import Token

from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
)

from app.services.audit_service import AuditService

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


# -------------------------
# Register User
# -------------------------
@router.post("/register", response_model=UserResponse)
def register(
    user: UserRegister,
    db: Session = Depends(get_db)
):

    # Check if email already exists
    existing_email = (
        db.query(User)
        .filter(User.email == user.email)
        .first()
    )

    if existing_email:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    # Check if username already exists
    existing_username = (
        db.query(User)
        .filter(User.username == user.username)
        .first()
    )

    if existing_username:
        raise HTTPException(
            status_code=400,
            detail="Username already exists"
        )

    # Create new user
    new_user = User(
        username=user.username,
        email=user.email,
        password=hash_password(user.password)
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    AuditService.log(
        db,
        new_user.email,
        "USER_REGISTERED",
        "Account created for username '%s'" % new_user.username,
    )

    return new_user


# -------------------------
# Login User
# -------------------------
@router.post(
    "/login",
    response_model=Token
)
def login(
    user: UserLogin,
    db: Session = Depends(get_db)
):

    # Find user by email
    db_user = (
        db.query(User)
        .filter(User.email == user.email)
        .first()
    )

    # Email not found
    if db_user is None:
        AuditService.log(
            db,
            user.email,
            "LOGIN_FAILED",
            "Login attempt with unknown email",
        )
        raise HTTPException(
            status_code=401,
            detail="Invalid Email or Password"
        )

    # Verify password
    if not verify_password(
        user.password,
        db_user.password
    ):
        AuditService.log(
            db,
            user.email,
            "LOGIN_FAILED",
            "Invalid password supplied for account",
        )
        raise HTTPException(
            status_code=401,
            detail="Invalid Email or Password"
        )

    # Create JWT Access Token
    access_token = create_access_token(
        data={
            "sub": db_user.email
        }
    )

    AuditService.log(
        db,
        db_user.email,
        "USER_LOGIN",
        "User logged in successfully",
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }