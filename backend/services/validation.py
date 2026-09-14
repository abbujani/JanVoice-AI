"""Input boundary checks; uploads are untrusted bytes, not executable content."""
from fastapi import HTTPException, UploadFile
MAX_DOCUMENT_BYTES = 8 * 1024 * 1024
ALLOWED_DOCUMENT_TYPES = {"application/pdf", "image/jpeg", "image/png", "image/webp", "text/plain"}
def validate_question(value: str) -> str:
    value = value.strip()
    if not 8 <= len(value) <= 6000: raise HTTPException(422, "Please enter between 8 and 6,000 characters.")
    return value
def _matches_signature(data: bytes, content_type: str) -> bool:
    if content_type == "application/pdf": return data.startswith(b"%PDF-")
    if content_type == "image/jpeg": return data.startswith(b"\xff\xd8\xff")
    if content_type == "image/png": return data.startswith(b"\x89PNG\r\n\x1a\n")
    if content_type == "image/webp": return data.startswith(b"RIFF") and data[8:12] == b"WEBP"
    if content_type == "text/plain": return b"\x00" not in data[:4096]
    return False
async def validate_document(upload: UploadFile) -> bytes:
    if upload.content_type not in ALLOWED_DOCUMENT_TYPES: raise HTTPException(415, "Supported files are PDF, PNG, JPEG, WebP, and text files.")
    data = await upload.read(MAX_DOCUMENT_BYTES + 1)
    if not data or len(data) > MAX_DOCUMENT_BYTES: raise HTTPException(413, "Document must be no larger than 8 MB.")
    if not _matches_signature(data, upload.content_type): raise HTTPException(415, "The file content does not match its declared type.")
    return data
