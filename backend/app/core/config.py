from functools import lru_cache

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Sentiment Analyzer API"
    debug: bool = True
    model_name: str = "cardiffnlp/twitter-xlm-roberta-base-sentiment"
    max_file_size: int = 50 * 1024 * 1024
    redis_url: str = "redis://localhost:6379"

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings():
    return Settings()
