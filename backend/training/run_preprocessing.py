import argparse
import time
import pandas as pd
from preprocessing import preprocess_text, preprocess_batch


def process_file(input_path, output_path=None, text_column="text", chunk_size=10000):
    print(f"Загрузка файла: {input_path}")
    start_time = time.time()
    
    total_rows = sum(1 for _ in open(input_path, encoding="utf-8")) - 1
    print(f"Всего строк: {total_rows:,}")
    
    processed_chunks = []
    processed_count = 0
    empty_count = 0
    
    for chunk in pd.read_csv(input_path, chunksize=chunk_size):
        if text_column not in chunk.columns:
            raise ValueError(f"Колонка '{text_column}' не найдена. Доступные: {list(chunk.columns)}")
        
        texts = chunk[text_column].fillna("").tolist()
        cleaned = preprocess_batch(texts)
        
        chunk["text_cleaned"] = cleaned
        chunk["is_empty"] = [t == "" for t in cleaned]
        
        empty_count += sum(chunk["is_empty"])
        processed_count += len(chunk)
        
        progress = (processed_count / total_rows) * 100
        print(f"Обработано: {processed_count:,}/{total_rows:,} ({progress:.1f}%)", end="\r")
        
        processed_chunks.append(chunk)
    
    print()
    
    result = pd.concat(processed_chunks, ignore_index=True)
    
    elapsed = time.time() - start_time
    speed = total_rows / elapsed
    
    print(f"\n{'='*50}")
    print(f"РЕЗУЛЬТАТЫ ПРЕДОБРАБОТКИ")
    print(f"{'='*50}")
    print(f"Обработано строк: {total_rows:,}")
    print(f"Пустых после очистки: {empty_count:,} ({empty_count/total_rows*100:.1f}%)")
    print(f"Время: {elapsed:.2f} сек")
    print(f"Скорость: {speed:,.0f} строк/сек")
    
    print(f"\n{'='*50}")
    print("ПРИМЕРЫ ПРЕОБРАЗОВАНИЙ")
    print(f"{'='*50}")
    sample = result.head(10)
    for _, row in sample.iterrows():
        original = str(row[text_column])[:50]
        cleaned = str(row["text_cleaned"])[:50]
        print(f"'{original}' -> '{cleaned}'")
    
    if output_path:
        result.to_csv(output_path, index=False)
        print(f"\nРезультат сохранён: {output_path}")
    
    return result


def main():
    parser = argparse.ArgumentParser(description="Предобработка текстов из CSV файла")
    parser.add_argument("--input", "-i", type=str, required=True, help="Путь к входному CSV файлу")
    parser.add_argument("--output", "-o", type=str, default=None, help="Путь для сохранения результата")
    parser.add_argument("--column", "-c", type=str, default="text", help="Название колонки с текстом")
    parser.add_argument("--chunk", type=int, default=10000, help="Размер чанка для обработки")
    
    args = parser.parse_args()
    
    if not args.output:
        args.output = args.input.replace(".csv", "_preprocessed.csv")
    
    process_file(args.input, args.output, args.column, args.chunk)


if __name__ == "__main__":
    main()
