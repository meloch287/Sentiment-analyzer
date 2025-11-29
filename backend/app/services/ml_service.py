import asyncio
from typing import Any, Dict, Optional

import pandas as pd
from sklearn.metrics import confusion_matrix, f1_score, precision_score, recall_score

from ..models.classifier import SentimentClassifier
from ..models.preprocessing import TextPreprocessor


class MLService:
    def __init__(self):
        self.classifier: Optional[SentimentClassifier] = None
        self.preprocessor = TextPreprocessor()
        self.tasks: Dict[str, Dict[str, Any]] = {}

    def load_model(self):
        if self.classifier is None:
            self.classifier = SentimentClassifier()

    async def analyze_dataframe(self, df: pd.DataFrame, task_id: str) -> pd.DataFrame:
        self.load_model()
        texts = df["text"].fillna("").tolist()
        total = len(texts)

        self.tasks[task_id] = {"status": "processing", "progress": 0, "total": total}

        results = []
        batch_size = 32
        for i in range(0, total, batch_size):
            batch = texts[i : i + batch_size]
            batch_results = self.classifier.predict(batch)
            results.extend(batch_results)
            self.tasks[task_id]["progress"] = min(i + batch_size, total)
            await asyncio.sleep(0)

        df["label"] = [r[0] for r in results]
        df["confidence"] = [r[1] for r in results]
        self.tasks[task_id]["status"] = "completed"
        self.tasks[task_id]["result"] = df
        return df

    def validate(self, y_true, y_pred) -> Dict[str, Any]:
        return {
            "macro_f1": float(f1_score(y_true, y_pred, average="macro")),
            "precision": {
                i: float(p)
                for i, p in enumerate(
                    precision_score(y_true, y_pred, average=None, zero_division=0)
                )
            },
            "recall": {
                i: float(r)
                for i, r in enumerate(
                    recall_score(y_true, y_pred, average=None, zero_division=0)
                )
            },
            "confusion_matrix": confusion_matrix(y_true, y_pred).tolist(),
        }

    def get_task_status(self, task_id: str) -> Optional[Dict[str, Any]]:
        return self.tasks.get(task_id)


ml_service = MLService()
