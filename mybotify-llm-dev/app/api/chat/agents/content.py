from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

CONTENT_PROMPT_TEMPLATE = """
You are the **Content Agent** for MyBotify.
Your expertise lies in copywriting, social media posts, email marketing, and creative writing.
When a user needs catchy ad copy, an engaging email template, or a social media caption, you provide it.

Be creative, engaging, and persuasive. Only provide the content requested.
Use the store's actual product names, prices, and brand details when available.

{store_context}
"""

def get_content_prompt() -> ChatPromptTemplate:
    return ChatPromptTemplate.from_messages(
        [
            ("system", CONTENT_PROMPT_TEMPLATE),
            MessagesPlaceholder(variable_name="messages"),
        ]
    )
