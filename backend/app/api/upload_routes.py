import logging
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from backend.app.database.session import get_db
from backend.app.schemas.upload import UploadedFileResponse
from backend.app.services.upload_service import UploadService

logger = logging.getLogger("api.upload_routes")
router = APIRouter(tags=["Uploads"])


@router.post("/upload", response_model=UploadedFileResponse)
async def upload_file(
    customer_id: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """Upload CRM data, emails, or transcripts to process."""
    try:
        return await UploadService.process_upload(customer_id, file, db)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    except Exception as exc:
        logger.exception("Upload routing error")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Upload failed",
        ) from exc
