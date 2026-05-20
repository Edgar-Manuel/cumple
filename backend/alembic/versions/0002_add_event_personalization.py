"""add event personalization columns

Revision ID: 0002_add_event_personalization
Revises: 0001_initial_schema
Create Date: 2026-05-20
"""
from alembic import op
import sqlalchemy as sa

revision = "0002_add_event_personalization"
down_revision = "0001_initial_schema"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("events", sa.Column("event_interests", sa.Text(), nullable=True))
    op.add_column("events", sa.Column("previous_gifts", sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column("events", "previous_gifts")
    op.drop_column("events", "event_interests")
