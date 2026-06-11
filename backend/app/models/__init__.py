from sqlalchemy import (
    Boolean,
    Column,
    String,
    Integer,
    DateTime,
    Float,
    Text,
    ForeignKey,
    Index
)

from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
import uuid

Base = declarative_base()


# =====================================================
# USER
# =====================================================

class User(Base):
    __tablename__ = "users"

    id = Column(
        String,
        primary_key=True,
        default=lambda: str(uuid.uuid4())
    )

    email = Column(
        String,
        unique=True,
        index=True,
        nullable=False
    )

    name = Column(
        String,
        nullable=False
    )

    password_hash = Column(
        String,
        nullable=False
    )

    tier = Column(
        String,
        default="free"
    )

    is_active = Column(
        Boolean,
        default=True
    )

    is_verified = Column(
        Boolean,
        default=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    api_keys = relationship(
        "ApiKey",
        back_populates="user",
        cascade="all, delete-orphan"
    )

    detections = relationship(
        "Detection",
        back_populates="user",
        cascade="all, delete-orphan"
    )

    applications = relationship(
        "Application",
        back_populates="user",
        cascade="all, delete-orphan"
    )

    audit_logs = relationship(
        "AuditLog",
        back_populates="user",
        cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index("idx_email", "email"),
    )


# =====================================================
# APPLICATION
# =====================================================

# =====================================================
# APPLICATION
# =====================================================

class Application(Base):
    __tablename__ = "applications"

    id = Column(
        String,
        primary_key=True,
        default=lambda: str(uuid.uuid4())
    )

    user_id = Column(
        String,
        ForeignKey("users.id"),
        nullable=False
    )

    name = Column(
        String,
        nullable=False
    )

    description = Column(Text)

    environment = Column(
        String,
        default="production"
    )

    provider = Column(
        String,
        default="openai"
    )

    is_active = Column(
        Boolean,
        default=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    # Relationships

    user = relationship(
        "User",
        back_populates="applications"
    )

    api_keys = relationship(
        "ApiKey",
        back_populates="application",
        cascade="all, delete-orphan"
    )

    detections = relationship(
        "Detection",
        back_populates="application",
        cascade="all, delete-orphan"
    )

    # ADD THIS
    audit_logs = relationship(
        "AuditLog",
        back_populates="application",
        cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index("idx_application_user", "user_id"),
    )


# =====================================================
# API KEY
# =====================================================

class ApiKey(Base):
    __tablename__ = "api_keys"

    id = Column(
        String,
        primary_key=True,
        default=lambda: str(uuid.uuid4())
    )

    user_id = Column(
        String,
        ForeignKey("users.id"),
        nullable=False
    )

    application_id = Column(
        String,
        ForeignKey("applications.id"),
        nullable=True
    )

    name = Column(
        String,
        nullable=False
    )

    key_hash = Column(
        String,
        unique=True,
        index=True,
        nullable=False
    )

    prefix = Column(String)

    is_active = Column(
        Boolean,
        default=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    last_used_at = Column(
        DateTime
    )

    user = relationship(
        "User",
        back_populates="api_keys"
    )

    application = relationship(
        "Application",
        back_populates="api_keys"
    )

    __table_args__ = (
        Index("idx_user_id", "user_id"),
    )


# =====================================================
# DETECTION
# =====================================================

class Detection(Base):
    __tablename__ = "detections"

    id = Column(
        String,
        primary_key=True,
        default=lambda: str(uuid.uuid4())
    )

    user_id = Column(
        String,
        ForeignKey("users.id"),
        nullable=False
    )

    application_id = Column(
        String,
        ForeignKey("applications.id"),
        nullable=True
    )

    prompt = Column(
        Text,
        nullable=False
    )

    risk_score = Column(
        Float,
        nullable=False
    )

    risk_level = Column(
        String,
        nullable=False
    )

    detected_patterns = Column(
        String
    )

    processing_time_ms = Column(
        Integer
    )

    source = Column(
        String,
        default="api"
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        index=True
    )

    user = relationship(
        "User",
        back_populates="detections"
    )

    application = relationship(
        "Application",
        back_populates="detections"
    )

    __table_args__ = (
    Index("idx_detection_user_created", "user_id", "created_at"),
    Index("idx_detection_risk_level", "risk_level"),
)


# =====================================================
# RULE
# =====================================================

class Rule(Base):
    __tablename__ = "rules"

    id = Column(
        String,
        primary_key=True,
        default=lambda: str(uuid.uuid4())
    )

    name = Column(
        String,
        unique=True,
        nullable=False
    )

    category = Column(
        String,
        nullable=False
    )

    patterns = Column(
        String,
        nullable=False
    )

    weight = Column(
        Float,
        default=0.8
    )

    risk_multiplier = Column(
        Float,
        default=1.5
    )

    is_enabled = Column(
        Boolean,
        default=True
    )

    description = Column(Text)

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    # Optional version for ETag
    version = Column(
        Integer,
        default=1,
        nullable=False
    )


# =====================================================
# AUDIT LOG
# =====================================================

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(
        String,
        primary_key=True,
        default=lambda: str(uuid.uuid4())
    )

    user_id = Column(
        String,
        ForeignKey("users.id")
    )

    application_id = Column(
        String,
        ForeignKey("applications.id"),
        nullable=True
    )

    action = Column(
        String,
        nullable=False
    )

    resource = Column(String)

    details = Column(Text)

    ip_address = Column(String)

    user_agent = Column(String)

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )
    
    user = relationship(
        "User",
        back_populates="audit_logs"
    )
    
    application = relationship(
        "Application",
        back_populates="audit_logs"
    )

    __table_args__ = (
    Index("idx_audit_user_created", "user_id", "created_at"),
    Index("idx_audit_application_id", "application_id"),
)
