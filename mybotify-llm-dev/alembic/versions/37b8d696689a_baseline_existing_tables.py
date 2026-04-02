"""baseline existing tables

Revision ID: 37b8d696689a
Revises: 0659852a3310
Create Date: 2025-05-13 23:54:08.355608

"""

from collections.abc import Sequence
from typing import Union

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "37b8d696689a"
down_revision: Union[str, None] = "0659852a3310"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
