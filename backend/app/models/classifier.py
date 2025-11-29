import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from typing import List, Tuple


class SentimentClassifier:
    def __init__(self, model_name: str = "cardiffnlp/twitter-xlm-roberta-base-sentiment"):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModelForSequenceClassification.from_pretrained(model_name)
        self.model.to(self.device)
        self.model.eval()
        self.model_name = model_name
        self.label_map = {0: 0, 1: 1, 2: 2}

    def predict(self, texts: List[str], batch_size: int = 32) -> List[Tuple[int, float]]:
        results = []
        for i in range(0, len(texts), batch_size):
            batch = texts[i : i + batch_size]
            encoded = self.tokenizer(
                batch, padding=True, truncation=True, max_length=512, return_tensors="pt"
            )
            encoded = {k: v.to(self.device) for k, v in encoded.items()}

            with torch.no_grad():
                outputs = self.model(**encoded)
                probs = torch.softmax(outputs.logits, dim=-1)
                preds = torch.argmax(probs, dim=-1)
                confidences = torch.max(probs, dim=-1).values

            for pred, conf in zip(preds.cpu().numpy(), confidences.cpu().numpy()):
                label = self.label_map.get(int(pred), 1)
                results.append((label, float(conf)))
        return results

    def predict_single(self, text: str) -> Tuple[int, float]:
        return self.predict([text])[0]
