export interface WordCount {
	word: string;
	count: number;
}

export interface DocumentItem {
	id: number;
	filename: string;
	ai_summary?: string;
	upload_date: string;
	file_size: number;
}

export interface UploadResponse {
	id: number;
	filename: string;
	ai_summary?: string;
	fallback_words?: WordCount[];
	status: string;
}

export interface InsightsResponse {
	documents: DocumentItem[];
	total: number;
}


