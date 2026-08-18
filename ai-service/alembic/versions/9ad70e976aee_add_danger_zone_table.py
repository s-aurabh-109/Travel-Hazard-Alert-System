"""Add danger_zone table

Revision ID: 9ad70e976aee
Revises: 3e6a7d77aa4b
Create Date: 2026-08-18 14:06:07.348340

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = '9ad70e976aee'
down_revision: Union[str, Sequence[str], None] = '3e6a7d77aa4b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# Reference existing enums — do NOT recreate them
hazardtype_enum = postgresql.ENUM(
    'EARTHQUAKE', 'FLOOD', 'LANDSLIDE', 'CYCLONE', 'DROUGHT',
    'TSUNAMI', 'AVALANCHE', 'WILDFIRE',
    name='hazardtype', create_type=False,
)
alertseverity_enum = postgresql.ENUM(
    'LOW', 'MEDIUM', 'HIGH', 'CRITICAL',
    name='alertseverity', create_type=False,
)


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table('danger_zone',
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('name', sa.String(length=200), nullable=False),
    sa.Column('latitude', sa.Float(), nullable=False),
    sa.Column('longitude', sa.Float(), nullable=False),
    sa.Column('radius_km', sa.Float(), nullable=False),
    sa.Column('hazard_type', hazardtype_enum, nullable=False),
    sa.Column('severity', alertseverity_enum, nullable=False),
    sa.Column('description', sa.Text(), nullable=True),
    sa.Column('is_active', sa.Boolean(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table('danger_zone')
