from pydantic_settings import BaseSettings, SettingsConfigDict


class ChatSettings(BaseSettings):
    MODEL: str
    PROVIDER: str
    API_KEY: str
    EMBEDDING_API_KEY: str = ""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="allow", env_prefix='CHAT_')
