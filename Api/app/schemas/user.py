from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from uuid import UUID
from datetime import datetime


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None
    company_name: Optional[str] = None
    address: Optional[str] = None
    tax_id: Optional[str] = None
    payment_info: Optional[str] = None

class PasswordUpdate(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8, description="Nouveau mot de passe (min 8 caractères)")

class UserRead(BaseModel):
    id: UUID
    email: str
    full_name: Optional[str] = None
    company_name: Optional[str] = None
    address: Optional[str] = None
    tax_id: Optional[str] = None
    payment_info: Optional[str] = None
    country: Optional[str] = None
    currency: Optional[str] = None
    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    company_name: Optional[str] = None
    address: Optional[str] = None
    tax_id: Optional[str] = None
    country: Optional[str] = None
    currency: Optional[str] = None
    payment_info: Optional[str] = None


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: Optional[str] = None