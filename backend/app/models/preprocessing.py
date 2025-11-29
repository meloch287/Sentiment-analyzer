import re
import pymorphy3
import nltk

nltk.download("stopwords", quiet=True)
nltk.download("punkt", quiet=True)


class TextPreprocessor:
    def __init__(self):
        self.morph = pymorphy3.MorphAnalyzer()
        try:
            self.stopwords = set(nltk.corpus.stopwords.words("russian"))
        except:
            self.stopwords = set()

    def clean_text(self, text: str) -> str:
        if not isinstance(text, str):
            return ""
        text = re.sub(r"[^\w\s]", " ", text)
        text = re.sub(r"\s+", " ", text)
        text = text.lower().strip()
        return text

    def lemmatize(self, text: str) -> str:
        words = text.split()
        lemmas = [self.morph.parse(w)[0].normal_form for w in words]
        return " ".join(lemmas)

    def remove_stopwords(self, text: str) -> str:
        words = text.split()
        filtered = [w for w in words if w not in self.stopwords]
        return " ".join(filtered)

    def preprocess(self, text: str, lemmatize: bool = False) -> str:
        text = self.clean_text(text)
        if lemmatize:
            text = self.lemmatize(text)
        return text
