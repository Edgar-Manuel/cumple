"""add gift click_count column

Revision ID: 0003_add_gift_click_count
Revises: 0002_add_event_personalization
Create Date: 2026-05-20
"""
from alembic import op
import sqlalchemy as sa

revision = "0003_add_gift_click_count"
down_revision = "0002_add_event_personalization"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "gifts",
        sa.Column("click_count", sa.Integer(), nullable=False, server_default="0"),
    )


def downgrade() -> None:
    op.drop_column("gifts", "click_count")
