import io
import uuid
from typing import Optional

import pandas as pd
from fastapi import APIRouter, BackgroundTasks, File, HTTPException, UploadFile
from fastapi.responses import StreamingResponse

from ..services.ml_service import ml_service

router = APIRouter(prefix="/api", tags=["analysis"])


@router.post("/analyze")
async def analyze_csv(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(400, "Only CSV files are supported")

    content = await file.read()
    try:
        df = pd.read_csv(io.BytesIO(content))
    except Exception as e:
        raise HTTPException(400, f"Invalid CSV: {str(e)}")

    if "text" not in df.columns:
        raise HTTPException(400, "CSV must contain 'text' column")

    task_id = str(uuid.uuid4())
    background_tasks.add_task(ml_service.analyze_dataframe, df, task_id)
    return {"task_id": task_id, "message": "Analysis started"}


@router.get("/results/{task_id}")
async def get_results(task_id: str):
    status = ml_service.get_task_status(task_id)
    if not status:
        raise HTTPException(404, "Task not found")

    if status["status"] == "processing":
        return {
            "status": "processing",
            "progress": status["progress"],
            "total": status["total"],
        }

    df = status.get("result")
    if df is None:
        raise HTTPException(500, "Results not available")

    return {
        "status": "completed",
        "data": df.to_dict(orient="records"),
        "stats": {
            "total": len(df),
            "negative": int((df["label"] == 0).sum()),
            "neutral": int((df["label"] == 1).sum()),
            "positive": int((df["label"] == 2).sum()),
        },
    }


@router.get("/results/{task_id}/download")
async def download_results(task_id: str):
    status = ml_service.get_task_status(task_id)
    if not status or status["status"] != "completed":
        raise HTTPException(404, "Results not ready")

    df = status["result"]
    output = io.StringIO()
    df.to_csv(output, index=False)
    output.seek(0)

    return StreamingResponse(
        io.BytesIO(output.getvalue().encode()),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=results.csv"},
    )


@router.post("/validate")
async def validate_predictions(file: UploadFile = File(...)):
    content = await file.read()
    df = pd.read_csv(io.BytesIO(content))

    if "label" not in df.columns or "true_label" not in df.columns:
        raise HTTPException(400, "CSV must contain 'label' and 'true_label' columns")

    metrics = ml_service.validate(df["true_label"], df["label"])
    return metrics


@router.get("/search")
async def search_texts(task_id: str, query: str, source: Optional[str] = None):
    status = ml_service.get_task_status(task_id)
    if not status or status["status"] != "completed":
        raise HTTPException(404, "Results not ready")

    df = status["result"]
    mask = df["text"].str.contains(query, case=False, na=False)
    if source:
        mask &= df["src"] == source

    return {"results": df[mask].to_dict(orient="records")}


@router.get("/filter")
async def filter_results(
    task_id: str, label: Optional[int] = None, source: Optional[str] = None
):
    status = ml_service.get_task_status(task_id)
    if not status or status["status"] != "completed":
        raise HTTPException(404, "Results not ready")

    df = status["result"]
    if label is not None:
        df = df[df["label"] == label]
    if source and "src" in df.columns:
        df = df[df["src"] == source]

    return {"results": df.to_dict(orient="records")}


@router.patch("/results/{task_id}/correct")
async def manual_correction(task_id: str, text_id: int, new_label: int):
    """Ручная корректировка метки тональности"""
    if new_label not in [0, 1, 2]:
        raise HTTPException(400, "Label must be 0, 1, or 2")

    status = ml_service.get_task_status(task_id)
    if not status or status["status"] != "completed":
        raise HTTPException(404, "Results not ready")

    df = status["result"]
    if text_id < 0 or text_id >= len(df):
        raise HTTPException(404, "Text ID not found")

    df.loc[text_id, "label"] = new_label
    df.loc[text_id, "manually_corrected"] = True
    status["result"] = df

    return {"status": "updated", "text_id": text_id, "new_label": new_label}
