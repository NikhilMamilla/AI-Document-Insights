from typing import Optional
from PyPDF2 import PdfReader


def extract_text_from_pdf(file_path: str) -> Optional[str]:
	try:
		reader = PdfReader(file_path)
		texts = []
		for page in reader.pages:
			texts.append(page.extract_text() or "")
		return "\n".join(texts).strip()
	except Exception:
		return None


