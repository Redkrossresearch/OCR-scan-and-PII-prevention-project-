import os
import uuid
import shutil
from fastapi import UploadFile

UPLOAD_DIR = "uploads"


def save_uploaded_file(file: UploadFile):

    # Create uploads folder if it doesn't exist
    os.makedirs(UPLOAD_DIR, exist_ok=True)

    # Generate unique filename
    extension = file.filename.split(".")[-1]

    unique_filename = f"{uuid.uuid4()}.{extension}"

    file_path = os.path.join(
        UPLOAD_DIR,
        unique_filename
    )

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return unique_filename