import json
import os
import time
from datetime import datetime
from typing import Optional

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from decouple import config

from .database import get_db_connection, initialize_database
from .models import DocumentItem, InsightsResponse, UploadResponse
from .pdf_processor import extract_text_from_pdf
from .ai_service import (
	call_sarvam_ai_summary,
	fallback_top_words,
	generate_structured_report,
	generate_generic_insight_report,
)


BASE_DIR = os.path.dirname(__file__)
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Environment variables
ALLOWED_ORIGINS = config("ALLOWED_ORIGINS", default="http://localhost:3000,http://localhost:5173").split(",")
MAX_FILE_SIZE = config("MAX_FILE_SIZE", default=10 * 1024 * 1024, cast=int)

app = FastAPI(title="AI Document Insight Tool")

app.add_middleware(
	CORSMiddleware,
	allow_origins=ALLOWED_ORIGINS,
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
	initialize_database()


@app.post("/upload-resume", response_model=UploadResponse)
async def upload_resume(file: UploadFile = File(...)):
	if not file.filename.lower().endswith(".pdf"):
		raise HTTPException(status_code=400, detail="Only PDF files are supported")

	contents = await file.read()
	file_size = len(contents)
	if file_size > MAX_FILE_SIZE:
		raise HTTPException(status_code=400, detail=f"File too large. Max {MAX_FILE_SIZE // (1024*1024)}MB")

	# Save file to disk with unique name
	unique_name = f"{int(time.time()*1000)}_{file.filename}"
	saved_path = os.path.join(UPLOAD_DIR, unique_name)
	with open(saved_path, "wb") as f:
		f.write(contents)

	# Extract text
	text = extract_text_from_pdf(saved_path)
	if not text:
		raise HTTPException(status_code=422, detail="Unable to extract text from PDF")

	# Call AI service with fallback
	ai_summary: Optional[str] = call_sarvam_ai_summary(text)
	fallback_words = None
	if not ai_summary:
		# Try generic insight report for all documents
		generic_report = generate_generic_insight_report(text)
		ai_summary = generic_report or None
		# If still nothing, try resume-structured heuristic
		if not ai_summary:
			structured = generate_structured_report(text)
			ai_summary = structured or None
			# If still nothing, provide simple keyword fallback
			if not ai_summary:
				fallback_words = fallback_top_words(text)

	# Persist to DB
	with get_db_connection() as conn:
		cursor = conn.cursor()
		cursor.execute(
			"""
			INSERT INTO documents (filename, original_name, file_path, ai_summary, fallback_words, processing_status, file_size)
			VALUES (?, ?, ?, ?, ?, ?, ?)
			""",
			(
				unique_name,
				file.filename,
				saved_path,
				ai_summary,
				json.dumps(fallback_words) if fallback_words else None,
				"completed",
				file_size,
			),
		)
		conn.commit()
		new_id = cursor.lastrowid

	return UploadResponse(
		id=new_id,
		filename=file.filename,
		ai_summary=ai_summary,
		fallback_words=fallback_words,
		status="success",
	)


@app.get("/insights", response_model=InsightsResponse)
def get_insights(limit: int = 10, offset: int = 0):
	with get_db_connection() as conn:
		cursor = conn.cursor()
		cursor.execute("SELECT COUNT(*) FROM documents")
		total = cursor.fetchone()[0]

		cursor.execute(
			"""
			SELECT id, original_name, ai_summary, upload_date, file_size
			FROM documents
			ORDER BY upload_date DESC, id DESC
			LIMIT ? OFFSET ?
			""",
			(limit, offset),
		)
		rows = cursor.fetchall()

		documents = [
			DocumentItem(
				id=row[0],
				filename=row[1],
				ai_summary=row[2],
				upload_date=row[3],
				file_size=row[4] or 0,
			)
			for row in rows
		]

	return InsightsResponse(documents=documents, total=total)


@app.delete("/documents/{doc_id}")
def delete_document(doc_id: int):
	with get_db_connection() as conn:
		cursor = conn.cursor()
		cursor.execute("SELECT file_path FROM documents WHERE id = ?", (doc_id,))
		row = cursor.fetchone()
		if not row:
			raise HTTPException(status_code=404, detail="Document not found")
		file_path = row[0]
		# Delete DB row first
		cursor.execute("DELETE FROM documents WHERE id = ?", (doc_id,))
		conn.commit()
		# Try to remove file from disk
		try:
			if file_path and os.path.exists(file_path):
				os.remove(file_path)
		except Exception:
			pass
	return {"status": "deleted", "id": doc_id}


