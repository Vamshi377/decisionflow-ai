from pydantic import BaseModel
from datetime import datetime

class UploadedFileResponse(BaseModel):
    id: int
    customer_id: int
    filename: str
    file_type: str  # transcript, email, csv
    file_size: int
    status: str
    uploaded_at: datetime

    class Config:
        from_attributes = True
