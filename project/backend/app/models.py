from datetime import datetime, timezone

from sqlalchemy import (
    Column,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship

from app.database import Base


def utcnow() -> datetime:
    """Current UTC time as a naive datetime (what the DateTime columns store)."""
    return datetime.now(timezone.utc).replace(tzinfo=None)


# ── Enums ─────────────────────────────────────────────────────────────────────

IssueStatus = Enum(
    "open", "in_progress", "review", "closed", name="issue_status"
)
IssuePriority = Enum(
    "low", "medium", "high", "critical", name="issue_priority"
)


# ── Models ────────────────────────────────────────────────────────────────────


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=utcnow)

    projects = relationship("Project", back_populates="owner")
    reported_issues = relationship(
        "Issue", foreign_keys="Issue.reporter_id", back_populates="reporter"
    )
    assigned_issues = relationship(
        "Issue", foreign_keys="Issue.assignee_id", back_populates="assignee"
    )
    comments = relationship("Comment", back_populates="author")


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=utcnow)
    # BUG: missing onupdate=utcnow — updated_at is never refreshed on UPDATE
    updated_at = Column(DateTime, default=utcnow)

    owner = relationship("User", back_populates="projects")
    issues = relationship("Issue", back_populates="project", cascade="all, delete-orphan")


class Issue(Base):
    __tablename__ = "issues"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    status = Column(IssueStatus, default="open", nullable=False)
    priority = Column(IssuePriority, default="medium", nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    reporter_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    assignee_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=utcnow)
    # BUG: missing onupdate=utcnow — updated_at is never refreshed on UPDATE
    updated_at = Column(DateTime, default=utcnow)

    project = relationship("Project", back_populates="issues")
    reporter = relationship(
        "User", foreign_keys=[reporter_id], back_populates="reported_issues"
    )
    assignee = relationship(
        "User", foreign_keys=[assignee_id], back_populates="assigned_issues"
    )
    comments = relationship(
        "Comment", back_populates="issue", cascade="all, delete-orphan"
    )


class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    issue_id = Column(Integer, ForeignKey("issues.id"), nullable=False)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=utcnow)

    issue = relationship("Issue", back_populates="comments")
    author = relationship("User", back_populates="comments")
