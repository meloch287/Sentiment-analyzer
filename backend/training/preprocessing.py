import re
from typing import List


def preprocess_text(text: str) -> str:
    if not text or not isinstance(text, str):
        return ""
    
    text = text.lower()
    text = re.sub(r'<[^>]+>', '', text)
    text = re.sub(r'https?://\S+|www\.\S+', '', text)
    emoji_pattern = re.compile(
        "["
        "\U0001F600-\U0001F64F"
        "\U0001F300-\U0001F5FF"
        "\U0001F680-\U0001F6FF"
        "\U0001F1E0-\U0001F1FF"
        "\U00002702-\U000027B0"
        "\U000024C2-\U0001F251"
        "]+",
        flags=re.UNICODE
    )
    text = emoji_pattern.sub('', text)
    text = re.sub(r'[^а-яёa-z0-9\s.,!?\-]', '', text)
    text = re.sub(r'([!?.,])\1+', r'\1', text)
    text = re.sub(r'\s+', ' ', text)
    text = text.strip()
    if len(text) < 3:
        return ""
    
    return text


def preprocess_batch(texts: List[str]) -> List[str]:
    return [preprocess_text(t) for t in texts]
