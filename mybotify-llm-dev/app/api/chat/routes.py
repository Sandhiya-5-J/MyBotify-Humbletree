import uuid

from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from .conversation import reply, reply_stream
from .utils.models import ConversationModel, ConversationResponseModel

router = APIRouter()


@router.post("/conversation/stream")
async def conversation_stream(conversation: ConversationModel):
    conversation_id = conversation.conversation_id
    if not conversation_id:
        # TODO: Research if this is the best way to generate a random (and unique) conversation ID
        conversation_id = str(uuid.uuid4())

    return StreamingResponse(
        reply_stream(conversation.message, conversation_id, store_id=conversation.store_id, is_admin=conversation.is_admin),
        media_type="text/event-stream",
    )


@router.post("/conversation", response_model=ConversationResponseModel)
async def conversation(conversation: ConversationModel) -> ConversationResponseModel:
    conversation_id = conversation.conversation_id
    if not conversation_id:
        # TODO: Research if this is the best way to generate a random (and unique) conversation ID
        conversation_id = str(uuid.uuid4())

    data = await reply(conversation.message, conversation_id, store_id=conversation.store_id, is_admin=conversation.is_admin)

    return ConversationResponseModel(data=data, error=None)
