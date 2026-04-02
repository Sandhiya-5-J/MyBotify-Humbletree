from typing import Optional

from pydantic import BaseModel


class ConversationModel(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    store_id: Optional[int] = None
    is_admin: Optional[bool] = False


# TODO: Implement
class ReplyErrorModel(BaseModel):
    pass


class ReplyResponseModel(BaseModel):
    message: str
    conversation_id: str


class ConversationResponseModel(BaseModel):
    data: ReplyResponseModel
    error: Optional[ReplyErrorModel] = None


# TODO: Implement
class StreamingReplyResponseModel(BaseModel):
    pass
