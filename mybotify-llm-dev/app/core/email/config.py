import enum

from pydantic_settings import BaseSettings, SettingsConfigDict


class EmailSettings(BaseSettings):
    SMTP_HOST: str
    SMTP_PORT: int
    SMTP_FROM_EMAIL: str
    SMTP_PASSWORD: str
    SMTP_USERNAME: str

    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="allow"
    )


class EmailType(enum.Enum):
    ACCOUNT_CREATION = "ACCOUN_CREATION"
    RESET_PASSWORD = "RESET_PASSWORD"
    RESEND_VERIFICATION = "RESEND_VERIFICATION"
