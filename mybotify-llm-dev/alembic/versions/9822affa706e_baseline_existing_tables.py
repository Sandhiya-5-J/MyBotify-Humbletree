"""baseline existing tables

Revision ID: 9822affa706e
Revises: 3f1267336646
Create Date: 2025-05-25 19:36:10.316352

"""

from collections.abc import Sequence
from typing import Union

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "9822affa706e"
down_revision: Union[str, None] = "3f1267336646"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
