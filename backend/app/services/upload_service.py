import os
import logging
import time
from sqlalchemy.orm import Session
from fastapi import UploadFile

from backend.app.core.config import settings
from backend.app.core.exceptions import InvalidFileFormatException
from backend.app.models.database_models import UploadedFile, Customer, AuditLog

logger = logging.getLogger("services.upload_service")

# Ensure physical upload directory is ready
UPLOAD_DIR = settings.UPLOAD_DIR
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

class UploadService:
    """
    Handles file validations, disk writes, and database recording
    for Transcripts, Emails, and CRM CSV documents.
    """
    
    ALLOWED_EXTENSIONS = {".txt", ".pdf", ".docx", ".csv"}
    
    @staticmethod
    async def process_upload(
        customer_id: int, 
        file: UploadFile, 
        db: Session
    ) -> UploadedFile:
        # Check if customer exists
        customer = db.query(Customer).filter(Customer.id == customer_id).first()
        if not customer:
            raise InvalidFileFormatException(f"Customer with ID {customer_id} does not exist.")
            
        filename = file.filename
        file_ext = os.path.splitext(filename)[1].lower()
        
        # Validate file extensions
        if file_ext not in UploadService.ALLOWED_EXTENSIONS:
            raise InvalidFileFormatException(
                f"File format {file_ext} not supported. "
                f"Allowed formats are: {', '.join(UploadService.ALLOWED_EXTENSIONS)}"
            )
            
        # Determine logical file category
        file_type = "transcript"
        if file_ext == ".csv":
            file_type = "csv"
        elif file_ext == ".docx" or "email" in filename.lower():
            file_type = "email" if "email" in filename.lower() else "transcript"
            
        # Save file to disk
        safe_filename = f"{customer_id}_{int(time.time())}_{filename}"
        target_path = UPLOAD_DIR / safe_filename
        
        file_size = 0
        try:
            contents = await file.read()
            file_size = len(contents)
            with open(target_path, "wb") as f:
                f.write(contents)
            logger.info("File saved to %s", target_path)
        except Exception as e:
            logger.exception("Failed to write uploaded file to disk.")
            raise IOError("Could not save the uploaded file to disk.") from e
            
        # Record upload in Database
        uploaded_file = UploadedFile(
            customer_id=customer_id,
            filename=filename,
            file_type=file_type,
            file_size=file_size,
            file_path=str(target_path.absolute()),
            status="completed"
        )
        db.add(uploaded_file)
        
        # Add Audit Log
        audit = AuditLog(
            user_action="File Uploaded",
            user_name="System",
            details=f"File '{filename}' ({file_type}, {file_size} bytes) uploaded for customer: {customer.name}"
        )
        db.add(audit)
        db.commit()
        db.refresh(uploaded_file)
        
        return uploaded_file
