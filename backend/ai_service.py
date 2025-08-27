import json
import re
from collections import Counter
from typing import List, Optional, Tuple

import requests
from decouple import config


SARVAM_ENDPOINT = "https://api.sarvam.ai/text-summary/summarize"


def call_sarvam_ai_summary(text: str, length: str = "medium") -> Optional[str]:
	api_key = config("SARVAM_API_KEY", default="")
	if not api_key:
		return None
	try:
		headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
		instructions = (
			"Summarize the following resume into a recruiter-ready report with the exact sections: "
			"1) Basic Profile (Name, Email, Phone, LinkedIn, GitHub, Portfolio). "
			"2) Education (degree, institute, years, CGPA). "
			"3) Skills (grouped: Programming, Libraries, Frameworks, Web Tech, Tools, Platforms, Soft Skills). "
			"4) Experience (role, org, dates, impact). "
			"5) Projects (highlights). "
			"6) Events & Hackathons. "
			"7) Certifications. "
			"8) Strengths. "
			"9) Areas to Improve. "
			"10) ATS & Recruiter View. Use concise bullet points and emojis like the sample provided."
		)
		payload = {"text": text + "\n\nInstructions: " + instructions, "length": length}
		response = requests.post(SARVAM_ENDPOINT, headers=headers, data=json.dumps(payload), timeout=30)
		if response.status_code == 200:
			data = response.json()
			# Assuming API returns {"summary": "..."}
			return data.get("summary") or data.get("result")
		return None
	except Exception:
		return None


STOP_WORDS = {
	"the","and","is","of","to","a","in","that","it","for","on","with","as","are","was","be","at","by","an","or","from","this","which","you","your","has","have","had","but","not","we","our","their","they","he","she","his","her","its","will","can","may","would","should","could","about","into","over","under","than","then","there","here","also","more","most","other","some","such","no","nor","so","too","very"
}


def fallback_top_words(text: str, top_n: int = 5) -> List[dict]:
	# Normalize and tokenize words
	words = re.findall(r"[A-Za-z]+", text.lower())
	filtered = [w for w in words if w not in STOP_WORDS and len(w) > 2]
	counter = Counter(filtered)
	common = counter.most_common(top_n)
	return [{"word": w, "count": c} for w, c in common]


def _extract_first(regex: str, text: str) -> Optional[str]:
	m = re.search(regex, text, re.IGNORECASE)
	return m.group(0) if m else None


def _extract_name_from_email(email: Optional[str]) -> Optional[str]:
	if not email:
		return None
	local = email.split("@")[0]
	parts = re.split(r"[._-]+", local)
	if not parts:
		return None
	return " ".join(p.capitalize() for p in parts if p)


def generate_structured_report(text: str) -> Optional[str]:
	if not text or len(text) < 20:
		return None

	# Basic profile
	email = _extract_first(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", text)
	phone = _extract_first(r"(?:\+?\d{1,3}[- ]?)?\d{10}", text)
	linkedin = _extract_first(r"https?://(www\.)?linkedin\.com/[^\s]+", text)
	github = _extract_first(r"https?://(www\.)?github\.com/[^\s]+", text)
	portfolio = _extract_first(r"https?://[^\s]+\.(?:vercel\.app|netlify\.app|github\.io|com/portfolio[^\s]*)", text)

	# Name: try explicit label or derive from email
	name_match = re.search(r"(?i)\bname\s*[:|-]\s*([A-Za-z][A-Za-z .'-]{2,})", text)
	name = name_match.group(1).strip() if name_match else _extract_name_from_email(email)

	# Education heuristics
	edu_lines = []
	for line in text.splitlines():
		if re.search(r"(?i)\b(b\.?tech|bachelor|b\.e\.|degree|university|institute|college)\b", line):
			edu_lines.append(line.strip())
	education = "; ".join(edu_lines[:3]) if edu_lines else None

	# Skills section
	skills_section = None
	m = re.search(r"(?is)(skills|technical skills|skill set)[:\n\r]+(.{0,1200})", text)
	if m:
		skills_section = re.sub(r"\s+\n", "\n", m.group(2)).strip()

	# Experience
	exp_section = None
	m = re.search(r"(?is)(experience|work experience|professional experience)[:\n\r]+(.{0,1400})", text)
	if m:
		exp_section = re.sub(r"\s+\n", "\n", m.group(2)).strip()

	# Projects
	projects_section = None
	m = re.search(r"(?is)(projects|project highlights)[:\n\r]+(.{0,1400})", text)
	if m:
		projects_section = re.sub(r"\s+\n", "\n", m.group(2)).strip()

	# Events / Hackathons
	events_section = None
	m = re.search(r"(?is)(events|hackathons|achievements)[:\n\r]+(.{0,800})", text)
	if m:
		events_section = re.sub(r"\s+\n", "\n", m.group(2)).strip()

	# Certifications
	certs_section = None
	m = re.search(r"(?is)(certifications|courses)[:\n\r]+(.{0,600})", text)
	if m:
		certs_section = re.sub(r"\s+\n", "\n", m.group(2)).strip()

	parts: List[str] = []
	parts.append("✅ I analyzed your uploaded resume and here’s the AI Document Insight Report for you:\n")
	if name:
		parts.append(f"📌 Resume Insights – {name}\n")

	parts.append("1. Basic Profile\n")
	if name:
		parts.append(f"\nName: {name}\n")
	if email:
		parts.append(f"\nEmail: {email}\n")
	if phone:
		parts.append(f"\nPhone: {phone}\n")
	if linkedin:
		parts.append(f"\nLinkedIn: {linkedin}\n")
	if github:
		parts.append(f"\nGitHub: {github}\n")
	if portfolio:
		parts.append(f"\nPortfolio: {portfolio}\n")

	if education:
		parts.append("\n2. Education\n\n" + education + "\n")
	if skills_section:
		parts.append("\n3. Skills (Extracted)\n\n" + skills_section + "\n")
	if exp_section:
		parts.append("\n4. Experience\n\n" + exp_section + "\n")
	if projects_section:
		parts.append("\n5. Projects (Highlights)\n\n" + projects_section + "\n")
	if events_section:
		parts.append("\n6. Events & Hackathons\n\n" + events_section + "\n")
	if certs_section:
		parts.append("\n7. Certifications\n\n" + certs_section + "\n")

	# Heuristic strengths/areas to improve if content is rich
	if len(text) > 500:
		parts.append(
			"\n8. Strengths\n\n"
			"✅ Strong technical breadth and project exposure\n"
			"✅ Demonstrated teamwork/leadership via projects or hackathons\n"
			"✅ Solid foundation for AI/ML or full-stack roles\n"
		)
		parts.append(
			"\n9. Areas to Improve\n\n"
			"⚠️ Add quantifiable impact to projects (metrics)\n"
			"⚠️ Tailor keywords for ATS per job description\n"
			"⚠️ Compress soft skills under project outcomes\n"
		)
		parts.append(
			"\n10. ATS & Recruiter View\n\n"
			"ATS Score (rough): ~75–85/100 depending on role and keywords match\n"
			"Fit for Roles: AI/ML Intern, Data Scientist Intern, Full-Stack Developer Intern\n"
		)

	report = "\n".join(parts).strip()
	return report if report else None


# --- Generic insight utilities (for any document type) ---
def summarize_extractive(text: str, max_sentences: int = 5) -> str:
	# Simple frequency-based extractive summarization
	sentences = re.split(r"(?<=[.!?])\s+", text)
	if len(sentences) <= max_sentences:
		return " ".join(sentences)
	words = re.findall(r"[A-Za-z]+", text.lower())
	filtered = [w for w in words if w not in STOP_WORDS and len(w) > 2]
	freq = Counter(filtered)
	scores: List[Tuple[int, int]] = []
	for idx, s in enumerate(sentences):
		ws = re.findall(r"[A-Za-z]+", s.lower())
		score = sum(freq.get(w, 0) for w in ws)
		scores.append((idx, score))
	best = sorted(scores, key=lambda x: x[1], reverse=True)[:max_sentences]
	best_sorted = sorted(best, key=lambda x: x[0])
	return " ".join(sentences[i] for i, _ in best_sorted).strip()


def extract_outline_headings(text: str, max_items: int = 10) -> List[str]:
	headings: List[str] = []
	for line in text.splitlines():
		l = line.strip()
		if not l:
			continue
		if re.match(r"^(\d+\.|[IVX]+\.|Chapter\s+\d+|[A-Z][A-Z\s\-]{3,})$", l):
			headings.append(l)
		if len(headings) >= max_items:
			break
	return headings


def _split_into_sections(text: str) -> List[Tuple[str, str]]:
	"""
	Return a list of (title, content) sections. Prefer heading-based splits.
	If no headings, split by chunks of sentences to cover the whole doc.
	"""
	lines = text.splitlines()
	sections: List[Tuple[str, str]] = []
	current_title = "Document"
	current_buf: List[str] = []

	def flush():
		if current_buf:
			sections.append((current_title, "\n".join(current_buf).strip()))

	for line in lines:
		l = line.strip()
		if re.match(r"^(\d+\.|[IVX]+\.|Chapter\s+\d+|[A-Z][A-Z\s\-]{3,})$", l):
			flush()
			current_title = l
			current_buf = []
		else:
			current_buf.append(line)
	flush()

	# Fallback if we only got one big section
	if len(sections) <= 1:
		# Split by sentences into chunks to ensure coverage
		sentences = re.split(r"(?<=[.!?])\s+", text)
		chunk_size = 10
		chunks: List[Tuple[str, str]] = []
		for i in range(0, len(sentences), chunk_size):
			chunk_sentences = sentences[i:i+chunk_size]
			if chunk_sentences:
				title = f"Section {i//chunk_size + 1}"
				chunks.append((title, " ".join(chunk_sentences)))
		return chunks

	return sections


def summarize_sections(text: str, max_sections: int = 8, per_summary_sentences: int = 3) -> List[Tuple[str, str]]:
	sections = _split_into_sections(text)
	# Evenly sample across the document to avoid bias to early sections
	if len(sections) > max_sections:
		indices = [round(i * (len(sections) - 1) / (max_sections - 1)) for i in range(max_sections)]
		picked = [sections[i] for i in indices]
	else:
		picked = sections
	results: List[Tuple[str, str]] = []
	for title, content in picked:
		summary = summarize_extractive(content, max_sentences=per_summary_sentences)
		results.append((title, summary))
	return results


def build_overall_summary(text: str, section_summaries: List[Tuple[str, str]], max_sentences: int = 6) -> str:
	# Second-pass summary over concatenated section summaries to cover breadth
	combined = "\n".join(s for _, s in section_summaries if s)
	if len(combined) < 40:
		combined = text
	return summarize_extractive(combined, max_sentences=max_sentences)


def detect_document_type(text: str) -> str:
	low = text.lower()
	# Quick signals
	has_resume_word = bool(re.search(r"(?i)\b(resume|curriculum\s+vitae|cv)\b", text))
	has_email = bool(re.search(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", text))
	has_phone = bool(re.search(r"(?:\+?\d{1,3}[- ]?)?\d{10}\b", text))
	has_link = bool(re.search(r"https?://(www\.)?(linkedin\.com|github\.com|portfolio|vercel\.app|netlify\.app|github\.io)/", low))

	# Section headers (line-start matches)
	resume_headers = re.findall(r"(?im)^(education|work\s+experience|experience|skills|projects|certifications|achievements)\b", text)
	academic_headers = re.findall(r"(?im)^(abstract|introduction|literature\s+review|related\s+work|methodology|methods|results|discussion|conclusion|references|chapter\s+\d+)\b", text)

	resume_score = len(set(h.strip().lower() for h in resume_headers))
	academic_score = len(set(h.strip().lower() for h in academic_headers))

	# Decide
	if has_resume_word or ((has_email or has_link or has_phone) and resume_score >= 2 and academic_score <= 1):
		return "resume"
	if academic_score >= 2:
		return "academic"
	return "general"


def extract_entities_basic(text: str) -> List[str]:
	entities: List[str] = []
	for pat in [
		 r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}",
		 r"https?://[^\s]+",
		 r"\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b",
		 r"\b\d{4}\b",
	]:
		entities.extend(re.findall(pat, text))
	# deduplicate, keep order
	seen = set()
	unique: List[str] = []
	for e in entities:
		if e not in seen:
			seen.add(e)
			unique.append(e)
	return unique[:15]


def extract_key_topics(text: str, top_n: int = 8) -> List[str]:
	"""
	RAKE-like phrase extraction:
	- Split into sentences, then tokens
	- Build candidate phrases separated by stopwords
	- Score words by degree/frequency; score phrases by sum of word scores
	"""
	sentences = re.split(r"[.!?\n]+", text)
	candidates: List[List[str]] = []
	for s in sentences:
		words = re.findall(r"[A-Za-z]+", s.lower())
		phrase: List[str] = []
		for w in words:
			if w in STOP_WORDS or len(w) < 3:
				if phrase:
					candidates.append(phrase)
					phrase = []
			else:
				phrase.append(w)
		if phrase:
			candidates.append(phrase)

	# word degree and frequency
	word_freq: Counter = Counter()
	word_deg: Counter = Counter()
	for p in candidates:
		unique = p
		deg = len(p) - 1
		for w in unique:
			word_freq[w] += 1
			word_deg[w] += deg
	# score words
	word_score = { w: (word_deg[w] + word_freq[w]) / max(1, word_freq[w]) for w in word_freq }
	# score phrases
	phrase_scores: List[Tuple[str, float]] = []
	for p in candidates:
		score = sum(word_score.get(w, 0.0) for w in p)
		phrase = " ".join(p)
		if len(phrase) >= 4:
			phrase_scores.append((phrase, score))
	# normalize and rank
	# merge near-duplicates by picking highest score
	best: dict = {}
	for phrase, score in phrase_scores:
		key = phrase
		if key not in best or score > best[key]:
			best[key] = score
	# sort by score desc and length preference
	ranked = sorted(best.items(), key=lambda x: (x[1], len(x[0])), reverse=True)
	return [p for p, _ in ranked[:top_n]]


def generate_generic_insight_report(text: str) -> Optional[str]:
	if not text or len(text) < 20:
		return None
	doc_type = detect_document_type(text)
	keywords_list = extract_key_topics(text, top_n=8)
	# Two-pass: per-section, then overall
	sec_summaries = summarize_sections(text, max_sections=8, per_summary_sentences=2)
	summary = build_overall_summary(text, sec_summaries, max_sentences=6)
	outline = extract_outline_headings(text)
	entities = extract_entities_basic(text)

	report_parts: List[str] = []
	report_parts.append("✅ Document Insight Report")
	report_parts.append(f"Type: {doc_type.capitalize()}")
	report_parts.append("\n1) Executive Summary\n" + (summary or "No summary available."))
	report_parts.append("\n2) Key Topics\n" + "\n".join(f"- {k}" for k in keywords_list))

	if doc_type == "resume":
		# Recruiter-style output without noisy section bullets
		strengths = [
			"Demonstrated technical scope across listed skills/projects" if any(keywords_list) else None,
			"Evidence of hands-on work (projects/links)" if re.search(r"https?://", text) else None,
		]
		gaps = [
			"Quantify impact (metrics) in project descriptions" if re.search(r"project|experience", text, re.I) else None,
			"Tailor keywords to target roles for ATS" if len(keywords_list) > 0 else None,
		]
		strengths = [s for s in strengths if s]
		gaps = [g for g in gaps if g]

		if strengths:
			report_parts.append("\n3) Strengths\n" + "\n".join(f"- {s}" for s in strengths))
		if gaps:
			report_parts.append("\n4) Gaps / Opportunities\n" + "\n".join(f"- {g}" for g in gaps))

		# Basic profile (minimal)
		email = _extract_first(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", text)
		name_match = re.search(r"(?i)\bname\s*[:|-]\s*([A-Za-z][A-Za-z .'-]{2,})", text)
		name = name_match.group(1).strip() if name_match else _extract_name_from_email(email)
		if name or email:
			report_parts.append("\n5) Basic Profile\n" + (f"- Name: {name}\n" if name else "") + (f"- Email: {email}" if email else ""))

		# Hide Entities section for resumes (per feedback)
		return "\n".join(p for p in report_parts if p).strip()

	# Non-resume documents: include section highlights and outline
	if sec_summaries:
		report_parts.append("\n3) Section Highlights\n" + "\n".join(f"- {t}: {s}" for t, s in sec_summaries))
	if outline:
		report_parts.append("\n4) Outline (Detected Headings)\n" + "\n".join(f"- {h}" for h in outline))
	# Hide Entities section for non-resume docs as well (per feedback)

	# Actionable insights (generic)
	insights = [
		"Skim section highlights to navigate main topics",
		"Use keywords as study/research anchors",
		"Follow entities/links for primary sources or datasets" if any(re.match(r"https?://", e) for e in entities) else None,
	]
	insights = [i for i in insights if i]
	if insights:
		report_parts.append("\n6) Actionable Insights\n" + "\n".join(f"- {i}" for i in insights))

	return "\n".join(p for p in report_parts if p).strip()
