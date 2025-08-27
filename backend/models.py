from typing import List, Optional
from pydantic import BaseModel


class WordCount(BaseModel):
	word: str
	count: int


class UploadResponse(BaseModel):
	id: int
	filename: str
	ai_summary: Optional[str] = None
	fallback_words: Optional[List[WordCount]] = None
	status: str


class DocumentItem(BaseModel):
	id: int
	filename: str
	ai_summary: Optional[str] = None
	upload_date: str
	file_size: int


class InsightsResponse(BaseModel):
	documents: List[DocumentItem]
	total: int


