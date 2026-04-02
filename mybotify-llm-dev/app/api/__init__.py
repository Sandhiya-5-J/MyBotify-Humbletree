from .chat.routes import router as chat
from .docs import tags_metadata as tags_metadata
from .store.routes import store as store
from .user.routes import user as user

__all__ = ["chat", "user", "store"]
