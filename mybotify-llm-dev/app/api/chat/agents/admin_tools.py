"""
Admin tools for AI agents.

Fetches real admin-wide data from the database and formats it as a context string.
"""

import logging
from datetime import datetime, timedelta

from app.core.database import session
from app.models import Store, User

logger = logging.getLogger(__name__)

def get_admin_context() -> str:
    """
    Fetch platform-wide data and return a formatted markdown summary for agent prompts.
    """
    db = session()
    try:
        users = db.query(User).all()
        stores = db.query(Store).all()

        total_users = len(users)
        active_users = len([u for u in users if u.is_active])
        admin_users = len([u for u in users if str(u.role) == "UserRole.admin" or str(u.role) == "admin"])
        
        week_ago = datetime.utcnow() - timedelta(days=7)
        recent_signups = len([u for u in users if u.created_at and u.created_at >= week_ago])

        total_stores = len(stores)

        context = f"""## Admin Dashboard Details
You are assisting an Administrator of the MyBotify platform.
Here is the current platform status:
- Total Users: {total_users}
- Active Users: {active_users}
- Admins: {admin_users}
- Recent Signups (last 7 days): {recent_signups}
- Total Stores Created: {total_stores}

Use this information when the admin asks for platform statistics, user details, or an overview of the system.
"""
        return context
    except Exception as e:
        logger.error(f"Failed to fetch admin context: {e}")
        return ""
    finally:
        db.close()
