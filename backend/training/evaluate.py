import argparse

import pandas as pd
import torch
from sklearn.metrics import classification_report, confusion_matrix, f1_score
from transformers import AutoModelForSequenceClassification, AutoTokenizer


def predict_batch(texts, model, tokenizer, device, batch_size=32):
    model.eval()
    predictions = []

    for i in range(0, len(texts), batch_size):
        batch = texts[i : i + batch_size]
        encoded = tokenizer(
            batch, padding=True, truncation=True, max_length=256, return_tensors="pt"
        )
        encoded = {k: v.to(device) for k, v in encoded.items()}

        with torch.no_grad():
            outputs = model(**encoded)
            preds = torch.argmax(outputs.logits, dim=-1)
            predictions.extend(preds.cpu().numpy().tolist())

    return predictions


def main(args):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}")

    tokenizer = AutoTokenizer.from_pretrained(args.model_path)
    model = AutoModelForSequenceClassification.from_pretrained(args.model_path)
    model.to(device)

    df = pd.read_csv(args.test_path)
    texts = df["text"].fillna("").tolist()

    print("Generating predictions...")
    predictions = predict_batch(texts, model, tokenizer, device)
    df["predicted_label"] = predictions

    if "label" in df.columns:
        y_true = df["label"].astype(int).tolist()
        y_pred = predictions

        macro_f1 = f1_score(y_true, y_pred, average="macro")
        print(f"\n{'='*50}")
        print(f"MACRO F1 SCORE: {macro_f1:.4f}")
        print(f"{'='*50}\n")

        print("Classification Report:")
        print(
            classification_report(
                y_true, y_pred, target_names=["Негативный", "Нейтральный", "Позитивный"]
            )
        )

        print("\nConfusion Matrix:")
        print(confusion_matrix(y_true, y_pred))

        with open(args.output_report, "w", encoding="utf-8") as f:
            f.write(f"Macro F1 Score: {macro_f1:.4f}\n\n")
            f.write("Classification Report:\n")
            f.write(
                classification_report(
                    y_true,
                    y_pred,
                    target_names=["Негативный", "Нейтральный", "Позитивный"],
                )
            )
            f.write(f"\nConfusion Matrix:\n{confusion_matrix(y_true, y_pred)}")

    output_path = args.test_path.replace(".csv", "_predictions.csv")
    df.to_csv(output_path, index=False)
    print(f"\nPredictions saved to: {output_path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--model_path", type=str, required=True)
    parser.add_argument("--test_path", type=str, required=True)
    parser.add_argument("--output_report", type=str, default="metrics_report.txt")
    args = parser.parse_args()
    main(args)
