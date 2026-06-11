from sqlalchemy import (
    Column,
    String,
    Integer,
    DateTime,
    ForeignKey
)

from datetime import datetime
import uuid

from app.models import Base


class UsageMetric(Base):
    __tablename__ = "usage_metrics"

    id = Column(String, primary_key=True)

    application_id = Column(
        String,
        ForeignKey("applications.id"),
        unique=True
    )

    total_requests = Column(
        Integer,
        default=0
    )

    blocked_requests = Column(
        Integer,
        default=0
    )

    last_request_at = Column(
        DateTime
    )